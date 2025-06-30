# Multi-stage build for production optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY hardhat.config.ts ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/scripts ./scripts

# Copy additional files needed for runtime
COPY hardhat.config.ts ./

# Create directories for runtime data
RUN mkdir -p deployments logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4012

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4012/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "build/app.js"]

# Development stage (optional)
FROM node:18-alpine AS development

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY hardhat.config.ts ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 4012

# Start in development mode
CMD ["npm", "run", "dev"] 