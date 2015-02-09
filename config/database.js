
var url = require('url');

var dbUrl = null;
if(process.env.DATABASE_URL) {
    dbUrl = url.parse(process.env.DATABASE_URL);
}


module.exports = {
  "development": {
    "username": null,
    "password": null,
    "database": "lightning-viz",
    "host": "127.0.0.1",
    "dialect": "sqlite",
    "port": 5432,
    "sync": {"force": true},
    "storage": 'database.sqlite',
    "logging": false
  },
  "production": {
    database: (dbUrl) ? dbUrl.path.replace('/', '') : 'lightning-viz',
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
