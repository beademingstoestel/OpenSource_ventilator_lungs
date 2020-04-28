FROM node:12

ARG major_version=2
ENV major_version=$major_version

ARG minor_version=0
ENV minor_version=$minor_version

ARG build_number=1
ENV build_number=$build_number

WORKDIR /app

COPY . .
RUN npm version $major_version.$minor_version.$build_number
RUN npm install
RUN npm install -g typescript 
RUN tsc

WORKDIR /app/ui
RUN npm install
RUN npm run build
RUN npm run export
RUN rm -rf node_modules

WORKDIR /app/uiWardOverview
RUN npm install
RUN npm run build
RUN npm run export
RUN rm -rf node_modules

WORKDIR /app

EXPOSE 3001

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

CMD [ "node", "./build/index.js" ]
