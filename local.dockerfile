FROM node:22.16.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start"]