# Stage 1: Build
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

ARG BUILD_ENV
ENV BUILD_ENV=$BUILD_ENV

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy app (.env must be present for Next.js to inline NEXT_PUBLIC_* at build time)
COPY . .
RUN npm run build

# Stage 2: Serve using Node (Next.js standalone)
FROM public.ecr.aws/docker/library/node:22-alpine AS runner

ARG BUILD_ENV
ENV BUILD_ENV=$BUILD_ENV
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
