# Build de dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Imagem final
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
USER nodejs
EXPOSE 3000
CMD ["node", "src/server.js"]
