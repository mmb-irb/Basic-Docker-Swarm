
# Docker web services

In this **proof of concept** there are all the files needed for executing the different services needed for executing a website: f**ront-end**, **back-end**, **database** and **data loader**. All these services have been integrated into docker containers and connected between them via docker network.

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

## Use docker compose

### Prepare configuration files

#### docker-compose.yml

Copy docker-compose.yml.git into **docker-compose.yml** and modify the volumes' routes. 

Take a look as well at the website ports. It may change depending on the host configuration. Changing the port implies to change it as well in the website/Dockerfile.

#### .env file

⚠️ No sensible default value is provided for any of these fields, they **need to be defined** ⚠️

An `.env` file must be created in the loader and website folders. The file `.env.git` can be taken as an example. The file must contain the following environment variables (the DB user needs to have writing rights):

| key              | value   | description                                     |
| ---------------- | ------- | ----------------------------------------------- |
| DB_LOGIN         | string  | db user                                         |
| DB_PASSWORD      | string  | db password                                     |
| DB_HOST          | `<url>` | url of the db server                            |
| DB_PORT          | number  | port of the db server                           |
| DB_DATABASE      | string  | name of the dbcollection                        |
| DB_AUTHSOURCE    | string  | authentication db                               |

Take into account that, by default, the **mongodb docker** is configured without authentication. So, if following the instructions of this README, leave **DB_LOGIN** and **DB_STRING** empty. Example for this proof of concept:

```
DB_LOGIN=
DB_PASSWORD=
DB_HOST=my_mongo_container
DB_PORT=27017
DB_DATABASE=<DB NAME>
DB_AUTHSOURCE=<DB NAME>
```

The **DB_HOST** must be the same name as the **mongodb container_name** in the **docker-compose.yml**.

### Build services

For building the services via **docker compose**, please execute the following instruction from the root of this project:

```
docker-compose up -d
```

This instruction will run docker-compose in background and it will create the three services described in the first section.

### Check website

Open a browser and type:

```
http://localhost:8080
```

### Use loader

While the mongodb and website containers will remain up, the loader must be called every time is needed.

**List** database documents:

```
docker-compose run loader list
```

**Load** documents to database:

```
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
    ]
  }
]
```

**Remove** database document:

```
docker-compose run loader remove -d <ID>
```

### Stop / start services

For **stopping** all the services (website and mongodb):

```
docker-compose stop
```

For **starting** all the services (website and mongodb):

```
docker-compose start
```

## Use docker

For building the services **manually via docker** instructions, please execute the following steps: 

### Build loader image

```
cd loader
docker build -t loader_image .
```

### Create network

```
docker network create my_network
```

### Pull / run mongo docker

```
docker run --name my_mongo_container -v /path/to/db:/data/db --network my_network -d mongo:6
```

As it is highly recommended to have the database **outside of the container**, an absolut path to the host (/path/to/db) must be provided. The **database will be stored** in this folder.

### Check that everything is properly working:

Test the loader:

```
docker run --network my_network loader_image list
```

### Load some data to database

```
cd loader
docker run -w /data -v /path/to/data:/data --network my_network loader_image load /data/upload.json
```

Where /path/to/db is the **absolut path** were to save the upload.json file is in the computer. This folder will be **mapped into the docker**.

### Build website image

```
cd website
docker build -t web_image .
```

### Run web_image

Be aware that the port is the **same exposed in the Dockerfile**.

```
docker run --name my_web_container --network my_network -d -p 8080:3001 web_image
```

### Check website

Open a browser and type:

```
http://localhost:8080
```

## Tips

### Avoid cache for Dockerfile

Ie when developing and doing changes in git repo.

```
docker build --no-cache -t loader_image .
```

### Remove documents via loader

As the remove command of the loader is interactive, this gives problems when executing through docker, so please use the -y flag when removing documents in order to avoid hanging the docker execution:

```
docker run --network my_network loader_image remove -d <ID> -y
```

### Execute mongo docker in terminal mode

```
docker exec -it my_mongo_container bash
```

And then: 

```
mongosh 
```

For entering the database in terminal mode. By default, the mongodb docker is configured without authentication.

### Check containers

Check that at least the mongo and web containers are up & running:

```
$ docker ps -a
CONTAINER ID   IMAGE           COMMAND                  CREATED         STATUS         PORTS                    NAMES
XXXXXXXXXXXX   website_image   "pm2-runtime start e…"   4 minutes ago   Up 4 minutes   0.0.0.0:8080->3001/tcp   my_website
XXXXXXXXXXXX   mongo:6         "docker-entrypoint.s…"   4 minutes ago   Up 4 minutes   27017/tcp                my_mongo_container
```

### Inspect docker network 

```
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
                "Name": "my_web_container",
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

```
docker logs my_web_container
```

## Credits

Genís Bayarri, Adam Hospital.

## Copyright & licensing

This website has been developed by the [MMB group](https://mmb.irbbarcelona.org) at the [IRB Barcelona](https://irbbarcelona.org).

© 2024 **Institute for Research in Biomedicine**

Licensed under the **Apache License 2.0**.