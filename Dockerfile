FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero (aprovecha caché de Docker)
COPY package.json .
RUN npm install --production

# Copiar el resto del proyecto
COPY server.js .
COPY public/ ./public/

# Crear db.json vacío si no existe (se sobreescribe con volumen en Dokploy)
RUN echo '{}' > db.json

EXPOSE 3000

CMD ["node", "server.js"]
