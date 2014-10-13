var models = require('../models');
var _ = require('lodash');
var resumer = require('resumer');
var browserify = require('browserify');
var path = require('path');


exports.getDynamicVizBundle = function (req, res, next) {

    // Get all vizTypes in array

    console.log(req.query);

    var visualizationTypes = req.query.visualizations;

    var b = browserify();
    res.set('Content-Type', 'application/javascript');

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

            b.bundle().pipe(res);
        }).error(next);

};
