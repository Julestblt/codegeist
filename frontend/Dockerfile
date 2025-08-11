FROM oven/bun:alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/.env .env

COPY package.json .

EXPOSE 3000

ENV NODE_ENV=production

USER node

CMD ["node", "build"]
