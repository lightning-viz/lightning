var models = require('../models');
var Q = require('q');

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

exports.getDataField = function (req, res, next) {

    var vizId = req.params.vid;
    var fieldName = req.params.field;

    console.log('getting data field ' + fieldName);

    models.Visualization
        .getNamedObjectForVisualization(vizId, fieldName)
        .then(function(data) {
            return res.json({
                data: data
            });
        }).error(next);
};


exports.getDataAtIndex = function (req, res, next) {

    var vizId = req.params.vid;
    var fieldName = req.params.field;
    var index = req.params.index;

    models.Visualization
        .getNamedObjectAtIndexForVisualization(vizId, fieldName, index)
        .then(function(data) {
            return res.json({
                data: data[0][fieldName]
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