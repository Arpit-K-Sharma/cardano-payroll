
# Multi-stage build for Next.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY cardano-payroll-frontend/package*.json ./
COPY cardano-payroll-frontend/next.config.ts ./
COPY cardano-payroll-frontend/components.json ./
COPY cardano-payroll-frontend/tsconfig.json ./
COPY cardano-payroll-frontend/postcss.config.mjs ./
COPY cardano-payroll-frontend/tailwindcss.config.mjs ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY cardano-payroll-frontend/ .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Run the application
CMD ["npm", "start"]
