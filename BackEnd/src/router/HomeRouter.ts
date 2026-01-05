import { Router, Context } from "oak";

type ContextWithParams = Context & { params: Record<string, string> };

const routerHome = new Router();

routerHome.get("/home", (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = { message: "Hola mundo" };
});
routerHome.get("/", (ctx) => {
  ctx.response.body = "Servidor OK";
});

export default routerHome;
