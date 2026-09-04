# Production Dockerfile for Next.js Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source
COPY . .

# Build arguments
ARG NEXT_PUBLIC_API_URL=http://localhost:4000

# Build Next.js app with environment variables
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy node_modules and built app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
