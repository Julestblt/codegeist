import { PrismaClient } from "@prisma/client";
import { NODE_ENV } from "../utils/env";
import "../utils/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error"],
  });

if (NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
