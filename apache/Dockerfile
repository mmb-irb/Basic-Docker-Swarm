FROM httpd:2.4

COPY apache-config.conf /usr/local/apache2/conf/conf.d/custom.conf

# Append IncludeOptional directive to the default httpd.conf
RUN echo "IncludeOptional /usr/local/apache2/conf/conf.d/custom.conf" >> /usr/local/apache2/conf/httpd.conf

# Optionally copy SSL certs if needed
# COPY public.pem /etc/ssl/certs/public.pem
# COPY private.key /etc/ssl/private/private.key

EXPOSE 80 443