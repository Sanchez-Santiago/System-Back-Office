// src/main.ts
import { Application } from "oak";
import { config } from "dotenv";
import routerHome from "./router/HomeRouter.ts";
import client from "./db/MySQL.ts"; // importamos el cliente conectado

config({ export: true });

const app = new Application();
const PORT = Number(Deno.env.get("PORT")) || 8000;

app.use(routerHome.routes());
app.use(routerHome.allowedMethods());

console.log(`Servidor corriendo en http://localhost:${PORT}`);

// Ejemplo de uso de la DB
const users = await client.query("SELECT * FROM usuario");
console.log("Usuarios:", users);

await app.listen({ port: PORT });
