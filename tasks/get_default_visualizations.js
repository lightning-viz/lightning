var models = require('../app/models');
var _ = require('lodash');


module.exports = function(cb) {
    models.VisualizationType
        .createManyFromRepoURL('https://github.com/mathisonian/lightning-default-visualizations')
        .spread(function() {
            var vizTypes = Array.prototype.slice.call(arguments, 0);
            console.log('Created Viz Types: ' + _.pluck(vizTypes, 'name').join(', '));
            cb();
        }).fail(function(err) {
            console.log(err);
            cb(err);
        });

};