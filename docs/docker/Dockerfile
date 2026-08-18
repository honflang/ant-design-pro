# --- Build Stage ---
# FROM node:24-alpine AS builder
# WORKDIR /app
# COPY ant-design-pro/package*.json ./
# RUN npm install && npm ls cross-env

# --- Production Stage ---
FROM node:24-alpine
WORKDIR /app
# ENV NODE_ENV=production
COPY ant-design-pro/ ./
# COPY --from=builder /app/node_modules ./

EXPOSE 9000
CMD ["npm", "start"]