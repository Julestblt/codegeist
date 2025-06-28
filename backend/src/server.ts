import Fastify from "fastify";
import websocket from "@fastify/websocket";
import apiRoutes from "./routes/routes";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });

await app.register(websocket);
app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
});

await app.register(apiRoutes, { prefix: "/api/v1" });

app
  .listen({ port: 3000 })
  .then(() =>
    console.log("▶ API online → http://localhost:3000/api/v1/health")
  );
