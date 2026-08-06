# =====================================================
# Al-Manan Frontend — Dockerfile for Railway
# =====================================================

# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runtime

# Copy built Angular app
COPY --from=build /app/dist/al-manan-frontend/browser /usr/share/nginx/html

# Copy nginx template — Railway injects $PORT at runtime
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Railway sets PORT env var — envsubst will replace $PORT in template
ENV PORT=8080

EXPOSE 8080

CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
