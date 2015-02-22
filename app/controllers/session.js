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

    models.Session.findAll({
        order: '"createdAt" DESC'
    }).then(function(sessions) {
        res.render('session/index', {
            sessions: sessions
        });
    }).error(next);
};


exports.feed = function (req, res, next) {

    var sessionId = req.params.sid;
    var Session = models.Session;
    var VisualizationType = models.VisualizationType;
    var Visualization = models.Visualization;

    Q.all([
        Session
            .find({
                where: {
                    id: sessionId
                }
            }),
        Visualization
            .findAll({
                where: {
                    SessionId: sessionId
                }
            }),
        VisualizationType.findAll({
            order: '"name" ASC'
        })
    ]).spread(function(session, visualizations, vizTypes) {

        if(!session) {
            return res.status(404).send('Session not found');
        }

        _.each(visualizations, function(viz) {
            console.log(viz.type);
        });

        res.render('session/feed', {
            session: session,
            visualizations: visualizations,
            vizTypes: _.object(_.map(vizTypes, function(item) {
                return [item.name, item];
            }))
        });
    }).fail(next);
};


exports.publicRead = function (req, res, next) {

    var sessionId = req.params.sid;
    var Session = models.Session;
    var VisualizationType = models.VisualizationType;
    var Visualization = models.Visualization;

    Q.all([
        Session
            .find({
                where: {
                    id: sessionId
                }
            }),
        Visualization
            .findAll({
                where: {
                    SessionId: sessionId
                }
            }),
        VisualizationType.findAll({
            order: '"name" ASC'
        })
    ]).spread(function(session, visualizations, vizTypes) {

        if(!session) {
            return res.status(404).send('Session not found');
        }

        _.each(visualizations, function(viz) {
            console.log(viz.images);
        });

        res.render('session/feed-public', {
            session: session,
            visualizations: visualizations,
            vizTypes: _.object(_.map(vizTypes, function(item) {
                return [item.name, item];
            }))
        });
    }).fail(next);
};


exports.update = function (req, res, next) {

    var sessionId = req.params.sid;
    var Session = models.Session;


    Session
        .update(req.body, {
            id: sessionId
        }).success(function(sessions) {
            return res.json(sessions);
        }).error(next);

};



exports.create = function(req, res, next) {

    models.Session
        .create(_.pick(req.body, 'name'))
        .then(function(session) {
            return res.json(session);
        }).error(next);
};



exports.getCreate = function(req, res, next) {
    models.Session
        .create()
        .then(function(session) {
            return res.redirect('/sessions/' + session.id + '/feed/');    
        }).error(next);
};

exports.delete = function(req, res, next) {
    var sessionId = req.params.sid;

    models.Session
        .find(sessionId)
        .then(function(session) {
            session.destroy().success(function() {
                return res.json(session);                
            }).error(next);
        }).error(next);
};



exports.getDelete = function(req, res, next) {
    
    var sessionId = req.params.sid;

    models.Session
        .find(sessionId)
        .then(function(session) {
            session.destroy().success(function() {
                return res.redirect('/sessions/');
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

