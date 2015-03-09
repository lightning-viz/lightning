FROM node:0.10-onbuild

MAINTAINER Rion Dooley <dooley@tacc.utexas.edu>

RUN npm install -g gulp
RUN npm install
RUN gulp build

EXPOSE 3000
