
/**
 * Module dependencies
 */
var tasks = require('./tasks');
var express = require('express');
// var passport = require('passport');
var _ = require('lodash');
var app = express();
var server = require('http').Server(app);
require('colors');
var env = process.env.NODE_ENV || 'development';
var dbConfig = require(__dirname + '/config/database')[env];


// var cluster = require('cluster');
// var cpuCount = Math.max(1, require('os').cpus().length);

var port = process.env.PORT || 3000;


var models = require('./app/models');
models.sequelize.sync({force: false})
    .success(function() {

        models.VisualizationType
            .findAll()
            .success(function(vizTypes) {

                console.log('\nInstalled visualizations:');
                console.log('-------------------------');
                _.each(vizTypes, function(vt) {
                    console.log('* ' + vt.name);
                })
                if(vizTypes.length === 0) {
                    tasks.getDefaultVisualizations();
                }
            });
    }).error(function(err) {
        console.log('Could not connect to the database. Is Postgres running?');
        throw err;
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



var logo = "\n\n\n  ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,` \n";
logo += " ,`                                ,.\n";
logo += ",`                                  ,\n";
logo += ",                                   ,\n";
logo += ",                      .            ,\n";
logo += ",                     ,             ,\n";
logo += ",                    `,             ,\n";
logo += ",                    ,.             ,\n";
logo += ",                   ,,              ,\n";
logo += ",                  ,,,              ,\n";
logo += ",                 ,,,.              ,\n";
logo += ",                .,,,               ,\n";
logo += ",               `,,,,               ,\n";
logo += ",               ,,,,`               ,\n";
logo += ",              ,,,,,                ,\n";
logo += ",             ,,,,,,                ,\n";
logo += ",            ,,,,,,,,,,,,,,.        ,\n";
logo += ",           .,,,,,,,,,,,,,,         ,\n";
logo += ",           ,,,,,,,,,,,,,,          ,\n";
logo += ",          ,,,,,,,,,,,,,,           ,\n";
logo += ",         ,,,,,,,,,,,,,,            ,\n";
logo += ",                 ,,,,,`            ,\n";
logo += ",                ,,,,,,             ,\n";
logo += ",                ,,,,,              ,\n";
logo += ",                ,,,,               ,\n";
logo += ",               ,,,,                ,\n";
logo += ",               ,,,`                ,\n";
logo += ",              `,,.                 ,\n";
logo += ",              ,,,                  ,\n";
logo += ",              ,,                   ,\n";
logo += ",             `,                    ,\n";
logo += ",             ,                     ,\n";
logo += ",             `                     ,\n";
logo += ",            `                      ,\n";
logo += ",                                   ,\n";
logo += "`,                                 .,\n";
logo += " .,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, \n\n\n\n";



console.log(logo.magenta);

console.log('Lightning started on port: ' + port);
console.log('Running database: ' + dbConfig.dialect);
