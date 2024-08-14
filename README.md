
# Docker web services

In this **proof of concept** there are all the files needed for executing the different services for executing a website: **front-end**, **back-end**, **database** and **data loader**. All these services have been integrated into docker containers and connected between them via docker network.

This help contains the instructions for **launching the services** via **docker-compose**. If you want to launch them via **Dockerfiles**, please [**click here**](via_docker.md).

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

### docker-compose.yml

Copy docker-compose.yml.git into **docker-compose.yml** and modify the volumes' routes. 

Take a look as well at the **website ports**. They may change depending on the host configuration. Changing the port **inside the container** implies to change it as well in the [**website/Dockerfile**](website/Dockerfile). If changing the port **on the host machine**, take into account that it must mach with the one defined in the **Set Up of the Virtual Hosts** in the host VM.

```yaml
services:
  loader:
    image: loader_image   # name of loader image
    build:
      context: ./loader   # folder to search Dockerfile for this image
    depends_on:
      - mongodb
    working_dir: /data
    volumes:
      - ${LOADER_VOLUME_PATH}:/data   # path where the loader will look for files
    networks:
      - my_network
    deploy:
      resources:
        limits:
          cpus: ${LOADER_CPU_LIMIT}   # Specify the limit number of CPUs
          memory: ${LOADER_MEMORY_LIMIT}   # Specify the limit memory
        reservations:
          cpus: ${LOADER_CPU_RESERVATION}   # Specify the reserved number of CPUs
          memory: ${LOADER_MEMORY_RESERVATION}   # Specify the reserved memory
      restart_policy:
        condition: none  # Do not restart automatically

  website:
    image: website_image   # name of website image
    build:
      context: ./website  # folder to search Dockerfile for this image
    depends_on:
      - mongodb
    ports:
      - "8080:3001"   # port mapping, be aware that the second port is the same exposed in the website/Dockerfile
    networks:
      - my_network
    deploy:
      replicas: 2   # Specify the number of replicas for Docker Swarm
      resources:
        limits:
          cpus: ${WEBSITE_CPU_LIMIT}   # Specify the limit number of CPUs
          memory: ${WEBSITE_MEMORY_LIMIT}   # Specify the limit memory
        reservations:
          cpus: ${WEBSITE_CPU_RESERVATION}   # Specify the reserved number of CPUs
          memory: ${WEBSITE_MEMORY_RESERVATION}   # Specify the reserved memory
      restart_policy:
        condition: any  # Do not restart automatically
      update_config:
        order: start-first  # Priority over other services

  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
    ports:
      - "27017:27017"
    volumes:
      - ${DB_VOLUME_PATH}:/data/db   # path where the database will be stored (outside the container, in the host machine)
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro   # path to the initialization script
    networks:
      - my_network
    deploy:
      replicas: 1   # Specify the number of replicas for Docker Swarm
      resources:
        limits:
          cpus: ${DB_CPU_LIMIT}    # Specify the limit number of CPUs
          memory: ${DB_MEMORY_LIMIT}   # Specify the limit memory
        reservations:
          cpus: ${DB_CPU_RESERVATION}   # Specify the reserved number of CPUs
          memory: ${DB_MEMORY_RESERVATION}   # Specify the reserved memory
      restart_policy:
        condition: on-failure

networks:
  my_network: 
    name: my_network    # network name
    driver: overlay
    attachable: true
```

All the variables are defined in a `.env` file. See following section.

### .env file

⚠️ No sensible default value is provided for any of these fields, they **need to be defined** ⚠️

An `.env` file must be created in the **root**, the **loader** and **website** folders. The file `.env.git` can be taken as an example. The file must contain the following environment variables (the DB user needs to have writing rights):

#### root

