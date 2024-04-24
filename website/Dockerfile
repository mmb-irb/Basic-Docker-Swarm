# Use Alpine Linux as base image
FROM alpine:latest

# Install necessary packages
RUN apk --no-cache add nodejs npm git

# Verify installation
RUN node --version && npm --version && git --version

# Define working dir
WORKDIR /app

# Define a directory for the volume
VOLUME /data

# Clone nuxt-skeleton repo
RUN git clone https://mmb.irbbarcelona.org/gitlab/gbayarri/nuxt-skeleton.git

# Copy the .env file into the Docker image
COPY .env /app/nuxt-skeleton

# Change working directory to /app/nuxt-skeleton
WORKDIR /app/nuxt-skeleton

# Install packages
RUN npm install

# Build website in production
RUN npm run build:production

# remove node_modules folder
RUN rm -r node_modules

# Install pm2
RUN npm install pm2 -g

# Copy the pm2 configuration file
COPY ecosystem.config.cjs .

# Expose the port the app runs on
EXPOSE 3001

# Serve the app
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--name", "nuxt-skeleton"]
