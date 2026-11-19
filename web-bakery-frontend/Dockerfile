# Stage 1: Build Frontend SPA
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Hardened Production Server with Non-Root Nginx
FROM nginxinc/nginx-unprivileged:alpine

USER root
RUN rm -rf /usr/share/nginx/html/*
USER nginx

# Copy build artifacts from builder stage with unprivileged ownership
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA client routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Default unprivileged port is 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
