import { NextResponse } from "next/server";
import { supabaseServiceRole } from "@/libs/supabase-client";

export async function GET() {
  try {
    console.log("=== SUPABASE DEBUG ===");
    console.log(
      "SERVICE_ROLE_KEY exists:",
      !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    );
    console.log(
      "SERVICE_ROLE_KEY length:",
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.length,
    );
    console.log(
      "SERVICE_ROLE_KEY first 20 chars:",
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20),
    );
    console.log(
      "NEXT_PUBLIC version exists:",
      !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    );
    const { data: requests, error } = await supabaseServiceRole
      .from("registration_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== SUPABASE DEBUG ===");
    console.log(
      "SERVICE_ROLE_KEY exists:",
      !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    );
    console.log(
      "SERVICE_ROLE_KEY length:",
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.length,
    );
    console.log(
      "SERVICE_ROLE_KEY first 20 chars:",
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20),
    );
    console.log(
      "NEXT_PUBLIC version exists:",
      !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    );

    const body = await request.json();
    const { email, name, team_sale } = body;

    if (!email) {
      return NextResponse.json({ error: "Email là bắt buộc" }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 },
      );
    }

    // Check if already exists in allowed_users
    const { data: existingUser } = await supabaseServiceRole
      .from("allowed_users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được cấp quyền" },
        { status: 409 },
      );
    }

    // Check if request already exists
    const { data: existingRequest } = await supabaseServiceRole
      .from("registration_requests")
      .select("id, status")
      .eq("email", email)
      .single();

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return NextResponse.json(
          { error: "Yêu cầu đăng ký đang chờ xử lý" },
          { status: 409 },
        );
      }
      if (existingRequest.status === "approved") {
        return NextResponse.json(
          { error: "Email này đã được phê duyệt" },
          { status: 409 },
        );
      }
    }

    // Create or update request
    const { data: requestData, error } = await supabaseServiceRole
      .from("registration_requests")
      .upsert({
        email,
        name: name || null,
        team_sale: team_sale || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(requestData, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
