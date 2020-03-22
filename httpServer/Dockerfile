FROM node:12

WORKDIR /app

COPY . .
RUN npm install
RUN npm install -g typescript 
RUN tsc

EXPOSE 3000

CMD [ "node", "./build/index.js" ]