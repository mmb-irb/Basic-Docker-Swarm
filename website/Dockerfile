# Stage 1: Build the Nuxt app
FROM node:18.19.0 AS build

# Set working directory
WORKDIR /app

# Clone nuxt-skeleton repo
RUN git clone https://mmb.irbbarcelona.org/gitlab/gbayarri/nuxt-skeleton.git

# Copy the .env file into the Docker image
COPY .env /app/nuxt-skeleton

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
EXPOSE 3001

# Serve the app
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--name", "nuxt-skeleton"]
