FROM mhart/alpine-node:5.11.1

# add project to build
ADD . /root/mockup-agenda
WORKDIR /root/mockup-agenda
# RUN npm install && \
#     npm -g install gulp-cli && \
#     npm install --dev

EXPOSE 4242

CMD ["node","app.js"]