# Podman web services

In this **proof of concept** there are all the files needed for executing the different services for executing a website: **front-end**, **back-end**, **database** and **data loader**. All these services have been integrated into **Podman** containers and connected between them via **Podman** network.

This help contains the instructions for **launching the services** via **Podman**. If you want to launch them via **Dockerfiles**, please [**click here**](via_docker.md). If you want to launch them via **Docker Swarm**, please [**click here**](README.md). If you want to launch them via **docker-compose**, please [**click here**](via-docker-compose.md).

<div align="center" style="display:flex;align-items:center;justify-content:space-around;">
<img src="podman.png" alt="mdposit" />
</div>

## Services description

### Website

Both the front-end and the back-end of the website are integrated in the **same service** using Nuxt 3.

For this proof of concept, the following repo is used:

https://mmb.irbbarcelona.org/gitlab/gbayarri/nuxt-skeleton.git

### Data loader

The data loader is a node **JS script** made for load, list and remove data from a mongodb database.

For this proof of concept, the following repo is used:

https://mmb.irbbarcelona.org/gitlab/gbayarri/loader-base.git

### Database

The database used is **mongodb** inside a docker container:

https://github.com/docker-library/mongo

For this proof of concept, the choosen version of mongo is 6.

## Prepare configuration files

### .env file

⚠️ No sensible default value is provided for any of these fields, they **need to be defined** ⚠️

An `.env` file must be created in the **root** folder. The file [`.env.podman.git`](.env.podman.git) can be taken as an example. The file must contain the following environment variables:

| key              | value   | description                                     |
| ---------------- | ------- | ----------------------------------------------- |
| DOCKER_DEFAULT_PLATFORM         | string  | default platform (architecture and operating system), ie linux/amd64                               |
| &nbsp;
| APACHE_HTTP_OUTER_PORT         | number  | apache outer port for http protocol                                        |
| APACHE_HTTPS_OUTER_PORT         | number  | apache outer port for https protocol                                        |
| APACHE_HTTP_INNER_PORT         | number  | apache inner port for http protocol                                        |
| APACHE_HTTPS_INNER_PORT         | number  | apache inner port for https protocol                                        |
| APACHE_CPU_LIMIT         | string  | apache limit number of CPUs                                        |
| APACHE_MEMORY_LIMIT         | string  | apache limit memory                                        |
| &nbsp;
| LOADER_VOLUME_PATH         | string  | path where the loader will look for files                                        |
| LOADER_CPU_LIMIT      | string  | loader limit number of CPUs                                    |
| LOADER_MEMORY_LIMIT          | string | loader limit memory                           |
| LOADER_DB_LOGIN      | string  | db user for loader                         |
| LOADER_DB_PASSWORD      | string  | db password for loader                       |
| &nbsp;
| WEBSITE_PORT         | number  | website outer port                                        |
| WEBSITE_CPU_LIMIT    | string  | website limit number of CPUs                               |
| WEBSITE_MEMORY_LIMIT    | string  | website limit memory                             |
| WEBSITE_INNER_PORT         | number  | website inner port                                        |
| WEBSITE_DB_LOGIN    | string  | db user for website REST API                               |
| WEBSITE_DB_PASSWORD    | string  | db password for website REST API                               |
| WEBSITE_BASE_URL_DEVELOPMENT    | string  | baseURL for development                               |
| WEBSITE_BASE_URL_STAGING    | string  | baseURL for staging                               |
| WEBSITE_BASE_URL_PRODUCTION    | string  | baseURL for production                               |
| WEBSITE_CUSTOM    | string  | whether or not custom images and styles provided                               |
| &nbsp;
| DB_VOLUME_PATH         | string  | path where the DB will look for files                                        |
| DB_OUTER_PORT         | number  | DB outer port                                        |
| DB_INNER_PORT         | number  | DB inner port                                        |
| DB_CPU_LIMIT      | string  | DB limit number of CPUs                                    |
| DB_MEMORY_LIMIT          | string | DB limit memory                           |
| DB_HOST      | `<url>`  | url of the db server                          |
| DB_DATABASE      | string  | name of the  DB collection                          |
| DB_AUTHSOURCE      | string  | the DB collection the user will attempt to authenticate to                           |
| &nbsp;
| MONGO_INITDB_ROOT_USERNAME      | string  | root user for the DB                         |
| MONGO_INITDB_ROOT_PASSWORD      | string  | root password for the DB                       |

**Important:** the formats of **cpus** and **memory** must be in string format between single quotes. Example:

```
LOADER_VOLUME_PATH=/path/to/loader  # path to volume
LOADER_CPU_LIMIT='4.00'  # cpus in float format
LOADER_MEMORY_LIMIT='2G'  # memory indicating unit (G, M)
```

