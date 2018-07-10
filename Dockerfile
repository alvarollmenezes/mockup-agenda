FROM node:8-alpine

# add project to build
COPY . /var/www
WORKDIR /var/www
RUN npm install

ENV PORT 80

EXPOSE 80

USER node

CMD ["npm", "start"]