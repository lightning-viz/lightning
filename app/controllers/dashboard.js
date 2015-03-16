'use strict';
/*!
 * Module dependencies.
 */

var _ = require('lodash');
var multiparty = require('multiparty');
var models = require('../models');
var Q = require('q');
var utils = require('../utils');

exports.index = function (req, res, next) {

    models.Dashboard.findAll({
        order: '"createdAt" DESC'
    }).then(function(dashboards) {
        res.render('dashboard/index', {
            dashboards: dashboards
        });
    }).error(next);
};


exports.show = function (req, res, next) {

    var dashboardId = req.params.did;

    Q.all([
        models.Dashboard
            .find({
                where: {
                    id: dashboardId
                }
            }),
        models.Visualization
            .findAll({
                where: {
                    DashboardId: dashboardId
                }
            }),
        models.DataSet
            .findAll({
                where: {
                    DashboardId: dashboardId
                }
            }),
        models.VisualizationType.findAll({
            order: '"name" ASC'
        })
    ]).spread(function(dashboard, visualizations, dataSets, vizTypes) {

        if(!dashboard) {
            return res.status(404).send('Dashboard not found');
        }

        res.render('dashboard/show', {
            dashboard: dashboard,
            visualizations: visualizations,
            dataSets: dataSets,
            vizTypes: _.object(_.map(vizTypes, function(item) {
                return [item.name, item];
            }))
        });
    }).fail(next);
};



exports.create = function(req, res, next) {

    models.Dashboard
        .create(_.pick(req.body, 'name'))
        .then(function(dashboard) {
            return res.json(dashboard);
        }).error(next);
};



exports.getCreate = function(req, res, next) {
    models.Dashboard
        .create()
        .then(function(dashboard) {
            return res.redirect('/dashboards/' + dashboard.id + '/');    
        }).error(next);
};



exports.update = function (req, res, next) {

    var dashboardId = req.params.did;

    models.Dashboard
        .update(req.body, {
            id: dashboardId
        }).success(function(dashboards) {
            return res.json(dashboards);
        }).error(next);
};



exports.delete = function(req, res, next) {
    var dashboardId = req.params.did;

    models.Dashboard
        .find(dashboardId)
        .then(function(dashboard) {
            dashboard.destroy().success(function() {
                return res.json(dashboard);                
            }).error(next);
        }).error(next);
};



exports.getDelete = function(req, res, next) {
    
    var dashboardId = req.params.did;

    models.Dashboard
        .find(dashboardId)
        .then(function(dashboard) {
            dashboard.destroy().success(function() {
                return res.redirect('/dashboards/');
            }).error(next);
        }).error(next);
};

exports.addVisualization = function(req, res, next) {
    var dashboardId = req.params.did;
    var dataSetId = req.params.dsid;

    models.Visualization
        .create({
            DashboardId: dashboardId,
            DataSetId: dataSetId,
            type: req.body.type
        }).then(function(viz) {
            req.io.of('/dashboards/' + dashboardId)
                .emit('viz', viz);  
            return res.json(viz);
        });

};

exports.deleteVisualization = function (req, res, next) {
    var dashboardId = req.params.did;
    var vizId = req.params.vid;

    models.Visualization
        .find(vizId)
        .then(function(viz) {
            if(!viz) {
                return res.status(404).send();
            }            
            viz.destroy().success(function() {                
                req.io.of('/dashboards/' + dashboardId)
                    .emit('viz:delete', vizId);
                return res.json(viz);                
            }).error(next);
        }).error(next);
};



