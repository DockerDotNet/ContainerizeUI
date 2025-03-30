# Base image with Node.js 22.7 on Alpine
FROM node:22.7-alpine AS builder

# Install required packages and pnpm, then install sass and typescript globally using pnpm
RUN apk add --no-cache \
    bash \
    libc6-compat \
    libstdc++ \
    linux-headers \
    && npm install -g pnpm

# Set the global bin directory for pnpm
ENV PNPM_HOME=/pnpm-global
ENV PATH=$PNPM_HOME:$PATH

RUN pnpm add -g sass typescript

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of your application code
COPY . .

# Build your Vite application
RUN pnpm build

# Nginx stage
FROM nginx:alpine

# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Adds Dynamic ENV Changes
COPY env.sh /docker-entrypoint.d/env.sh

RUN dos2unix /docker-entrypoint.d/env.sh

RUN chmod +x /docker-entrypoint.d/env.sh

# Expose port 80
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
