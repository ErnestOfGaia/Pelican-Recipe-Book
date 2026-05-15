# ============================================================
#  Pellito Hub — Production Dockerfile
#  Multi-stage: deps → builder → runner
#  Target: linux/amd64 (Hostinger VPS)
# ============================================================

FROM --platform=linux/amd64 node:22-alpine AS base

# ── Stage 1: install all dependencies ────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: build ───────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: production runner ───────────────────────────────
FROM base AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

RUN mkdir -p .next && chown nextjs:nodejs .next

# Standalone Next.js server bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

# Full node_modules: drizzle-kit (devDep) + serverExternalPackages not bundled by Next.js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules     ./node_modules

# Drizzle config + schema so drizzle-kit push can run at startup
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/db            ./src/db

# Ingest script + brain helpers — invoked inside the container via:
#   docker compose exec pellito-hub npx tsx src/scripts/ingest.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/scripts       ./src/scripts
COPY --from=builder --chown=nextjs:nodejs /app/src/lib           ./src/lib

COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]
