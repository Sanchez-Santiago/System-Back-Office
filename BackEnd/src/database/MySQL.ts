// database/MySQL.ts
import { Client } from "mysql";
import { config } from "dotenv";

config({ export: true });

// ✅ Intentar usar variables de Clever Cloud primero, luego las personalizadas
const dbHost = Deno.env.get("MYSQL_ADDON_HOST") || Deno.env.get("DB_HOST");
const dbUser = Deno.env.get("MYSQL_ADDON_USER") || Deno.env.get("DB_USER");
const dbPassword = Deno.env.get("MYSQL_ADDON_PASSWORD") ||
  Deno.env.get("DB_PASSWORD");
const dbName = Deno.env.get("MYSQL_ADDON_DB") || Deno.env.get("DB_NAME");
const dbPort = Deno.env.get("MYSQL_ADDON_PORT") || Deno.env.get("DB_PORT");

if (!dbHost || !dbUser || !dbPassword || !dbName) {
  throw new Error("❌ Faltan variables de entorno de base de datos");
}

console.log("🔄 Conectando a MySQL...");
console.log("Host:", dbHost);
console.log("User:", dbUser);
console.log("Database:", dbName);
console.log("Port:", dbPort || 3306);

const client = await new Client().connect({
  hostname: dbHost,
  username: dbUser,
  password: dbPassword,
  db: dbName,
  port: Number(dbPort) || 3306,
  poolSize: 3,
  timeout: 10000,
});

console.log("✅ Conexión a la base de datos establecida");

export default client;
