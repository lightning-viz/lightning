var models = require('../app/models');
var Q = require('q');
var _ = require('lodash');
var config = require('../config/config');
var defaultVisualizations = config.defaultVisualizations || [];
require('colors');
var npm = require('npm');

module.exports = function(cb) {

    console.log('\nInstalling default visualizations from npm. This may take a minute or two...'.green);                
    var loglevel = npm.config.get('loglevel');
    npm.config.set('loglevel', 'silent');

    Q.all(_.map(defaultVisualizations, function(moduleName) {
        return models.VisualizationType.createFromNPM(moduleName);
    }))
    .spread(function() {
        var vizTypes = Array.prototype.slice.call(arguments, 0);
        npm.config.set('loglevel', loglevel);
        console.log('Created Viz Types: ' + _.pluck(vizTypes, 'name').join(', '));
        cb && cb();
    }).fail(function(err) {
        console.log(err);
        npm.config.set('loglevel', loglevel);
        cb && cb(err);
    });

};