import Fastify from "fastify";
import websocket from "@fastify/websocket";
import apiRoutes from "./routes/routes";

const app = Fastify({ logger: true });

await app.register(websocket);
await app.register(apiRoutes, { prefix: "/api/v1" });

app
  .listen({ port: 3000 })
  .then(() =>
    console.log("▶ API online → http://localhost:3000/api/v1/health")
  );
