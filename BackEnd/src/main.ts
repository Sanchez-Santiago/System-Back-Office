// src/main.ts
import { Application } from "oak";
import { config } from "dotenv";
import routerHome from "./router/HomeRouter.ts";

config({ export: true });

const app = new Application();
const PORT = Number(Deno.env.get("PORT")) || 8000;

app.use(routerHome.routes());
app.use(routerHome.allowedMethods());

console.log(`Servidor corriendo en http://localhost:${PORT}`);
await app.listen({ port: PORT });
