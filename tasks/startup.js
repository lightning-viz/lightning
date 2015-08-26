var models = require('../app/models');
var utils = require('../app/utils');
var env = process.env.NODE_ENV || 'development';
var dbConfig = require(__dirname + '/../config/database')[env];
var _ = require('lodash');
var tasks = require('./index');
var port = process.env.PORT || 3000;
var npm = require('npm');

var f = function() {
    models.sequelize.sync({force: false})
        .then(function() {

            models.VisualizationType
                .findAll()
                .then(function(vizTypes) {
                    console.log('\nInstalled visualizations:');
                    console.log('-------------------------');
                    _.each(vizTypes, function(vt) {
                        console.log('* ' + vt.name);
                    })
                    if(vizTypes.length === 0) {
                        npm.load({
                            loglevel: 'error'
                        }, function() {
                            tasks.getDefaultVisualizations();
                        });
                    }
                });
        }).catch(function(err) {
            console.log('Could not connect to the database. Is Postgres running?');
            throw err;
        });


    console.log(utils.getASCIILogo().magenta);

    console.log('Lightning started on port: ' + port);
    console.log('Running database: ' + dbConfig.dialect);
};

module.exports = f;