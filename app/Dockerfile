FROM node:20-bullseye-slim

ARG $CWD

WORKDIR /usr/src/app

COPY $CWD/package.json .

RUN npm install

COPY $CWD/ .

RUN npm run build

CMD npm start -- -p $PORT
