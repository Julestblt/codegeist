import dotenv from "dotenv";
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import apiRoutes from "./routes/routes";
import cors from "@fastify/cors";
import { authMiddleware } from "./middleware/auth.middleware";

dotenv.config();

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(websocket);

  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  });

  const publicRoutes = ["/api/v1/health"];

  await app.register(
    async function (fastify) {
      fastify.addHook("preHandler", async (request, reply) => {
        if (publicRoutes.includes(request.url)) {
          return;
        }

        await authMiddleware(request, reply);
      });

      await fastify.register(apiRoutes);
    },
    { prefix: "/api/v1" }
  );

  try {
    await app.listen({ port: 8080, host: "0.0.0.0" });
    console.log("▶ API online → http://localhost:8080/api/v1/health");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
