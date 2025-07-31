FROM node:18

# Crear carpeta de trabajo
WORKDIR /usr/src/app

# Copiar solo package.json primero para aprovechar cache de dependencias
COPY package*.json ./
RUN npm install --production

# Copiar todo el código del proyecto excepto lo de .dockerignore
COPY . .

# Copiar la service account (asegúrate que no esté ignorada)
COPY firebase-service-account.json ./firebase-service-account.json

# Cloud Run usa puerto 8080
EXPOSE 8080

# Comando de inicio
CMD ["npm", "start"]
