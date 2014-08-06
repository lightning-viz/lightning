
/*!
 * Module dependencies.
 */

var _ = require('lodash');
var mongoose = require('mongoose');
var Session = mongoose.model('Notebook');
var Visualization = mongoose.model('Visualization');
var multiparty = require('multiparty');
var knox = require('knox');
var Batch = require('batch');
var randomstring = require("randomstring");
var path = require('path');


var s3Client = knox.createClient({
    secure: false,
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET,
});


exports.index = function (req, res) {

    Session.find(function(err, sessions) {

        res.render('session/index', {
            sessions: sessions
        });
    });
};


exports.feed = function (req, res, next) {

    var sessionId = req.params.sid;


    Session.findById(sessionId, function(err, session) {
        if(err) {
            return next(err);
        }

        res.render('session/feed', {
            session: session
        });
    });
};

exports.read = function (req, res, next) {

    var sessionId = req.params.sid;
    var vizId = req.params.vid;

    Session.findById(sessionId, function(err, session) {
        if(err) {
            return next(err);
        }

        var viz = _.find(session.visualizations, function (v) {
            return v.id === vizId;
        });

        res.render('session/visualization', {
            session: session,
            viz: viz
        });
    });
};


exports.create = function(req, res, next) {
    var session = new Session();
    session.save(function(err) {
        if(err) {
            return next(err);
        }
        return res.redirect('/sessions/' + session.id + '/feed/');
    });
};



exports.addData = function (req, res, next) {
    var sessionId = req.params.sid;

    // var form = new multiparty.Form({
    //     autoFiles
    // });

    Session.findById(sessionId, function(err, session) {
        if(err) {
            return next(err);
        }

        if(req.is('json')) {

            console.log('finding session');
            if(err) {
                return next(err);
            }

            session.visualizations.push({data: req.body.data, type: req.body.type});
            var viz = session.visualizations[session.visualizations.length - 1];

            req.io.of('/sessions/' + sessionId)
                .emit('viz', viz);

            session.save(function(err) {
                if(err) {
                    return next(err);
                }

                return res.json(200);
            });

        } else {
            var headers = {
              'x-amz-acl': 'public-read',
            };
            var form = new multiparty.Form();
            var batch = new Batch();
            
            // batch.push(function(cb) {
            //     form.on('field', function(name, value) {
            //         console.log('field');
            //         if (name === 'path') {
            //             var destPath = value;
            //             if (destPath[0] !== '/') {
            //                 destPath = '/' + destPath;
            //             }
            //             cb(null, destPath);
            //         }
            //     });
            // });

            batch.push(function(done) {
                form.on('part', function(part) {
                    if (!part.filename) {
                        return;
                    }
                    done(null, part);
                });
            });

            batch.end(function(err, results) {
                if (err) {
                    console.log(err);
                    return next(err);
                }

                form.removeListener('close', onEnd);
                var part = results[0];
                var destPath = '/sessions/' + sessionId + '/' + randomstring.generate();

                headers['Content-Length'] = part.byteCount;

                var filetype = path.extname(part.filename).toLowerCase();

                if( filetype === '.jpg' || filetype === '.jpeg' ) {
                    headers['Content-Type'] = 'image/jpeg';
                } else if (filetype === '.png') {
                    headers['Content-Type'] = 'image/png';
                }

                s3Client.putStream(part, destPath, headers, function(err, s3Response) {
                
                    if (err) {
                        return next(err);
                    }

                    var imgURL = 'https://s3.amazonaws.com/' + process.env.S3_BUCKET + destPath;

                    console.log('about to save');
                    session.visualizations.push({images: [imgURL], type: 'image'});
                    var viz = session.visualizations[session.visualizations.length - 1];
                    console.log('saved');

                    req.io.of('/sessions/' + sessionId)
                        .emit('viz', viz);

                    session.save(function(err) {
                        if(err) {
                            return next(err);
                        }

                        res.statusCode = s3Response.statusCode;
                        s3Response.pipe(res);
                    });

                    console.log('https://s3.amazonaws.com/' + process.env.S3_BUCKET + destPath);
                });
            });

            var onEnd = function() {
                throw new Error('no uploaded file');
            };

            form.on('close', onEnd);
            form.parse(req);

        }
    });

};

exports.addImage = function (req, res, next) {

    var sessionId = req.params.sid;
    var vizId = req.params.vid;

    Session.findById(sessionId, function(err, session) {
        if(err) {
            return next(err);
        }

        var viz = _.find(session.visualizations, function (v) {
            return v.id === vizId;
        });

        console.log(req.files);
        return res.json(200);


        // res.render('session/visualization', {
        //     session: session,
        //     viz: viz
        // });
    });
};
