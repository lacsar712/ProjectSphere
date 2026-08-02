FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p uploads/profiles uploads/documents uploads/presentations uploads/code uploads/misc

EXPOSE 5000

CMD ["sh", "-c", "node seed.js && node index.js"]
