import IORedis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "@/utils/env";

export const redis = new IORedis({
  host: REDIS_HOST ?? "127.0.0.1",
  port: Number(REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
});
