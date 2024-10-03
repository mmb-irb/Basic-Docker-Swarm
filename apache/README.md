# Apache

The Apache HTTP Server, colloquially called Apache, is a **Web server** application notable for playing a key role in the initial growth of the World Wide Web:

https://hub.docker.com/_/httpd

## Dockerfile

```Dockerfile
FROM httpd:2.4

# Copy the custom Apache configuration file
COPY apache-config.conf /usr/local/apache2/conf/conf.d/custom.conf

# Define the build argument
ARG WEBSITE_INNER_PORT

# Perform search and replace using sed
RUN sed -i "s/WEBSITE_INNER_PORT/${WEBSITE_INNER_PORT}/g" /usr/local/apache2/conf/conf.d/custom.conf

# Append IncludeOptional directive to the default httpd.conf
RUN echo "IncludeOptional /usr/local/apache2/conf/conf.d/custom.conf" >> /usr/local/apache2/conf/httpd.conf

# Optionally copy SSL certs if needed
# COPY public.pem /etc/ssl/certs/public.pem
# COPY private.key /etc/ssl/private/private.key

EXPOSE 80 443
```