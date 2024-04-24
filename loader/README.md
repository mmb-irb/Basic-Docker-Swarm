# Loader

Dockerfile for building a container with a basic loader inside:

https://mmb.irbbarcelona.org/gitlab/gbayarri/loader-base.git

## .env file

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