# Build stage
FROM node:22-alpine as build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies, if production, use --only=production
# This install ALL dependencies (including devDependencies like vite)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Only set ownership of the web content
RUN chown -R nginx:nginx /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]