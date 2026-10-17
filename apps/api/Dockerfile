# syntax=docker/dockerfile:1

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace package manifests
COPY package*.json .npmrc* ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Cài đặt dependencies phục vụ build monorepo
RUN npm ci --ignore-scripts

# Sao chép và build shared package
COPY packages/shared ./packages/shared
RUN npm --workspace=@pidecor/shared run build

# Stage 2: Production runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Tạo thư mục uploads và phân quyền cho user non-root (node)
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

# Copy dependencies, built shared package và mã nguồn api
COPY --chown=node:node package*.json .npmrc* ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages/shared ./packages/shared
COPY --chown=node:node apps/api/package*.json ./apps/api/
COPY --chown=node:node apps/api/src ./apps/api/src
COPY --chown=node:node apps/api/database ./apps/api/database
COPY --chown=node:node apps/api/scripts ./apps/api/scripts

WORKDIR /app/apps/api

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

CMD ["node", "src/server.js"]