The **DB_HOST** must be the name of the **stack service** followed by **underscore** and the **name of the service** as defined in the [**docker-compose.yml**](./docker-compose.yml) file (ie _my_stack_mongodb_).

The **DB_DATABASE** and **DB_AUTHSOURCE** must be the same used in the **mongo-init.js** file.

The credentials **LOADER_DB_LOGIN** and **LOADER_DB_PASSWORD** must be the same defined in the **mongo-init.js** file with the **readWrite** role.

The credentials **WEBSITE_DB_LOGIN** and **WEBSITE_DB_PASSWORD** must be the same defined in the **mongo-init.js** file with the **read** role.

If `WEBSITE_CUSTOM=true`, make sure to provide a **/config folder** in the [**website**](website) folder with a **custom.css**, **favicon.ico** and **logo.png** files.

Neither the **WEBSITE_BASE_URL_DEVELOPMENT** nor the **WEBSITE_BASE_URL_STAGING** shouldn't be used when running as a docker service. 

⚠️ The [**website/Dockerfile**](website/Dockerfile) is configured for running the website in **production** mode. This means that it will take **WEBSITE_BASE_URL_PRODUCTION** as **baseURL**. For changing this, please edit the [**website/Dockerfile**](website/Dockerfile) line: `RUN npm run build:production` ⚠️

## Use Podman

For building the services **manually via Podman** instructions, please execute the following steps: 

### Make Podman persistent

Podman is not persistent by default, so some steps must be followed for **making it persistent**:

1) Start the Podman Service:

   ```sh
   systemctl --user enable podman.socket
   systemctl --user start podman.socket
   ```

2) Verify the Service:

    ```sh
    systemctl --user status podman.socket
    ```

3) Enable linger for Your User:

    ```sh
    loginctl enable-linger $USER
    ```

4) Restart the Podman Socket:

    ```sh
    systemctl --user restart podman.socket
    ```

5) Verify Linger Status:

    ```sh
    loginctl show-user $USER | grep Linger
    ```

### Modifications in Dockerfile

A couple of Dockerfile must be modified:

1) In **website/Dockerfile**, comment these two lines:

    ```Dockerfile
    # RUN mkdir -p /app/nuxt-skeleton/config
    # COPY conf*g /app/nuxt-skeleton/config
    ```

2) In **apache/Dockerfile**, change the first line:

    ```Dockerfile
    FROM httpd:2.4
    ```

    By:

    ```Dockerfile
    FROM docker.io/library/httpd:2.4
    ```

### Load environment variables

```sh
set -a
source .env
set +a
```

### Create networks

```sh
podman network create dbnet
podman network create webnet
```

### MongoDB service

```sh
podman run -d --name mongodb -e MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME} -e MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD} -e MONGO_PORT=${DB_OUTER_PORT} -e MONGO_INITDB_DATABASE=${DB_DATABASE} -e LOADER_DB_LOGIN=${LOADER_DB_LOGIN} -e LOADER_DB_PASSWORD=${LOADER_DB_PASSWORD} -e WEBSITE_SERVER_DB_LOGIN=${WEBSITE_DB_LOGIN} -e WEBSITE_SERVER_DB_PASSWORD=${WEBSITE_DB_PASSWORD} -p ${DB_OUTER_PORT}:${DB_INNER_PORT} -v ${DB_VOLUME_PATH}:/data/db:Z -v $(pwd)/mongodb/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro --cpus "${DB_CPU_LIMIT}" --memory "${DB_MEMORY_LIMIT}" --network dbnet --security-opt label=disable docker.io/library/mongo:6
```

### Website service

#### Build

```sh
podman build -t website_image --build-arg DB_HOST=${DB_HOST} --build-arg DB_PORT=${DB_OUTER_PORT} --build-arg DB_DATABASE=${DB_DATABASE} --build-arg DB_AUTHSOURCE=${DB_AUTHSOURCE} --build-arg WEBSITE_INNER_PORT=${WEBSITE_INNER_PORT} --build-arg WEBSITE_DB_LOGIN=${WEBSITE_DB_LOGIN} --build-arg WEBSITE_DB_PASSWORD=${WEBSITE_DB_PASSWORD} --build-arg WEBSITE_BASE_URL_DEVELOPMENT=${WEBSITE_BASE_URL_DEVELOPMENT} --build-arg WEBSITE_BASE_URL_STAGING=${WEBSITE_BASE_URL_STAGING} --build-arg WEBSITE_BASE_URL_PRODUCTION=${WEBSITE_BASE_URL_PRODUCTION} --build-arg WEBSITE_CUSTOM=${WEBSITE_CUSTOM} ./website
```

