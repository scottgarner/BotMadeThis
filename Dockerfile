FROM node:18

# Web

# Create app directory
WORKDIR /usr/src/app/web

# Install app dependencies
COPY web/package*.json ./

# RUN npm install
RUN npm ci --only=production

# Bundle app source
COPY web/. .

CMD [ "npm", "build" ]

# Server

EXPOSE 8077

# Create app directory
WORKDIR /usr/src/app/server

# Install app dependencies
COPY server/package*.json ./

# RUN npm install
RUN npm ci --only=production

# Bundle app source
COPY server/. .

CMD [ "npm", "start" ]