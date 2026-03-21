# 1. Base Image: Cài đặt LibreOffice và Fonts
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-noto-cjk \
    fonts-liberation \
    fonts-dejavu \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# 3. Builder: Nhúng ENV vào Next.js Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- KHAI BÁO BIẾN ENV CHO QUÁ TRÌNH BUILD ---
# Railway sẽ truyền các biến này qua --build-arg
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG GEMINI_API_KEY

# Chuyển ARG thành ENV để Next.js Build nhận diện được
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
# --------------------------------------------

RUN npm run build

# 4. Runner: Image cuối cùng để chạy
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy các file cần thiết
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Note: Trong Next.js 13+ với output: 'standalone', 
# file server.js sẽ được tạo ra trong .next/standalone
# Đảm bảo file next.config.ts của bạn có output: 'standalone'

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
