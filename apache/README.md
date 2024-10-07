# Apache

The Apache HTTP Server, colloquially called Apache, is a **Web server** application notable for playing a key role in the initial growth of the World Wide Web:

https://hub.docker.com/_/httpd

## Dockerfile

**Uncomment** commented lines for configuring **https**. Be aware of having the **public** and **private** files in the **same folder** where the Dockerfile is:

```Dockerfile
FROM httpd:2.4

# Copy the custom Apache configuration file
COPY apache-config.conf /usr/local/apache2/conf/conf.d/custom.conf

# Define the build arguments
ARG WEBSITE_INNER_PORT
ARG APACHE_HTTP_INNER_PORT
ARG APACHE_HTTPS_INNER_PORT

# Perform search and replace using sed
RUN sed -i "s/WEBSITE_INNER_PORT/${WEBSITE_INNER_PORT}/g" /usr/local/apache2/conf/conf.d/custom.conf

# Append IncludeOptional directive to the default httpd.conf
RUN echo "IncludeOptional /usr/local/apache2/conf/conf.d/custom.conf" >> /usr/local/apache2/conf/httpd.conf

# Create the SSL directory
# RUN mkdir -p /usr/local/apache2/conf/ssl

# Copy SSL certs into the container if needed
# COPY public.pem /usr/local/apache2/conf/ssl/public.pem
# COPY private.key /usr/local/apache2/conf/ssl/private.key

EXPOSE ${APACHE_HTTP_INNER_PORT} ${APACHE_HTTPS_INNER_PORT}
```

## Apache conf file

**Uncomment** commented lines for configuring **https**:

```apache
LoadModule proxy_module /usr/local/apache2/modules/mod_proxy.so
LoadModule proxy_http_module /usr/local/apache2/modules/mod_proxy_http.so
# LoadModule ssl_module /usr/local/apache2/modules/mod_ssl.so

<VirtualHost *:80>
	<Location / >
   		ProxyPass http://website:WEBSITE_INNER_PORT/
   		ProxyPassReverse http://website:WEBSITE_INNER_PORT/
	</Location>
</VirtualHost>

#<VirtualHost *:443>
#    SSLEngine on
#    SSLCertificateFile /etc/ssl/certs/public.pem
#    SSLCertificateKeyFile /etc/ssl/private/private.key
#    SSLCertificateChainFile /etc/ssl/certs/public.pem
#    <Location />
#        ProxyPass http://website:WEBSITE_INNER_PORT/
#        ProxyPassReverse http://website:WEBSITE_INNER_PORT/
#    </Location>
#</VirtualHost>
```