# WHY node:18-alpine? Alpine Linux is a tiny, secure base image (~5MB vs ~900MB for full Ubuntu).
# For production, smaller = faster to pull, less attack surface.
FROM node:18-alpine

# WHY /app? It's the standard working directory convention inside containers.
WORKDIR /app

# WHY copy package.json FIRST before the rest of the code?
# Docker builds in layers. If package.json hasn't changed, Docker reuses the cached
# npm install layer — making rebuilds much faster. This is a key Docker optimization.
COPY package.json .
RUN npm install --production

# NOW copy the rest of the code
COPY . .

# Document that this container listens on port 5000
EXPOSE 5000

# The command that runs when the container starts
CMD ["node", "server.js"]