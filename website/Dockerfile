# Stage 1: Build the Nuxt app
FROM node:18.19.0 AS build

# Set working directory
WORKDIR /app

# Clone nuxt-skeleton repo
RUN git clone https://mmb.irbbarcelona.org/gitlab/gbayarri/nuxt-skeleton.git

# Define environment variables
ARG DB_HOST
ARG DB_PORT
ARG DB_DATABASE
ARG DB_AUTHSOURCE
ARG WEBSITE_INNER_PORT
ARG WEBSITE_DB_LOGIN
ARG WEBSITE_DB_PASSWORD
ARG WEBSITE_BASE_URL_DEVELOPMENT
ARG WEBSITE_BASE_URL_STAGING
ARG WEBSITE_BASE_URL_PRODUCTION
ARG WEBSITE_CUSTOM

# Create .env file with environment variables
RUN echo "DB_HOST=${DB_HOST}" > /app/nuxt-skeleton/.env && \
    echo "DB_PORT=${DB_PORT}" >> /app/nuxt-skeleton/.env && \
    echo "DB_DATABASE=${DB_DATABASE}" >> /app/nuxt-skeleton/.env && \
    echo "DB_AUTHSOURCE=${DB_AUTHSOURCE}" >> /app/nuxt-skeleton/.env && \
    echo "DB_LOGIN=${WEBSITE_DB_LOGIN}" >> /app/nuxt-skeleton/.env && \
    echo "DB_PASSWORD=${WEBSITE_DB_PASSWORD}" >> /app/nuxt-skeleton/.env && \
    echo "BASE_URL_DEVELOPMENT=${WEBSITE_BASE_URL_DEVELOPMENT}" >> /app/nuxt-skeleton/.env && \
    echo "BASE_URL_STAGING=${WEBSITE_BASE_URL_STAGING}" >> /app/nuxt-skeleton/.env && \
    echo "BASE_URL_PRODUCTION=${WEBSITE_BASE_URL_PRODUCTION}" >> /app/nuxt-skeleton/.env && \
    echo "CUSTOM=${WEBSITE_CUSTOM}" >> /app/nuxt-skeleton/.env

# Copy the config folder into the Docker image (if exists)
RUN mkdir -p /app/nuxt-skeleton/config
COPY conf*g /app/nuxt-skeleton/config

# Change working directory to /app/nuxt-skeleton
WORKDIR /app/nuxt-skeleton

# Install dependencies
RUN npm install

# Build website in production
RUN npm run build:production

# Stage 2: Serve the Nuxt app with pm2
FROM alpine:latest

# Install necessary packages
RUN apk --no-cache add nodejs npm 

# Install pm2
RUN npm install pm2 -g

# Set working directory
WORKDIR /app

# Copy the built Nuxt app from the previous stage
COPY --from=build /app/nuxt-skeleton/.output /app/.output

# Copy the pm2 configuration file
COPY ecosystem.config.cjs .

# Expose the port the app runs on
EXPOSE ${WEBSITE_INNER_PORT}

# Serve the app
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--name", "nuxt-skeleton"]
