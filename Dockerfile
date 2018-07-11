FROM node:8-alpine

# add project to build
COPY . /var/www
WORKDIR /var/www
RUN npm install

EXPOSE 4242

USER node

CMD ["npm", "start"]