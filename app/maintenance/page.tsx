export default function MaintenancePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'VT323', monospace",
        color: "#fff",
        textAlign: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background particles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: "bgMove 20s linear infinite",
        }}
      />

      {/* Glowing orb */}
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,107,0.3) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "pulse 3s ease-in-out infinite",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* OSCAR logo - large and prominent */}
        <div
          style={{
            fontSize: "clamp(4rem, 15vw, 10rem)",
            fontWeight: "bold",
            background: "linear-gradient(180deg, #ff6b6b 0%, #feca57 50%, #ff6b6b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 0 60px rgba(255,107,107,0.5)",
            animation: "glow 2s ease-in-out infinite alternate",
            letterSpacing: "0.2em",
            marginBottom: "1rem",
          }}
        >
          OSCAR
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: "200px",
            height: "4px",
            background: "linear-gradient(90deg, transparent, #feca57, transparent)",
            margin: "0 auto 2rem",
            borderRadius: "2px",
          }}
        />

        {/* Status badge */}
        <div
          style={{
            display: "inline-block",
            padding: "0.5rem 1.5rem",
            background: "rgba(255,107,107,0.2)",
            border: "2px solid #ff6b6b",
            borderRadius: "50px",
            fontSize: "1.2rem",
            color: "#ff6b6b",
            marginBottom: "2rem",
            animation: "blink 1.5s ease-in-out infinite",
          }}
        >
          ⚡ HỆ THỐNG ĐANG BẢO TRÌ
        </div>

        {/* Main message */}
        <h1
          style={{
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            fontWeight: "normal",
            lineHeight: 1.8,
            maxWidth: "700px",
            margin: "0 auto 2rem",
            color: "#e0e0e0",
          }}
        >
          Đây là sản phẩm của team{" "}
          <span style={{ color: "#feca57", fontWeight: "bold" }}>OSCAR</span> - Hà Nội
        </h1>

        {/* Team info */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
            padding: "2rem",
            maxWidth: "500px",
            margin: "0 auto",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <span style={{ color: "#aaa", fontSize: "1rem" }}>👑 Leader</span>
            <div style={{ fontSize: "1.4rem", color: "#fff", marginTop: "0.3rem" }}>
              Hồng Tâm
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <span style={{ color: "#aaa", fontSize: "1rem" }}>👨‍💻 Người phát triển</span>
            <div style={{ fontSize: "1.4rem", color: "#fff", marginTop: "0.3rem" }}>
              Phạm Trọng Tường
            </div>
          </div>

          <div>
            <span style={{ color: "#aaa", fontSize: "1rem" }}>📞 Liên hệ</span>
            <div style={{ fontSize: "1.6rem", color: "#feca57", marginTop: "0.3rem", fontWeight: "bold" }}>
              0981037330
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p
          style={{
            marginTop: "3rem",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          50% { transform: translateX(-50%) scale(1.2); opacity: 0.8; }
        }

        @keyframes glow {
          0% { filter: drop-shadow(0 0 20px rgba(255,107,107,0.5)); }
          100% { filter: drop-shadow(0 0 40px rgba(255,107,107,0.8)); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes bgMove {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
      `}</style>
    </div>
  );
}
