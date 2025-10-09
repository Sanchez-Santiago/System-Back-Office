// src/utils/db.ts
import { Client } from "mysql";
import { config } from "dotenv";

config({ export: true });

const client = await new Client().connect({
  hostname: Deno.env.get("HOSTNAME")!,
  username: Deno.env.get("USERNAME")!,
  password: Deno.env.get("PASSWORD")!,
  db: Deno.env.get("DBNAME")!,
  port: 3306,
});

console.log("Conexión a la base de datos establecida");

export default client;
