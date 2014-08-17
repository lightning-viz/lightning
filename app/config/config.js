
var url = require('url');

var dbUrl = null;
if(process.env.DATABASE_URL) {
    dbUrl = url.parse(process.env.DATABASE_URL);
}


module.exports = {
  "development": {
    "username": null,
    "password": null,
    "database": "janelia-lightning",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "port": 5432,
    "sync": {"force": true},
    "logging": false
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    database: (dbUrl) ? dbUrl.path.replace('/', '') : 'janelia-lightning',
    username: (dbUrl) ? (dbUrl.auth.split(':') || [false])[0] : 'lightning',
    password: (dbUrl) ? (dbUrl.auth.split(':') || [false])[1] : null,
    host: (dbUrl) ? dbUrl.hostname : '127.0.0.1',
    "sync": {"force": true},
    "logging": false,
    native: true,
    ssl: true,
    "dialect": "postgres"
  }
}
