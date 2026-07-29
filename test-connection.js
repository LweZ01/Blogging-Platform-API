const supabase = require("./src/config/supabaseClient");

async function testConnection() {
  const { data, error } = await supabase.from("posts").select("*").limit(1);

  if (error) {
    console.error("❌ Error de conexión:", error.message);
    return;
  }

  console.log("✅ Conexión exitosa. Datos de prueba:", data);
}

testConnection();
