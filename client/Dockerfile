# Use Node 20 as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Configure pnpm for slow networks
RUN pnpm config set network-timeout 300000
RUN pnpm config set fetch-retries 10
RUN pnpm config set fetch-retry-mintimeout 60000
RUN pnpm config set fetch-retry-maxtimeout 300000

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for building)
RUN pnpm install 

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
