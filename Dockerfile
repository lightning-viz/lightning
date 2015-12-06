FROM node:0.10

MAINTAINER Lighning Viz <info@lightning-viz.org>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app/

RUN npm run build
RUN npm run fetch-visualizations

EXPOSE 3000

CMD ["npm","start"]