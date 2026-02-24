const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lwvslnjqvrbgszqifasd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dnNsbmpxdnJiZ3N6cWlmYXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTY2MTIsImV4cCI6MjA4NjkzMjYxMn0.el4bcaH2sgng4MWK_WQK7zaQ21ZLFysnVajOcc7twZ0';

const client = createClient(supabaseUrl, supabaseKey);

async function getAllTables() {
  console.log('📊 Supabase Database Information');
  console.log('===================================\n');
  console.log('Project URL:', supabaseUrl);
  console.log('Project ID: lwvslnjqvrbgszqifasd\n');

  // Lấy dữ liệu từ products table
  const { data: products, error: productsError } = await client
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (productsError) {
    console.log('❌ Error:', productsError.message);
  } else {
    console.log(`📦 Table: products`);
    console.log(`   Total records: ${products.length}\n`);

    if (products.length > 0) {
      // Hiển thị các columns
      const columns = Object.keys(products[0]);
      console.log('   Columns:');
      columns.forEach(col => {
        const value = products[0][col];
        const type = typeof value;
        console.log(`     - ${col}: ${type}`);
      });

      console.log('\n   Sample records (first 5):');
      products.slice(0, 5).forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.name} - ${p.price.toLocaleString()} đ - ${p.category}`);
      });
    }
  }

  // Thử check các tables khác có thể tồn tại
  console.log('\n🔍 Checking for other possible tables...');
  const possibleTables = ['quotations', 'categories', 'users', 'orders'];

  for (const table of possibleTables) {
    try {
      const { data, error } = await client
        .from(table)
        .select('count', { count: 'exact', head: true });

      if (!error) {
        console.log(`   ✅ ${table}: ${data || 0} records`);
      } else {
        console.log(`   ❌ ${table}: ${error.code === '42P01' ? 'Table không tồn tại' : 'Không có quyền truy cập'}`);
      }
    } catch (e) {
      console.log(`   ❌ ${table}: Lỗi kết nối`);
    }
  }
}

getAllTables().catch(console.error).finally(() => process.exit(0));