#### Run

```sh
podman run -d --name website -p ${WEBSITE_PORT}:${WEBSITE_INNER_PORT} --cpus "${WEBSITE_CPU_LIMIT}" --memory "${WEBSITE_MEMORY_LIMIT}" --network dbnet --network webnet website_image
```

### Apache service

#### Build

```sh
podman build -t apache_image --build-arg WEBSITE_INNER_PORT=${WEBSITE_INNER_PORT} --build-arg APACHE_HTTP_INNER_PORT=${APACHE_HTTP_INNER_PORT} --build-arg APACHE_HTTPS_INNER_PORT=${APACHE_HTTPS_INNER_PORT} ./apache
```

#### Run

```sh
podman run -d --name apache -p ${APACHE_HTTP_OUTER_PORT}:${APACHE_HTTP_INNER_PORT} -p ${APACHE_HTTPS_OUTER_PORT}:${APACHE_HTTPS_INNER_PORT} --cpus "${APACHE_CPU_LIMIT}" --memory "${APACHE_MEMORY_LIMIT}" --network webnet apache_image
```

### Loader service

#### Build

```sh
podman build -t loader_image --build-arg DB_HOST=${DB_HOST} --build-arg DB_PORT=${DB_OUTER_PORT} --build-arg DB_DATABASE=${DB_DATABASE} --build-arg DB_AUTHSOURCE=${DB_AUTHSOURCE} --build-arg LOADER_DB_LOGIN=${LOADER_DB_LOGIN} --build-arg LOADER_DB_PASSWORD=${LOADER_DB_PASSWORD} ./loader
```

#### Run

```sh
podman run --rm --network dbnet loader_image -h
podman run --rm --cpus "${LOADER_CPU_LIMIT}" --memory "${LOADER_MEMORY_LIMIT}" --network dbnet loader_image list
podman run --rm -v ${LOADER_VOLUME_PATH}:/data:Z --cpus "${LOADER_CPU_LIMIT}" --memory "${LOADER_MEMORY_LIMIT}" --network dbnet loader_image load /data/upload.json
podman run --rm --cpus "${LOADER_CPU_LIMIT}" --memory "${LOADER_MEMORY_LIMIT}" --network dbnet loader_image remove -d <ID> -y
```

## Troubleshooting

Visit this link of the official repository:

https://github.com/containers/podman/blob/main/troubleshooting.md

### ERROR netavark

If the following error is given:

```sh
[ERROR netavark::dns::aardvark] aardvark-dns runs in a different netns, dns will not work for this container. To resolve please stop all containers, kill the aardvark-dns process, remove the /run/user/<USERID>/containers/networks/aardvark-dns directory and then start the containers again
```

Please do the following steps:

1) Stop and rm all containers:

    ```sh
    podman stop <container 1> <container 2>...
    podman rm <container 1> <container 2>...
    ```

2) Kill the aardvark-dns process:

    ```sh
    pkill aardvark-dns
    ```

3) Remove the aardvark-dns network directory:

    ```sh
    rm -rf /run/user/<USERID>/containers/networks/aardvark-dns
    ```

4) Restart the containers:

    ```sh
    podman run <container 1>
    podman run <container 2>
    ```

### Error: rootlessport cannot expose privileged port

If the following error is given:

```sh
Error: rootlessport cannot expose privileged port 80, you can add 'net.ipv4.ip_unprivileged_port_start=80' to /etc/sysctl.conf (currently 1024), or choose a larger port number (>= 1024): listen tcp 0.0.0.0:80: bind: permission denied
```

Please do the following steps (**NEEDS SUDO PRIVILEGES**):

1) Add to /etc/sysctl.conf:

    ```sh
    net.ipv4.ip_unprivileged_port_start=80
    ```

    This exposes from port **80** onwards. For opening from port **443** onwards change 80 by 443.

2) Reload the Sysctl Configuration:

    ```sh
    sudo sysctl --system
    ````

3) Check Sysctl Configuration:

    ```sh
    sysctl net.ipv4.ip_unprivileged_port_start
    ```

### If firewall has http/https disabled

In some cases, the firewall has http/https disabled by default. To check if this is the case, please do the following steps (**NEEDS SUDO PRIVILEGES**):

1) See if http and https are in the list of active rules:

```sh
sudo firewall-cmd --list-all
```

2) Add Rules to Allow Ports 80 and 443:

```sh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
```

3) Reload firewall:

```sh
sudo firewall-cmd --reload
```

4) Check that http and https are in the list of active rules:

```sh
sudo firewall-cmd --list-all
```

## Tips

### Remove all containers and images

```sh
podman system prune -a
podman system prune --volumes -f
```