| key              | value   | description                                     |
| ---------------- | ------- | ----------------------------------------------- |
| LOADER_VOLUME_PATH         | string  | path where the loader will look for files                                        |
| LOADER_CPU_LIMIT      | string  | loader limit number of CPUs                                    |
| LOADER_MEMORY_LIMIT          | string | loader limit memory                           |
| LOADER_CPU_RESERVATION          | string  | loader reserved number of CPUs                           |
| LOADER_MEMORY_RESERVATION      | string  | loader reserved memory                         |
| WEBSITE_CPU_LIMIT    | string  | website limit number of CPUs                               |
| WEBSITE_MEMORY_LIMIT    | string  | website limit memory                             |
| WEBSITE_CPU_RESERVATION    | string  | website reserved number of CPUs                               |
| WEBSITE_MEMORY_RESERVATION    | string  | website reserved memory                               |
| DB_VOLUME_PATH         | string  | path where the DB will look for files                                        |
| DB_CPU_LIMIT      | string  | DB limit number of CPUs                                    |
| DB_MEMORY_LIMIT          | string | DB limit memory                           |
| DB_CPU_RESERVATION          | string  | DB reserved number of CPUs                           |
| DB_MEMORY_RESERVATION      | string  | DB reserved memory                         |
| MONGO_INITDB_ROOT_USERNAME      | string  | root user for the DB                         |
| MONGO_INITDB_ROOT_PASSWORD      | string  | root password for the DB                       |

#### loader

| key              | value   | description                                     |
| ---------------- | ------- | ----------------------------------------------- |
| DB_LOGIN         | string  | db user                                         |
| DB_PASSWORD      | string  | db password                                     |
| DB_HOST          | `<url>` | url of the db server                            |
| DB_PORT          | number  | port of the db server                           |
| DB_DATABASE      | string  | name of the dbcollection                        |
| DB_AUTHSOURCE    | string  | authentication db                               |

Example for this proof of concept:

```
DB_LOGIN=user_rw
DB_PASSWORD=pwd_rw
DB_HOST=my_stack_mongodb
DB_PORT=27017
DB_DATABASE=my_db
DB_AUTHSOURCE=my_db
```

