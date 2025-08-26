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

# Verify the animation file exists in dist
RUN ls -la /app/dist/assets/ || echo "Assets directory not found"
RUN find /app/dist -name "*.json" -type f || echo "No JSON files found"

# Production stage
FROM nginx:alpine as production-stage

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Verify files were copied
RUN ls -la /usr/share/nginx/html/
RUN find /usr/share/nginx/html -name "*.json" -type f || echo "No JSON files found in nginx html"

# Create temp directories for nginx and set proper permissions
RUN mkdir -p /tmp/nginx-client-body /tmp/nginx-proxy /tmp/nginx-fastcgi /tmp/nginx-uwsgi /tmp/nginx-scgi && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /tmp/nginx-* && \
    # Create and set permissions for PID file
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]