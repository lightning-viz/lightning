var models = require('../app/models');
var Q = require('q');
var _ = require('lodash');
var config = require('../config/config');
var defaultVisualizations = config.defaultVisualizations || [];
require('colors');
var npm = require('npm');

var getDefaultVisualizations = function(cb) {

    console.log('\nInstalling default visualizations from npm. This may take a minute or two...'.green);                
    var loglevel = npm.config.get('loglevel');
    npm.config.set('loglevel', 'silent');

    Q.all(_.map(defaultVisualizations, function(moduleName) {
        return models.VisualizationType.createFromNPM(moduleName);
    }))
    .spread(function() {
        console.log()
        var vizTypes = Array.prototype.slice.call(arguments, 0);
        npm.config.set('loglevel', loglevel);
        console.log('Created Viz Types: ' + _.pluck(vizTypes, 'name').join(', '));
        cb && cb();
    }).catch(function(err) {
        console.log(err);
        npm.config.set('loglevel', loglevel);
        cb && cb(err);
    });

};


if (require.main === module) {
    // code run only if this file is called
    // directly from the command line
    var models = require('../app/models');
    models.sequelize.sync({force: false})
        .then(function() {
            models.VisualizationType
                .findAll()
                .then(function(vizTypes) {
                    if(vizTypes.length === 0) {
                        npm.load({
                            loglevel: 'error'
                        }, function() {
                            getDefaultVisualizations();
                        });
                    }
                });
        });
}
else {
    // expose functions if this file has been
    // required from elsewhere
    module.exports = getDefaultVisualizations;
}