exports.addData = function (req, res, next) {
    
    var dashboardId = req.params.did;

    if(req.is('json')) {
        models.DataSet
            .create({
                data: req.body.data,
                name: req.body.name,
                DashboardId: dashboardId
            }).then(function(dataset) {
                req.io.of('/dashboards/' + dashboardId)
                    .emit('dataset', dataset);
                return res.json(dataset);
            }).error(next);
    } else {

        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {

            files = _.map(files, function(v) { return v[0].path;});

            utils
                .thumbnailAndUpload(files, {
                    dashboardId: dashboardId
                })
                .then(function(images) {
                    var type = 'image';
                    if(fields.type) {
                        if(_.isArray(fields.type) || _.isObject(fields.type)) {
                            type = fields.type[0];    
                        } else {
                            type = fields.type;
                        }
                    }

                    return models.DataSet
                        .create({
                            type:  type,
                            images: images,
                            DashboardId: dashboardId
                        });

                }).then(function(dataset) {
                    req.io.of('/dashboards/' + dashboardId)
                        .emit('dataset', dataset);

                    return res.json(dataset);
                }).catch(next);
        });
    }
};



exports.appendData = function (req, res, next) {

    var dashboardId = req.params.did;
    var dataSetId = req.params.dsid;
    var fieldName = req.params.field;

    var retDataset;

    if(req.is('json')) {
        models.DataSet
            .find(dataSetId)
            .then(function(dataset) {
                if(!dataset){
                    throw new Error(404);
                }
                retDataset = dataset;

                req.io.of('/dashboards/' + dashboardId)
                    .emit('append', {
                        dataSetId: dataset.id,
                        data: req.body.data
                    });
                return dataSetId.appendData(req.body.data, fieldName);
            })
            .then(function() {
                return res.json(retDataset);
            }).error(next);

    } else if(fieldName === 'images') {

        models.DataSet
            .find(dataSetId)
            .then(function(dataset) {
                if(!dataset){
                    throw new Error(404);
                }
                retDataset = dataset;

                var form = new multiparty.Form();
                return Q.ninvoke(form, 'parse', req);

            })
            .then(function(results) {
                var files = [];
                if(results.length >= 2) {
                    files = results[1];
                }
                files = _.map(files, function(v) { return v[0].path;});

                return utils.thumbnailAndUpload(files, {
                    dashboardId: dashboardId
                });
            })
            .then(function(images) {
                req.io.of('/dashboards/' + dashboardId)
                    .emit('append', {
                        dataSetId: dataset.id, 
                        data: images
                    });

                return retDataset.appendImages(images);
            })
            .then(function() {
                return res.json(retDataset);
            })
            .error(next);

    } else {
        return next(500);
    }


};


exports.updateData = function (req, res, next) {

    var dashboardId = req.params.did;
    var dataSetId = req.params.dsid;
    var fieldName = req.params.field;
    var retDataset;

    if(req.is('json')) {
        models.DataSet
            .find(dataSetId)
            .then(function(dataset) {
                if(!dataset){
                    throw new Error(404);
                }
                retDataset = dataset;

                req.io.of('/dashboards/' + dashboardId)
                    .emit('update', {
                        dataSetId: dataset.id,
                        data: req.body.data
                    });
                return dataset.updateData(req.body.data, fieldName);
            })
            .then(function() {
                return res.json(retDataset);
            }).error(next);
    } else if(fieldName === 'images') {

        models.DataSet
            .find(dataSetId)
            .then(function(dataset) {
                if(!dataset){
                    throw new Error(404);
                }
                retDataset = dataset;

                var form = new multiparty.Form();
                return Q.ninvoke(form, 'parse', req);

            })
            .then(function(results) {
                var files = [];
                if(results.length >= 2) {
                    files = results[1];
                }
                files = _.map(files, function(v) { return v[0].path;});

                return utils.thumbnailAndUpload(files, {
                    dashboardId: dashboardId
                });
            })
            .then(function(images) {
                req.io.of('/dashboards/' + dashboardId)
                    .emit('update', {
                        dataSetId: dataSetId,
                        data: images
                    });

                return retDataset.updateImages(images);
            })
            .then(function() {
                return res.json(retDataset);
            })
            .error(next);
    } else {
        return next(500);
    }

};

