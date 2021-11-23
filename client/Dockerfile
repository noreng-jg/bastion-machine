FROM node:16.11.0-alpine as development

WORKDIR /app

COPY ./client/package.json .

RUN yarn install

COPY ./client .

CMD ["yarn", "start"]
