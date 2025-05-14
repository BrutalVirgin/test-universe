FROM node:18

WORKDIR /app

COPY ./prisma ./prisma
COPY package*.json ./

COPY .env ./prisma/env

RUN npm install

CMD ["npx", "prisma", "migrate", "deploy"]
