
var url = require('url');
var config = require('./config');

var dbUrl = null;
if(process.env.DATABASE_URL) {
    console.log(process.env.DATABASE_URL)
    dbUrl = url.parse(process.env.DATABASE_URL);
    console.log(dbUrl);
}

module.exports = {
    'development': {
        database: (dbUrl) ? dbUrl.path.replace('/', '') : 'lightning-viz',
        username: (dbUrl) ? (dbUrl.auth.split(':') || [false])[0] : null,
        password: (dbUrl) ? (dbUrl.auth.split(':') || [false])[1] : null,
        'host': '127.0.0.1',
        'dialect': 'sqlite',
        'port': 5432,
        'sync': {'force': true},
        'storage': config.root + '/database.sqlite',
        'logging': false
    },  
    'test': {
        database: (dbUrl) ? dbUrl.path.replace('/', '') : 'lightning-viz',
        username: (dbUrl) ? (dbUrl.auth.split(':') || [false])[0] : null,
        password: (dbUrl) ? (dbUrl.auth.split(':') || [false])[1] : null,
        'host': '127.0.0.1',
        'dialect': 'postgres',
        'port': 5432,
        'sync': {'force': true},
        'storage': config.root + '/database.sqlite',
        'logging': false
    },
    'test-sqlite': {
        database: (dbUrl) ? dbUrl.path.replace('/', '') : 'lightning-viz',
        username: (dbUrl) ? (dbUrl.auth.split(':') || [false])[0] : null,
        password: (dbUrl) ? (dbUrl.auth.split(':') || [false])[1] : null,
        'host': '127.0.0.1',
        'dialect': 'sqlite',
        'port': 5432,
        'sync': {'force': true},
        'storage': config.root + '/database.sqlite',
        'logging': false
    },
    'production': {
        database: (dbUrl) ? dbUrl.path.replace('/', '') : 'lightning-viz',
        username: (dbUrl) ? (dbUrl.auth.split(':') || [false])[0] : 'lightning',
        password: (dbUrl) ? (dbUrl.auth.split(':') || [false])[1] : null,
        host: (dbUrl) ? dbUrl.hostname : '127.0.0.1',
        port: (dbUrl) ? dbUrl.port : 5432,
        'sync': {'force': true},
        'logging': false,
        native: true,
        ssl: true,
        'dialect': 'postgres'
    }
};
