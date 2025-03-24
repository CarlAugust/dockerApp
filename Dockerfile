FROM node:20

WORKDIR ~/src/dockerApp

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD ["node", "app.js"]