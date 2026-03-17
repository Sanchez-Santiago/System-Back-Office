// database/MySQL.ts
import mysql from "mysql2/promise";
import { logger } from "../../Utils/logger.ts";

const dbHost = process.env.MYSQL_ADDON_HOST || process.env.DB_HOST;
const dbUser = process.env.MYSQL_ADDON_USER || process.env.DB_USER;
const dbPassword = process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD;
const dbName = process.env.MYSQL_ADDON_DB || process.env.DB_NAME;
const dbPort = process.env.MYSQL_ADDON_PORT || process.env.DB_PORT;

if (!dbHost || !dbUser || !dbPassword || !dbName) {
  throw new Error("❌ Faltan variables de entorno de la base de datos");
}

let client: mysql.Pool;

try {
  logger.info("Conectando a MySQL...");
  logger.debug("Host:", dbHost);
  console.log("User:", dbUser);
  logger.debug("Database:", dbName);
  console.log("Port:", dbPort || 3306);

  client = mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    port: Number(dbPort) || 3306,
    waitForConnections: true,
    connectionLimit: 3,
    connectTimeout: 10000,
  });

  console.log("✅ Conexión a la base de datos establecida");
} catch (error) {
  console.error("❌ Error al conectar a MySQL");
  console.error(error);
  throw new Error("No se pudo establecer conexión con la base de datos");
}

export default client;
