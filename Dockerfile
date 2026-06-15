# Menggunakan multi-stage build untuk memperkecil ukuran image akhir
FROM node:lts-alpine as build

# Set direktori kerja
WORKDIR /app

# Install pnpm (opsional, karena sebelumnya Anda menggunakan pnpm)
RUN npm install -g pnpm

# Salin file dependencies terlebih dahulu untuk caching layer
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies
RUN if [ -f "pnpm-lock.yaml" ]; then pnpm install --frozen-lockfile; else npm install; fi

# Salin sisa kode aplikasi
COPY . .

# Build aplikasi Nuxt
RUN npm run build

# --- Stage 2: Production Image ---
FROM node:lts-alpine

WORKDIR /app

# Salin hasil build dari stage pertama
COPY --from=build /app/.output ./.output

# Konfigurasi environment variables yang direkomendasikan Nuxt
ENV HOST=0.0.0.0
ENV PORT=3001
ENV NODE_ENV=production

# Expose port yang digunakan
EXPOSE 3001

# Jalankan server
CMD ["node", ".output/server/index.mjs"]
