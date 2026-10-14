# ==============================================================================
# Multi-Stage Dockerfile for MindFlow (Vite + Express + TypeScript)
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy full source and build production client bundle
COPY . .
RUN npm run build

# Stage 2: Production Server Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3020

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built frontend assets and server entrypoint
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose internal service port
EXPOSE 3020

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3020/ || exit 1

# Start production server using node (Node 22 has built-in TypeScript strip support)
CMD ["node", "server.ts"]
