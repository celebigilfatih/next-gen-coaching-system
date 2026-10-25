# Build dependencies are isolated from the serving image.
FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci && npm cache clean --force

FROM dependencies AS builder

COPY . .
RUN npm run prisma:generate
RUN npm run build

# Install only serving dependencies. Prisma CLI is an optional peer of
# @prisma/client, so optional packages are omitted as well as dev dependencies.
FROM node:20-alpine AS runtime-dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --omit=optional \
    && npm cache clean --force
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN test -d node_modules/@prisma/client \
    && test ! -d node_modules/prisma \
    && test ! -d node_modules/@prisma/config \
    && test ! -d node_modules/deepmerge-ts \
    && test ! -d node_modules/@nestjs/cli \
    && test ! -d node_modules/jest

# Explicit migration artifact. It has no application source or HTTP entrypoint.
FROM dependencies AS migrator

USER node

ENTRYPOINT ["./node_modules/.bin/prisma", "migrate", "deploy"]

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=runtime-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 4000

USER node

CMD ["node", "dist/main"]
