
/**
 * Module dependencies
 */

var express = require('express');
// var passport = require('passport');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(){
  console.log('a user connected');
});

var port = process.env.PORT || 3000;


var models = require('./app/models');
models.sequelize.sync(function() {
    // setTimeout(function() {
    //     require('./scripts/create_visualization_types');
    // }, 1000);
});


// // Bootstrap passport config
// require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, io);

// Bootstrap routes
require('./config/routes')(app);

server.listen(port);
console.log('Express app started on port ' + port);
