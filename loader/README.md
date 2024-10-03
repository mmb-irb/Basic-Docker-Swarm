# Loader

Dockerfile for building a container with a basic loader inside:

https://mmb.irbbarcelona.org/gitlab/gbayarri/loader-base.git

## Dockerfile

```Dockerfile
# Use Alpine Linux as base image
FROM alpine:latest

# Install necessary packages
RUN apk --no-cache add nodejs npm git

# Verify installation
RUN node --version && npm --version && git --version

# Define working dir
WORKDIR /app

# Clone loader repo
RUN git clone https://mmb.irbbarcelona.org/gitlab/gbayarri/loader-base.git

# Define environment variables
ARG DB_HOST
ARG DB_PORT
ARG DB_DATABASE
ARG DB_AUTHSOURCE
ARG LOADER_DB_LOGIN
ARG LOADER_DB_PASSWORD

# Create .env file with environment variables
RUN echo "DB_HOST=${DB_HOST}" > /app/loader-base/.env && \
    echo "DB_PORT=${DB_PORT}" >> /app/loader-base/.env && \
    echo "DB_DATABASE=${DB_DATABASE}" >> /app/loader-base/.env && \
    echo "DB_AUTHSOURCE=${DB_AUTHSOURCE}" >> /app/loader-base/.env && \
    echo "DB_LOGIN=${LOADER_DB_LOGIN}" >> /app/loader-base/.env && \
    echo "DB_PASSWORD=${LOADER_DB_PASSWORD}" >> /app/loader-base/.env

# Change working directory to /app/loader-base
WORKDIR /app/loader-base

# Install packages
RUN npm install

# Update mongodb version to the version of the mongo docker image
# RUN npm i mongodb@6
# Change working directory to /app
WORKDIR /app

# Create the entrypoint script
RUN echo '#!/bin/sh' > entrypoint.sh && \
    echo 'node /app/loader-base/index.js "$@"' >> entrypoint.sh && \
    chmod +x entrypoint.sh

# Set the entrypoint script as the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
```v