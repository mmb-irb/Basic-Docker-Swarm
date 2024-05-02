
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

Take a look as well at the **website ports**. They may change depending on the host configuration. Changing the port implies to change it as well in the [**website/Dockerfile**](website/Dockerfile).

```yaml
version: '3.8'

services:
  loader:
    image: loader_image   # name of loader image
    container_name: my_loader   # name of loader container
    build:
      context: ./loader   # folder to search Dockerfile for this image
    depends_on:
      - mongodb
    working_dir: /data
    volumes:
      - /path/to/loader/files:/data   # path where the loader will look for files
    networks:
      - my_network

  website:
    image: website_image
    container_name: my_website
    build:
      context: ./website   # folder to search Dockerfile for this image
    depends_on:
      - mongodb
    ports:
      - "8080:3001"   # port mapping, be aware that the second port is the same exposed in the website/Dockerfile
    networks:
      - my_network

  mongodb:
    container_name: my_mongo_container
    image: mongo:6
    volumes:
      - /path/to/db:/data/db  # path where the database will be stored (outside the container, in the host machine)
    networks:
      - my_network

networks:
  my_network: 
    name: my_network    # network name
```

### .env file

⚠️ No sensible default value is provided for any of these fields, they **need to be defined** ⚠️

An `.env` file must be created both in the **loader** and **website** folders. The file `.env.git` can be taken as an example. The file must contain the following environment variables (the DB user needs to have writing rights):

| key              | value   | description                                     |
| ---------------- | ------- | ----------------------------------------------- |
| DB_LOGIN         | string  | db user                                         |
| DB_PASSWORD      | string  | db password                                     |
| DB_HOST          | `<url>` | url of the db server                            |
| DB_PORT          | number  | port of the db server                           |
| DB_DATABASE      | string  | name of the dbcollection                        |
| DB_AUTHSOURCE    | string  | authentication db                               |

Take into account that, by default, the **mongodb docker** is configured **without authentication**. So, if following the instructions of this README, leave **DB_LOGIN** and **DB_STRING** empty. Example for this proof of concept:

```
DB_LOGIN=
DB_PASSWORD=
DB_HOST=my_mongo_container
DB_PORT=27017
DB_DATABASE=<DB NAME>
DB_AUTHSOURCE=<DB NAME>
```

The **DB_HOST** must be the same name as the **mongodb container_name** in the **docker-compose.yml**.

## Build services

For building the services via **docker compose**, please execute the following instruction from the root of this project:

```sh
docker-compose up -d
```

This instruction will run docker-compose in background and it will create the three services described in the first section.

## Execute services

### Use loader

While the mongodb and website containers will remain up, the loader must be called every time is needed.

**List** database documents:

```sh
docker-compose run loader list
```

**Load** documents to database:

As the database comes empty, it's necessary to load some data for running the website properly. The route for the upload.json must be the same defined as **working_dir** in the **docker-compose.yml** file (ie /data). And the upload.json file must be in the **volumes** path defined in the **docker-compose.yml** file.

```sh
docker-compose run loader load /data/upload.json
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
docker-compose run loader remove -d <ID>
```

### Check website

Open a browser and type:

```
http://localhost:8080
```

Or modify the port by the one defined as **ports** in the **docker-compose.yml** file.

## Stop / start services

For **stopping** all the services (website and mongodb):

```sh
docker-compose stop
```

For **stopping** all the services (website and mongodb) and **remove** all up images:

```sh
docker-compose down
```

For **starting** all the services (website and mongodb):

```sh
docker-compose start
```

## Tips

### Avoid cache for docker-compose

Ie when developing and doing changes in git repo.

1. Stop all containers and remove all images: 

    ```sh
    docker-compose down --rmi all
    ```

2. Rebuild images avoiding cache:

    ```sh
    docker-compose build --no-cache
    ```

3. Up services:
    ```sh
    docker-compose up -d
    ```

### Execute mongo docker in terminal mode

```sh
docker exec -it my_mongo_container bash
```

And then: 

```sh
mongosh 
```

For entering the database in terminal mode. By default, the mongodb docker is configured **without authentication**.

### Check containers

Check that at least the mongo and web containers are up & running:

```sh
$ docker ps -a
CONTAINER ID   IMAGE           COMMAND                  CREATED         STATUS         PORTS                    NAMES
XXXXXXXXXXXX   website_image   "pm2-runtime start e…"   4 minutes ago   Up 4 minutes   0.0.0.0:8080->3001/tcp   my_website
XXXXXXXXXXXX   mongo:6         "docker-entrypoint.s…"   4 minutes ago   Up 4 minutes   27017/tcp                my_mongo_container
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
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "<IP>",
                    "Gateway": "<IP>"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "<ID>": {
                "Name": "my_mongo_container",
                "EndpointID": "<ID>",
                "MacAddress": "<MAC>",
                "IPv4Address": "<IP>",
                "IPv6Address": ""
            },
            "<ID>": {
                "Name": "my_website",
                "EndpointID": "<ID>",
                "MacAddress": "<MAC>",
                "IPv4Address": "<IP>",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

### Docker logs

Show logs for a container:

```sh
docker logs my_web_container
```

## Credits

Genís Bayarri, Adam Hospital.

## Copyright & licensing

This website has been developed by the [MMB group](https://mmb.irbbarcelona.org) at the [IRB Barcelona](https://irbbarcelona.org).

© 2024 **Institute for Research in Biomedicine**

Licensed under the **Apache License 2.0**.