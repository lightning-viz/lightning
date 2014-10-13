var models = require('../models');
var _ = require('lodash');
var resumer = require('resumer');
var browserify = require('browserify');
var path = require('path');
var cache = require('memory-cache');


exports.getDynamicVizBundle = function (req, res, next) {

    res.set('Content-Type', 'application/javascript');


    // Get all vizTypes in array
    var visualizationTypes = _.uniq(req.query.visualizations).sort();    
    var bundle = cache.get(visualizationTypes.toString());

    if(bundle) {
        return res.send(bundle);
    }

    console.log('building viz bundle with ' + visualizationTypes);

    var b = browserify();

    models.VisualizationType
        .findAll({
            where: {
                name: {
                    in: visualizationTypes
                }
            }
        }).success(function(vizTypes) {
            _.each(vizTypes, function(vizType) {
                var stream = resumer().queue(vizType.javascript).end();
                b.require(stream, {
                    basedir: path.resolve(__dirname + '/../../ui/js/viz/'),
                    expose: 'viz/' + vizType.name
                });
            });

            b.bundle(function(err, buf) {
                cache.put(visualizationTypes.toString(), buf, 1000 * 60 * 60);
                res.send(buf); 
            });
        }).error(next);

};
