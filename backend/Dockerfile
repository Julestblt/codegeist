FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/prisma       ./prisma

ENV NODE_ENV=production
EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
