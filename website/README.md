# Website

Dockerfile for building a container with a basic website inside:

https://mmb.irbbarcelona.org/gitlab/gbayarri/nuxt-skeleton.git

This website has been impleneted in Nuxt 3 and it has both the front-end and the back-end in the same repo.

## Dockerfile

Take into account that the port exposed in this proof of concept is **3001**. For changing the port, please modify it in the Dockerfile file:

```Dockerfile
EXPOSE 3001
```

After changing this port, it must be changed as well in the **docker-compose.yml** file: 

```yaml
website:
  image: website_image
  container_name: my_website
  build:
    context: ./website
  depends_on:
    - mongodb
  ports:
    - "8080:3001"
  networks:
    - my_network
```

Or, if running the website container directly via docker, in the command line:

```
docker run --name my_web_container --network my_network -d -p 8080:3001
```

## .env file

⚠️ No sensible default value is provided for any of these fields, they **need to be defined** ⚠️

An `.env` file must be created in the loader and website folders. The file `.env.git` can be taken as an example. The file must contain the following environment variables (the DB user needs to have writing rights):

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

Take into account that, by default, the **mongodb docker** is configured without authentication. So, if following the instructions of this README, leave **DB_LOGIN** and **DB_STRING** empty. Example for this proof of concept:

```
DB_LOGIN=
DB_PASSWORD=
DB_HOST=my_mongo_container
DB_PORT=27017
DB_DATABASE=<DB NAME>
DB_AUTHSOURCE=<DB NAME>

BASE_URL_DEVELOPMENT=/nuxt-skeleton/
BASE_URL_STAGING=/nuxt-skeleton/
BASE_URL_PRODUCTION=/nuxt-skeleton/
```

The **DB_HOST** must be the same name as the **mongodb container_name** in the **docker-compose.yml**.