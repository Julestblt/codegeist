import Fastify from "fastify";
import websocket from "@fastify/websocket";
import apiRoutes from "./routes/routes";
import cors from "@fastify/cors";

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(websocket);
  app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  });

  await app.register(apiRoutes, { prefix: "/api/v1" });

  await app.listen({ port: 8080, host: "0.0.0.0" });
  console.log("▶ API online → http://localhost:8080/api/v1/health");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
