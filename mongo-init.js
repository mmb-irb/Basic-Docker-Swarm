// Switch to the desired database
db = db.getSiblingDB('my_db'); // Replace 'my_db' with your database name

// Create a user with readWrite permissions on 'my_db' database. This user will be used for the loader
db.createUser({
  user: 'user_rw',
  pwd: 'pwd_rw',
  roles: [
    { role: 'readWrite', db: 'my_db' }
  ]
});

// Create a user with read permissions on 'my_db' database. This user will be used for the REST API
db.createUser({
  user: 'user_r',
  pwd: 'pwd_r',
  roles: [
    { role: 'read', db: 'my_db' }
  ]
});