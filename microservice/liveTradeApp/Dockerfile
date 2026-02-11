# Stage 1
FROM node:14.15.4 as node
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod
# Stage 2
FROM nginx:alpine
COPY --from=node /app/dist/tradeApp /usr/share/nginx/htmlFROM node:16-alpine

WORKDIR /front-app

COPY package*.json ./

RUN npm install

# Mentioned exposed port for documentation
EXPOSE 6003

CMD ["npm", "start"]
