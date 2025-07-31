FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY firebase-service-account.json ./firebase-service-account.json
COPY . .

EXPOSE 3000

CMD ["npm", "start"]