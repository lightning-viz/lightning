/**
 * Module dependencies
 */
var tasks = require('./tasks');
var express = require('express');
// var passport = require('passport');
var _ = require('lodash');
var app = express();
var baseApp = express();
var config = require('./config/config');
baseApp.use(config.baseURL, app);
var server = require('http').Server(baseApp);
require('colors');
var env = process.env.NODE_ENV || 'development';
var dbConfig = require(__dirname + '/config/database')[env];
var npm = require('npm');
// var sticky = require('sticky-session');
var utils = require('./app/utils');
var port = process.env.PORT || 3000;
var startup = require('./tasks/startup');
var cluster = require('cluster');
var debug = require('debug')('lightning:server');

var lex = require('./config/letsencrypt');

if (cluster.isMaster) {
    startup();
}

npm.load(utils.getNPMConfig());


var io = require('socket.io')(server);

io.set('origins', '*:*');

io.on('connection', function(){
  debug('a user connected');
});

// Bootstrap application settings
require('./config/express')(app, io);

// Boostrap routes
require('./config/routes')(app);

// server.listen(port);

lex.onRequest = baseApp;

lex.listen([port], [443, 5001], function () {
  var protocol = ('requestCert' in this) ? 'https': 'http';
  console.log("Listening at " + protocol + '://localhost:' + this.address().port);
});

module.exports = server;
