FROM node:20-alpine3.17 as base

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

FROM base as production

RUN npm run build

CMD ["npm", "run", "start"]