The **DB_HOST** must be the name of the **stack service** followed by **underscore** and the **name of the service** as defined in the [**docker-compose.yml**](#docker-composeyml) file.

The **DB_DATABASE** and **DB_AUTHSOURCE** must be the same used in the **mongo-init.js** file.

The credentials **DB_LOGIN** and **DB_PASSWORD** must be the same defined in the **mongo-init.js** file with the **readWrite** role.

#### website 

| key                       | value                                    | description                     |
| ------------------------- | ---------------------------------------- | ------------------------------- |
| DB_LOGIN                  | string                                   | db user                         |
| DB_PASSWORD               | string                                   | db password                     |
| DB_HOST                   | `<url>`                                  | url of the db server            |
| DB_PORT                   | number                                   | port of the db server           |
| DB_DATABASE               | string                                   | name of the dbcollection        |
| DB_AUTHSOURCE             | string                                   | the collection the user will attempt to authenticate to    |
| BASE_URL_DEVELOPMENT      | string                                   | baseURL for development         |
| BASE_URL_STAGING          | string                                   | baseURL for staging             |
| BASE_URL_PRODUCTION       | string                                   | baseURL for production          |
| CUSTOM                    | boolean                                  | whether or not custom images and styles provided          |

Example for this proof of concept:

```
DB_LOGIN=user_r
DB_PASSWORD=pwd_r
DB_HOST=my_stack_mongodb
DB_PORT=27017
DB_DATABASE=my_db
DB_AUTHSOURCE=my_db

BASE_URL_DEVELOPMENT=/nuxt-skeleton/
BASE_URL_STAGING=/nuxt-skeleton/
BASE_URL_PRODUCTION=/nuxt-skeleton/

CUSTOM=false
```

The **DB_HOST** must be the name of the **stack service** followed by **underscore** and the **name of the service** as defined in the [**docker-compose.yml**](#docker-composeyml) file.

The **DB_DATABASE** and **DB_AUTHSOURCE** must be the same used in the **mongo-init.js** file.

The credentials **DB_LOGIN** and **DB_PASSWORD** must be the same defined in the **mongo-init.js** file with the **read** role.

If `CUSTOM=true`, make sure to provide a **/config folder** in the [website](website) folder with a **custom.css**, **favicon.ico** and **logo.png** files.

The **BASE_URL_DEVELOPMENT** shouldn't be used when running as a docker service. 

⚠️ The [**website/Dockerfile**](website/Dockerfile) is configured for running the website in **production** mode. This means that it will take **BASE_URL_PRODUCTION** as **baseURL**. For changing this, please edit the [**website/Dockerfile**](website/Dockerfile) line: `RUN npm run build:production` ⚠️

## Build services

> NOTE: **From July 2024 onwards**, the instruction for docker compose in **mac** is without hyphen, so from now on, `docker-compose up -d` is `docker compose up -d` when executing in **macOS**.

First off, go to the root of the project. Then, init **docker swarm**:

```sh
docker swarm init
```

For building the services via **docker compose**, please execute the following instruction:

```sh
docker-compose build
```

Export environment variables defined in [**root .env file**](#root) and deploy docker stack:

```sh
export $(grep -v '^#' .env | xargs)
docker stack deploy -c docker-compose.yml my_stack
```

Check services:

```sh
docker stack services my_stack
```

Check nodes:

```sh
docker node ls
```

## Execute services

### Use loader

While the mongodb and website containers will remain up, the loader must be called every time is needed.

**List** database documents:

```sh
docker container run --rm -it --network my_network loader_image list
```

**Load** documents to database:

As the database comes empty, it's necessary to load some data for running the website properly. The route for the upload.json must be the same defined as **working_dir** in the **docker-compose.yml** file (ie /data). And the upload.json file must be in the **volumes** path defined in the **docker-compose.yml** file.

```sh
docker container run --rm -it --network my_network loader_image load /data/upload.json
```

For this proof of concept, the upload.json must have the following format:

```json
[
  {
    "title": "Document title",
    "description": "Document description",
    "longDescription": "Document long description, lorem ipsum dolor sit amet, consectetur adipiscing elit",
    "authors": [
      {
        "name": "Author 1 name",
        "email": "email1@mail.com"
      },
      {
        "name": "Author 2 name",
        "email": "email2@mail.com"
      }
    ],
    "files": [
      {
        "title": "file1",
        "path": "/data/file1"
      },
      {
        "title": "file1",
        "path": "/data/file1"
      },
    ]
  }
]
```

Note that, in this proof of concept, the front-end shows the files in a 3D structure visualizer, so the files should be in **PDB** format. The route for these files must be the same defined as **working_dir** in the **docker-compose.yml** file (ie /data). And the files must be in the **volumes** path defined in the **docker-compose.yml** file.

**Remove** database document:

```sh
docker container run --rm -it --network my_network loader_image remove -d <ID>
```

### Check website

Open a browser and type:

```
http://localhost:8080
```

Or modify the port by the one defined as **ports** in the **docker-compose.yml** file.

## Stop / start services

Remove stack:

```sh
docker stack rm my_stack
```

Leave swarm:

```sh
docker swarm leave --force
```

## Tips

### Clean docker

When working with Docker, **even after removing images and containers**, Docker can leave behind various unused resources that take up **disk space**. To clean up your system effectively, you can use the following commands:

1. **Remove** unused containers, images and networks:

    Docker has a built-in command to clean up resources that are not in use:

        docker system prune

    This command will prompt you to confirm that you want to remove all unused data. If you want to avoid the prompt, you can add the -f (force) flag:

        docker system prune -f

2. **Cleaning up** the Docker builder **cache**:

    Docker build cache can also take up significant space. You can remove unused build cache:

        docker builder prune

    If you want to remove all build cache, including the cache used by the active build process:

        docker builder prune -a -f

3. Remove unused **volumes**:

    By default, docker system prune does not remove unused volumes. If you want to remove them as well, you can use:

        docker system prune --volumes

    If you want to avoid the prompt, you can add the -f (force) flag:

        docker system prune --volumes -f

4. **Check disk usage** by Docker objects

        docker system df


### Execute mongo docker in terminal mode

```sh
docker exec -it <mongo_container_ID> bash
```

And then: 

```sh
mongosh 
```

For entering the database in **terminal mode**. Take into account that, for **checking** your database and its **collections**, you must use the **authentication credentials** defined in the [**mongo-init.js**](./mongo-init.js) file. For example, for checking the **collections** of the my_db **database**, please follow the next steps:

Switch to **my_db** database (or the name defined in the [**mongo-init.js**](./mongo-init.js) file):

    use my_db

**Authenticate** with one of the **users** defined in the [**mongo-init.js**](./mongo-init.js) file:

    db.auth('user_r','pwd_r');

Execute some mongo shell instruction:

    show collections

Additionally, users are able to access the database as a **root/admin** user, as defined in the [**docker-compose.yml**](./docker-compose-git.yml) file:

    mongosh --username <ROOT_USER> --password <ROOT_PASSWORD>

Take into account that acessing mongoDB as **root/admin** user is **not recommended** as with this user there are **no restrictions** once inside the database. We strongly recommend to use the **users** defined in the [**mongo-init.js**](./mongo-init.js) file for accessing the database.

### Check containers

Check that at least the mongo and the replicas of web containers are up & running:

```sh
$ docker ps -a
CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS                      PORTS       NAMES
XXXXXXXXXXXX   mongo:6                "docker-entrypoint.s…"   21 minutes ago   Up 21 minutes               27017/tcp   my_stack_mongodb.1.<ID>
XXXXXXXXXXXX   website_image:latest   "pm2-runtime start e…"   21 minutes ago   Up 21 minutes               3001/tcp    my_stack_website.1.<ID>
XXXXXXXXXXXX   website_image:latest   "pm2-runtime start e…"   21 minutes ago   Up 21 minutes               3001/tcp    my_stack_website.2.<ID>
```

### Inspect docker network 

```sh
docker network inspect my_network
```

should show something like:

```json
[
    {
        "Name": "my_network",
        "Id": "<ID>",
        "Created": "<DATE>",
        "Scope": "swarm",
        "Driver": "overlay",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "<IP>",
                    "Gateway": "<IP>"
                }
            ]
        },
        "Internal": false,
        "Attachable": true,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "<ID>": {
                "Name": "my_stack_website.2.<ID>",
                "EndpointID": "<ID>",
                "MacAddress": "<MAC>",
                "IPv4Address": "<IP>",
                "IPv6Address": ""
            },
            "<ID>": {
                "Name": "my_stack_website.1.<ID>",
                "EndpointID": "<ID>",
                "MacAddress": "<MAC>",
                "IPv4Address": "<IP>",
                "IPv6Address": ""
            },
            "<ID>": {
                "Name": "my_stack_mongodb.1.<ID>",
                "EndpointID": "<ID>",
                "MacAddress": "<MAC>",
                "IPv4Address": "<IP>",
                "IPv6Address": ""
            },
            "lb-my_network": {
                "Name": "my_network-endpoint",
                "EndpointID": "<ID>",
                "MacAddress": "<MAC>",
                "IPv4Address": "<IP>",
                "IPv6Address": ""
            }
        },
        "Options": {
            "com.docker.network.driver.overlay.vxlanid_list": "<ID>"
        },
        "Labels": {
            "com.docker.stack.namespace": "my_stack"
        },
        "Peers": [
            {
                "Name": "<ID>",
                "IP": "<IP>"
            }
        ]
    }
]
```

### Scale a service:

Add two more replicas to my_stack_website:

```sh
docker service scale my_stack_website=4
```

### Check service tasks

```sh
docker service ps my_stack_mongodb
```

### Docker logs

Show logs for a service:

```sh
docker service logs my_stack_mongodb
```

## Credits

Genís Bayarri, Adam Hospital.

## Copyright & licensing

This website has been developed by the [MMB group](https://mmb.irbbarcelona.org) at the [IRB Barcelona](https://irbbarcelona.org).

© 2024 **Institute for Research in Biomedicine**

Licensed under the **Apache License 2.0**.