// NOTE: process.env not working on older mongoDB versions (ie 4), so in these cases, this file should be manually edited
// Switch to the desired database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// Create a user with readWrite permissions on <MONGO_INITDB_DATABASE> database. This user will be used for the loader
db.createUser({
  user: process.env.LOADER_DB_LOGIN,
  pwd: process.env.LOADER_DB_PASSWORD,
  roles: [
    { role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE }
  ]
});

// Create a user with read permissions on <MONGO_INITDB_DATABASE> database. This user will be used for the REST API
db.createUser({
  user: process.env.WEBSITE_SERVER_DB_LOGIN,
  pwd: process.env.WEBSITE_SERVER_DB_PASSWORD,
  roles: [
    { role: 'read', db: process.env.MONGO_INITDB_DATABASE }
  ]
});