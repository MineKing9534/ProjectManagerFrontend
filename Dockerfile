FROM node:20

WORKDIR /app

COPY . .

RUN npm install

ENV NODE_ENV "production"
RUN npm run build

EXPOSE 1234

ENTRYPOINT [ "node", "server" ]