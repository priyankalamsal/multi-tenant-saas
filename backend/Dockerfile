FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY src ./src
COPY .env .

EXPOSE 5000
CMD ["npm", "start"]
