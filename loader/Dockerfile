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

# Copy the .env file into the Docker image
COPY .env /app/loader-base

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