import path from "node:path";
import { config } from "dotenv";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

config({ path: path.resolve(process.cwd(), envFile) });

export const {
  DATABASE_URL,
  REDIS_URL,
  REDIS_HOST,
  REDIS_PORT,
  ANTHROPIC_API_KEY,
  NODE_ENV,
} = process.env;
