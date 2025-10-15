// src/main.ts
import { Application } from "oak";
import { config } from "dotenv";
import client from "./database/MySQL.ts";
import routerHome from "./router/HomeRouter.ts";
import { authRouter } from "./router/AuthRouter.ts";
import { UsuarioMySQL } from "./model/usuarioMySQL.ts";
import {
  corsMiddleware,
  timingMiddleware,
} from "./middleware/corsMiddlewares.ts";

config({ export: true });

const app = new Application();
const PORT = Number(Deno.env.get("PORT")) || 8000;

const usuario = new UsuarioMySQL(client);

app.use(corsMiddleware);
app.use(timingMiddleware);

app.use(routerHome.routes());
app.use(routerHome.allowedMethods());

app.use(authRouter(usuario).routes());
app.use(authRouter(usuario).allowedMethods());

console.log(`Servidor corriendo en http://localhost:${PORT}`);

await app.listen({ port: PORT });
