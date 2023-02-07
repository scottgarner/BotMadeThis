FROM node:18

### Web

# Create app directory
WORKDIR /usr/src/app/web

# Install app dependencies
COPY web/package*.json ./

# RUN npm install
RUN npm ci

# Bundle app source
COPY web/. .

# Build
RUN npm run build

# Remove dev dependencies.
RUN npm prune --production

# Server

# Create app directory
WORKDIR /usr/src/app/server

# Install app dependencies
COPY server/package*.json ./

# RUN npm install
RUN npm ci

# Bundle app source
COPY server/. .

# Build
RUN npm run build

# Remove dev dependencies.
RUN npm prune --production

EXPOSE 8077
CMD [ "npm", "run", "start"]
