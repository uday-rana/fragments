#######################################
#
# Dependency Installation Stage
#
#######################################

# Use node version 20.18.0 with alpine 3.20
FROM node:20.18.0-alpine3.20@sha256:c13b26e7e602ef2f1074aef304ce6e9b7dd284c419b35d89fcf3cc8e44a8def9 \
  AS installation_stage

# We set labels so they are inherited by later stages
LABEL author="Uday Rana <uday7453@gmail.com>" \
  description="Fragments node.js microservice"

# Tell node & npm to perform production environment optimizations
ENV NODE_ENV=production

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
COPY package.json package-lock.json ./

# Install node production dependencies defined in package-lock.json
# Since we set NODE_ENV=production, we don't need to use --production
# https://docs.npmjs.com/cli/v10/commands/npm-ci#omit
RUN npm ci

#######################################
#
# Execution Stage
#
#######################################

# Use node version 20.18.0 with alpine 3.20
FROM node:20.18.0-alpine3.20@sha256:c13b26e7e602ef2f1074aef304ce6e9b7dd284c419b35d89fcf3cc8e44a8def9 \
  AS execution_stage
  
# We default to use port 8080 in our service
ENV PORT=8080

ENV NODE_ENV=production

WORKDIR /app

# Execute RUNs and COPYs In order of least frequent to most frequent changes to each layer

# Copy our HTPASSWD file from the build context
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Install curl to run a health check on the API
# Don't need to update/upgrade when using --no-cache
# https://github.com/gliderlabs/docker-alpine/blob/master/docs/usage.md#disabling-cache
# hadolint ignore=DL3018
RUN apk add --no-cache curl

# Copy package.json from the build context (the app imports data from it)
COPY --chown=node:node package.json ./

# Copy node_modules from the dependency installation stage and
# change ownership to the least-privileged user
COPY --from=installation_stage --chown=node:node /app/node_modules ./node_modules

# Copy src to /app/src/ from the build context
COPY --chown=node:node ./src ./src

# Switch to the least-privileged user
# USER node

# Start the container by running our server
CMD ["node", "src/index.js"]

# We run our service on port 8080
# (This does nothing it's just for documentation)
EXPOSE 8080

# Define a health check so Docker can test whether the container is healthy
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:${PORT}/ || exit 1
