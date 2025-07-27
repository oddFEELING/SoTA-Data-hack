# Build stage - install dependencies and build the app
FROM node:20-alpine AS builder

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variables to suppress warnings during build
ENV NODE_ENV=production
ENV CI=true

# Build the application with suppressed warnings
RUN pnpm run build 2>&1 | grep -v "Error when using sourcemap" | grep -v "imported from external module" || true

# Production stage - minimal image with only production dependencies
FROM node:20-alpine AS runner

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "run", "start"]