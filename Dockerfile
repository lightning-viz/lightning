FROM node:0.10

MAINTAINER Lighning Viz <info@lightning-viz.org>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app/
RUN npm install -g gulp
RUN gulp build

EXPOSE 3000

CMD ["npm","start"]