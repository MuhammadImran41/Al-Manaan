# =====================================================
# Al-Manan Frontend — Dockerfile for Railway
# =====================================================

# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build production
COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runtime

# Copy built Angular app
COPY --from=build /app/dist/al-manan-frontend/browser /usr/share/nginx/html

# Nginx config for Angular SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
