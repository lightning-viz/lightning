var models = require('../models');
var Q = require('q');
var _ = require('lodash');


exports.getData = function (req, res, next) {
    var vizId = req.params.vid;

    var Visualization = models.Visualization;

    Visualization
        .find(vizId)
        .then(function(viz) {
            return res.json({
                data: viz.data
            });
        }).error(next);
};

exports.getSettings = function (req, res, next) {
    var vizId = req.params.vid;

    var Visualization = models.Visualization;

    Visualization
        .find(vizId)
        .then(function(viz) {
            return res.json({
                settings: viz.settings || {}
            });
        }).error(next);
};

exports.getDataWithKeys = function (req, res, next) {

    var vizId = req.params[0];
    var keys = _.filter(req.params[1].split('/'), function(k) {
        return k.trim() !== '';
    });

    console.log(keys);


    models.Visualization
        .queryDataForVisualization(vizId, keys)
        .then(function(results) {
            return res.json({
                data: results[0].data
            });
        }).error(next);
};

exports.getSettingsWithKeys = function (req, res, next) {

    var vizId = req.params[0];
    var keys = _.filter(req.params[1].split('/'), function(k) {
        return k.trim() !== '';
    });

    console.log(keys);

    models.Visualization
        .querySettingsForVisualization(vizId, keys)
        .then(function(results) {
            return res.json({
                settings: results[0].settings || {}
            });
        }).error(next);
};



exports.update = function (req, res, next) {

    var vid = req.params.vid;
    var Visualization = models.Visualization;

    console.log('updating visualization ' + vid);

    Visualization
        .update(req.body, {
            id: vid
        }).success(function(visualizations) {
            return res.status(200).send();
        }).error(function(err) {
            console.log(err);
            return res.status(500).send();
        });

};

exports.updateSettings = function (req, res, next) {

    var vid = req.params.vid;
    var Visualization = models.Visualization;

    console.log('updating visualization ' + vid);

    Visualization
        .find(vizId)
        .then(function(viz) {
            viz.settings = _.extend(viz.settings, req.body);

            viz.save()
                .then(function() {
                    return res.json({
                        settings: viz.settings
                    });
                }).error(next);
        }).error(next);

};

exports.updateData = function (req, res, next) {

    var vizId = req.params.vid;
    var fieldName = req.params.field;

    models.Visualization
        .find(vizId)
        .then(function(viz) {
            
            if(fieldName) {
                viz.data[fieldName] = req.body.data;
            } else {
                viz.data = req.body.data;
            }

            viz.save()
                .then(function() {
                    return res.json(viz);
                }).error(next);
        }).error(next);
};


exports.read = function (req, res, next) {

    var vizId = req.params.vid;
    var Visualization = models.Visualization;
    var VisualizationType = models.VisualizationType;

    Q.all([
        Visualization.find(vizId),
        VisualizationType.findAll()
    ]).spread(function(viz, vizTypes) {
            res.render('session/visualization', {
                viz: viz,
                vizTypes: _.object(_.map(vizTypes, function(item) {
                    return [item.name, item];
                }))
            });
    }).fail(next);
};

exports.embed = function (req, res, next) {

    var vizId = req.params.vid;
    var Visualization = models.Visualization;
    var VisualizationType = models.VisualizationType;

    Q.all([
        Visualization.find(vizId),
        VisualizationType.findAll()
    ]).spread(function(viz, vizTypes) {
            res.render('session/visualization-embed', {
                viz: viz,
                vizTypes: _.object(_.map(vizTypes, function(item) {
                    return [item.name, item];
                }))
            });
    }).fail(next);
};