
/*!
 * Module dependencies.
 */

var _ = require('lodash');
var multiparty = require('multiparty');
var knox = require('knox');
var randomstring = require('randomstring');
var path = require('path');
var easyimage = require('easyimage');
var async = require('async');
var models = require('../models');
var Q = require('q');


var s3Client = knox.createClient({
    secure: false,
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET,
});


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
        VisualizationType.findAll()
    ]).spread(function(session, visualizations, vizTypes) {

        _.each(visualizations, function(viz) {
            console.log(viz.images);
        });
        // console.log(session.visualizations);

        res.render('session/feed', {
            session: session,
            visualizations: visualizations,
            vizTypes: _.object(_.map(vizTypes, function(item) {
                return [item.name, item];
            }))
        });
    }).fail(next);
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


exports.create = function(req, res, next) {
    models.Session
        .create()
        .then(function(session) {
            return res.redirect('/sessions/' + session.id + '/feed/');    
        }).error(next);
};



exports.getNew = function(req, res, next) {
    models.Session
        .create()
        .then(function(session) {
            return res.redirect('/sessions/' + session.id + '/feed/');    
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


            console.log(fields.type[0]);
            _.each(files, function(f) {
                thumbnailAndUpload(f, sessionId, function(err, data) {

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


exports.appendData = function (req, res, next) {

    var sessionId = req.params.sid;
    var vizId = req.params.vid;
    var fieldName = req.params.field;


    models.Visualization
        .find(vizId)
        .then(function(viz) {
            if(req.is('json')) {

                if(_.isArray(viz.data[fieldName])) {
                    viz.data[fieldName].push(req.body.data);
                } else if(_.isUndefined(viz.data[fieldName])) {
                    console.log(fieldName);
                    viz.data[fieldName] = req.body.data;
                } else {
                    console.log('wtf field');
                }

                viz
                    .save()
                    .then(function() {
                        return res.json(viz);
                    }).error(next);
            
            } else if(fieldName === 'images') {

                var form = new multiparty.Form();

                form.parse(req, function(err, fields, files) {
                    _.each(files, function(f) {
                        thumbnailAndUpload(f, sessionId, function(err, data) {

                            var imgData = data.imgData;
                            var s3Response = data.response;

                            viz.images.push(imgData);
                            viz
                                .save()
                                .then(function() {
                                    res.statusCode = s3Response.statusCode;
                                    s3Response.pipe(res);
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


var thumbnailAndUpload = function(f, sessionId, callback) {

    var maxWidth = 500;
    var maxHeight = 500;

    // Image file info
    var imgPath = f[0].path;
    var extension = path.extname(imgPath).toLowerCase();
    var filenameWithoutExtension = path.basename(imgPath, extension);


    var thumbnailPath;

    if(process.env.NODE_ENV === 'production') {
        thumbnailPath = path.resolve(__dirname + '/../../'  + './tmp/' + filenameWithoutExtension + '_thumbnail' + extension);
    } else {
        thumbnailPath = path.dirname(imgPath) + filenameWithoutExtension + '_thumbnail' + extension;
    }
    

    // Upload paths for s3
    var uploadName = randomstring.generate();
    var destPath = '/sessions/' + sessionId + '/';
    var originalS3Path = destPath + uploadName;
    var thumbnailS3Path = destPath + uploadName + '_small';


    // s3 headers
    var headers = {
      'x-amz-acl': 'public-read',
    };
    if( extension === '.jpg' || extension === '.jpeg' ) {
        headers['Content-Type'] = 'image/jpeg';
    } else if (extension === '.png') {
        headers['Content-Type'] = 'image/png';
    }

    easyimage
        .info(imgPath)
        .then(function(file) {
            var thumbWidth;
            var thumbHeight;

            console.log('outputing to: ' + thumbnailPath);

            if(file.width > file.height) {
                thumbWidth = Math.min(maxWidth, file.width);
                thumbHeight = file.height * (thumbWidth / file.width);
            } else {
                thumbHeight = Math.min(maxHeight, file.height);
                thumbWidth = file.width * (thumbHeight / file.height);
            }

            return easyimage.resize({
                src: imgPath,
                dst: thumbnailPath,
                width: thumbWidth,
                height: thumbHeight
            });
        }).then(function() {
            async.parallel([
                function(callback) {
                    console.log(imgPath + ':' + originalS3Path);
                    s3Client.putFile(imgPath, originalS3Path, headers, callback);
                },
                function(callback) {
                    console.log(thumbnailPath + ':' + thumbnailS3Path);
                    s3Client.putFile(thumbnailPath, thumbnailS3Path, headers, callback);
                }
            ], function(err, results) {
                var s3Response = results[0];

                var imgURL = 'https://s3.amazonaws.com/' + process.env.S3_BUCKET + originalS3Path;
                // var thumbURL = 'https://s3.amazonaws.com/' + process.env.S3_BUCKET + thumbnailS3Path;

                var imgData = imgURL;
                // {
                //     original: imgURL,
                //     thumbnail: thumbURL
                // };

                callback(null, {
                    response: s3Response,
                    imgData: imgData
                });
                
            });
        }, function(err) {
            console.log(err);
            callback(err);
        });
};