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

            _.each(files, function(f) {
                utils.thumbnailAndUpload(f, {sessionId: sessionId}, function(err, data) {

                    if(err) {
                        console.log('error in thumbnailAndUpload');
                        return res.status(500).send('error creating image thumbnail');
                    }

                    var imgData = data.imgData;

                    console.log(imgData);

                    var type = 'image';
                    if(fields.type) {
                        if(_.isArray(fields.type) || _.isObject(fields.type)) {
                            type = fields.type[0];    
                        } else {
                            type = fields.type;
                        }                        
                    }

                    Visualization
                        .create({
                            type:  type,
                            images: [imgData],
                            SessionId: sessionId
                        }).then(function(viz) {
                            req.io.of('/sessions/' + sessionId)
                                .emit('viz', viz);

                            return res.json(viz);
                        }).error(next);
                });
            });
        });
    }
};



exports.appendData = function (req, res, next) {

    var sessionId = req.params.sid;
    var vizId = req.params.vid;
    var fieldName = req.params.field;


    models.Visualization
        .find(vizId)
        .then(function(viz) {
            if(req.is('json')) {

                if(fieldName) {

                    if(_.isArray(viz.data[fieldName])) {

                        if(viz.type.indexOf('streaming') > -1) {
                            _.each(req.body.data, function(d, i) {
                                if(i < viz.data[fieldName].length) {
                                    viz.data[fieldName][i] = viz.data[fieldName][i].concat(d);
                                }
                            });
                        } else {
                            var vdata = viz.data;
                            vdata[fieldName].push(req.body.data);
                            viz.data = vdata;
                        }
                    } else if(_.isUndefined(viz.data[fieldName])) {
                        viz.data[fieldName] = req.body.data;
                    } else {
                        console.log('unknown field');
                    }
                } else {
                    if(_.isArray(viz.data)) {
                        if(_.isArray(req.body.data)) {

                            if(viz.type.indexOf('streaming') > -1) {
                                _.each(req.body.data, function(d, i) {

                                });
                            } else {
                                viz.data = viz.data.concat(req.body.data);
                            }


                        } else {
                            var vdata = viz.data;
                            vdata.push(req.body.data);
                            viz.data = vdata;
                        }
                    } else if(_.isUndefined(viz.data)) {
                        viz.data = req.body.data;
                    } else {
                        console.log('unknown field');
                    }
                }

                viz
                    .save()
                    .then(function() {
                        return res.json(viz);
                    }).error(next);

                req.io.of('/sessions/' + sessionId)
                    .emit('append', {
                        vizId: viz.id, 
                        data: req.body.data
                    });
            
            } else if(fieldName === 'images') {

                var form = new multiparty.Form();

                form.parse(req, function(err, fields, files) {
                    _.each(files, function(f) {

                        utils.thumbnailAndUpload(f, {sessionId: sessionId}, function(err, data) {

                            if(err) {
                                console.log('error in thumbnailAndUpload');
                                return res.status(500).send('error creating image thumbnail');
                            }
                            var imgData = data.imgData;
                            var s3Response = data.response;

                            if(viz.images) {
                                var vimages = viz.images;
                                vimages.push(imgData);
                                viz.images = vimages;
                            } else {
                                viz.images = [imgData];
                            }

                            viz
                                .save()
                                .then(function() {
                                    if(typeof s3Response === 'object') {
                                        res.statusCode = s3Response.statusCode;
                                        s3Response.pipe(res);
                                    } else {
                                        return res.status(data.response).send('');
                                    }
                                });

                            req.io.of('/sessions/' + sessionId)
                                .emit('append', {
                                    vizId: viz.id, 
                                    data: imgData
                                });

                        });
                    });
                });
            } else {
                return next(500);
            }


        }).error(next);

};



exports.updateData = function (req, res, next) {

    var sessionId = req.params.sid;
    var vizId = req.params.vid;
    var fieldName = req.params.field;


    models.Visualization
        .find(vizId)
        .then(function(viz) {
            if(req.is('json')) {

                if(fieldName) {
                    viz.data[fieldName] = req.body.data;
                } else {
                    viz.data = req.body.data;
                }

                viz
                    .save()
                    .then(function() {
                        return res.json(viz);
                    }).error(next);

                req.io.of('/sessions/' + sessionId)
                    .emit('update', {
                        vizId: viz.id, 
                        data: req.body.data
                    });
            
            } else if(fieldName === 'images') {

                var form = new multiparty.Form();

                form.parse(req, function(err, fields, files) {
                    _.each(files, function(f) {
                        utils.thumbnailAndUpload(f, {sessionId: sessionId}, function(err, data) {

                            if(err) {
                                console.log('error in thumbnailAndUpload');
                                return res.status(500).send('error creating image thumbnail');
                            }
                            var imgData = data.imgData;
                            var s3Response = data.response;

                            viz.images = [imgData];
                            
                            viz
                                .save()
                                .then(function() {

                                    if(typeof s3Response === 'object') {
                                        res.statusCode = s3Response.statusCode;
                                        s3Response.pipe(res);
                                    } else {
                                        return res.status(data.response).send('');
                                    }
                                });

                            req.io.of('/sessions/' + sessionId)
                                .emit('update', {
                                    vizId: viz.id, 
                                    data: imgData
                                });

                        });
                    });
                });
            } else {
                return next(500);
            }


        }).error(next);

};

