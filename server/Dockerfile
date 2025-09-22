# Use Node.js LTS version with Alpine for smaller image size
FROM node:18-alpine AS base

# Install dependencies needed for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dependencies needed for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/dist ./dist

# Create uploads directory and data directory
RUN mkdir -p uploads data

# Set proper permissions
RUN chown -R node:node /app
USER node

EXPOSE 3001

CMD ["npm", "start"]