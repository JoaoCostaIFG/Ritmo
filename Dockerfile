FROM node:20-alpine3.17 as base

RUN apk add --no-cache make libtool autoconf automake g++ python3

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npm run build

RUN ls -la

# ----------------------------------------------

FROM node:20-alpine3.17 as production

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules 
COPY --from=base /app/dist ./dist

CMD ["node", "dist/index.js"]
