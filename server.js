
/**
 * Module dependencies
 */
var tasks = require('./tasks');
var express = require('express');
// var passport = require('passport');
var _ = require('lodash');
var app = express();
var server = require('http').Server(app);


// var cluster = require('cluster');
// var cpuCount = Math.max(1, require('os').cpus().length);

var port = process.env.PORT || 3000;

// if(cluster.isMaster) {
//     for( var i = 0; i < cpuCount; i++ ) {
//       cluster.fork();
//     }

//     cluster.on('listening', function(worker) {
//         console.log('Worker ' + worker.process.pid + ' listening');
//     });

//     cluster.on('exit', function( worker ) {
//       console.log( 'Worker ' + worker.process.pid + ' died.' );
//       cluster.fork();
//     });

//     console.log('Initializing server with ' + cpuCount + ' threads');
//     return;
// }   



var models = require('./app/models');
models.sequelize.sync({force: false})
    .success(function() {

    models.VisualizationType
        .findAll()
        .success(function(vizTypes) {
            console.log(_.pluck(vizTypes, 'name'));
            if(vizTypes.length === 0) {
                tasks.getDefaultVisualizations();
            }
        });
});

var io = require('socket.io')(server);

io.on('connection', function(){
  console.log('a user connected');
});



// // Bootstrap passport config
// require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, io);

// Bootstrap routes
require('./config/routes')(app);

server.listen(port);
console.log('Express app started on port ' + port);
