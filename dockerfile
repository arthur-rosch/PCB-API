FROM node:20-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json", "tsconfig.json", "./"]
RUN npm cache clean --force
RUN npm install
COPY . .

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
