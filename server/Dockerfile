# syntax=docker/dockerfile:1

# Stage 1: Install production dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json .npmrc* ./
RUN npm ci --omit=dev --ignore-scripts

# Stage 2: Runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Tạo thư mục và gán quyền cho user non-root (node) có sẵn trong alpine
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

# Copy dependencies và mã nguồn
COPY --chown=node:node package*.json .npmrc* ./
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node src ./src
COPY --chown=node:node database ./database
COPY --chown=node:node scripts ./scripts

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

CMD ["node", "src/server.js"]
