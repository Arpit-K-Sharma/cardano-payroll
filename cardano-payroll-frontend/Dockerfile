# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./

# Install dependencies
RUN npm ci --production=false


# Copy source code
COPY . .




# Accept build arguments for environment variables
ARG NEXT_PUBLIC_API_BASE_URL=https://api-pay.sireto.net
ARG NEXT_PUBLIC_KUBER_API_URL=https://preprod.kuber.cardanoapi.io
ARG NEXT_PUBLIC_KUBER_API_KEY
ARG NEXT_PUBLIC_COMPANY_WALLET_ADDRESS
ARG NEXT_PUBLIC_CARDANO_NETWORK=preprod

# Ensure all NEXT_PUBLIC_ envs are available at build and runtime
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_KUBER_API_URL=${NEXT_PUBLIC_KUBER_API_URL}
ENV NEXT_PUBLIC_KUBER_API_KEY=${NEXT_PUBLIC_KUBER_API_KEY}
ENV NEXT_PUBLIC_COMPANY_WALLET_ADDRESS=${NEXT_PUBLIC_COMPANY_WALLET_ADDRESS}
ENV NEXT_PUBLIC_CARDANO_NETWORK=${NEXT_PUBLIC_CARDANO_NETWORK}

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js
CMD ["node", "server.js"]