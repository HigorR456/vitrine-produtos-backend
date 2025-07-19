FROM node:22.16.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

RUN npx prisma generate

CMD ["sh", "-c", "npm install && npx prisma migrate reset -f && npm run dev"]