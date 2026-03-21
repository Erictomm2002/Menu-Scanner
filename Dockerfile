# Sử dụng Node.js 20 làm base image
FROM node:20-slim AS base

# Cài đặt LibreOffice và các font chữ hỗ trợ tiếng Việt
RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-noto-cjk \
    fonts-liberation \
    fonts-dejavu \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --- Stage 1: Build dự án ---
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Runtime ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy các file cần thiết từ stage builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Lệnh khởi chạy server
CMD ["npm", "start"]
