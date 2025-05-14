FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./tsconfig.json ./tsconfig.json
COPY .env.* ./
COPY ttk-collector ./ttk-collector
COPY common ./common
COPY prisma ./prisma
COPY nats ./nats
COPY prometheus ./prometheus

RUN npx prisma generate --schema=prisma/schema.prisma

RUN npm run build

FROM node:20 AS development

WORKDIR /app

COPY --from=builder /app ./
RUN npm install

CMD ["node", "dist/ttk-collector/src/main.js"]
