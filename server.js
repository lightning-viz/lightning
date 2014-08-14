
/**
 * Module dependencies
 */

var fs = require('fs');
var express = require('express');
// var mongoose = require('mongoose');
// var passport = require('passport');
var config = require('./config/config');
var _ = require('lodash');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(){
  console.log('a user connected');
});

var port = process.env.PORT || 3000;


var models = require('./app/models');
models.sequelize.sync(function() {
});

// models.Visualization
//     .findAll()
//     .then(function(visualizations) {
//         // console.log(visualizations);
//         // console.log(visualizations.data);
//         _.each(visualizations, function(v) {
//             console.log(v.data);
//             console.log(typeof v.data);
//             v.getNamedObjectAtIndex('timeseries', 2).then(function(data) {
//                 console.log(data);
//             });
//         });
//     });


// Connect to mongodb
// var connect = function () {
//   var options = { server: { socketOptions: { keepAlive: 1 } } };
//   mongoose.connect(config.db, options);
// };
// connect();

// mongoose.connection.on('error', console.log);
// mongoose.connection.on('disconnected', connect);

// // Bootstrap models
// fs.readdirSync(__dirname + '/app/models').forEach(function (file) {
//   if (~file.indexOf('.js')) require(__dirname + '/app/models/' + file);
// });

// // Bootstrap passport config
// require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, io);

// Bootstrap routes
require('./config/routes')(app);

server.listen(port);
console.log('Express app started on port ' + port);
