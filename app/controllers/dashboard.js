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



exports.addData = function (req, res, next) {
    var sessionId = req.params.sid;

    var Visualization = models.Visualization;

    if(req.is('json')) {
        Visualization
            .create({
                data: req.body.data,
                type: req.body.type,
                SessionId: sessionId
            }).then(function(viz) {
                req.io.of('/sessions/' + sessionId)
                    .emit('viz', viz);  
                return res.json(viz);
            }).error(next);
    } else {

        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {

            files = _.map(files, function(v) { return v[0].path;});

            utils
                .thumbnailAndUpload(files, {
                    sessionId: sessionId
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

                    return Visualization
                        .create({
                            type:  type,
                            images: images,
                            SessionId: sessionId
                        });

                }).then(function(viz) {
                    req.io.of('/sessions/' + sessionId)
                        .emit('viz', viz);

                    return res.json(viz);
                }).catch(next);
        });
    }
};



exports.appendData = function (req, res, next) {

    var sessionId = req.params.sid;
    var vizId = req.params.vid;
    var fieldName = req.params.field;

    var retViz;

    if(req.is('json')) {
        models.Visualization
            .find(vizId)
            .then(function(viz) {
                if(!viz){
                    throw new Error(404);
                }
                retViz = viz;

                req.io.of('/sessions/' + sessionId)
                    .emit('append', {
                        vizId: viz.id,
                        data: req.body.data
                    });
                return viz.appendData(req.body.data, fieldName);
            })
            .then(function() {
                return res.json(retViz);
            }).error(next);

    } else if(fieldName === 'images') {

        models.Visualization
            .find(vizId)
            .then(function(viz) {
                if(!viz){
                    throw new Error(404);
                }
                retViz = viz;

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
                    sessionId: sessionId
                });
            })
            .then(function(images) {
                req.io.of('/sessions/' + sessionId)
                    .emit('append', {
                        vizId: vizId, 
                        data: images
                    });

                return retViz.appendImages(images);
            })
            .then(function() {
                return res.json(retViz);
            })
            .error(next);

    } else {
        return next(500);
    }


};


exports.updateData = function (req, res, next) {

    var sessionId = req.params.sid;
    var vizId = req.params.vid;
    var fieldName = req.params.field;
    var retViz;

    if(req.is('json')) {
        models.Visualization
            .find(vizId)
            .then(function(viz) {
                if(!viz){
                    throw new Error(404);
                }
                retViz = viz;

                req.io.of('/sessions/' + sessionId)
                    .emit('update', {
                        vizId: viz.id,
                        data: req.body.data
                    });
                return viz.updateData(req.body.data, fieldName);
            })
            .then(function() {
                return res.json(retViz);
            }).error(next);
    } else if(fieldName === 'images') {

        models.Visualization
            .find(vizId)
            .then(function(viz) {
                if(!viz){
                    throw new Error(404);
                }
                retViz = viz;

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
                    sessionId: sessionId
                });
            })
            .then(function(images) {
                req.io.of('/sessions/' + sessionId)
                    .emit('update', {
                        vizId: vizId, 
                        data: images
                    });

                return retViz.updateImages(images);
            })
            .then(function() {
                return res.json(retViz);
            })
            .error(next);
    } else {
        return next(500);
    }

};

