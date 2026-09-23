FROM node:22-alpine AS build
RUN apk add --no-cache openssl && corepack enable && corepack prepare pnpm@11.11.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma
RUN pnpm prisma generate
COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
RUN apk add --no-cache openssl && corepack enable && corepack prepare pnpm@11.11.0 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
EXPOSE 3001
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main"]