import { FastifyRequest, FastifyReply } from "fastify";
import { keycloakService } from "../services/keycloak.service";

declare module "fastify" {
  interface FastifyRequest {
    user?: any;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Main authentication middleware - validates JWT token
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = extractToken(request);

    if (!token) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    const decodedToken = await keycloakService.verifyToken(token);

    request.user = decodedToken;
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error instanceof Error) {
      if (error.message === "Token expired") {
        return reply.code(401).send({
          error: "Unauthorized",
          message: "Token expired",
        });
      }

      if (error.message.includes("invalid signature")) {
        return reply.code(401).send({
          error: "Unauthorized",
          message: "Invalid token signature",
        });
      }
    }

    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid token",
    });
  }
}
