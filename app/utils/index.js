'use strict';

var config = require('../../config/config');
var knox = require('knox');
var randomstring = require('randomstring');
var path = require('path');
var commandExists = require('command-exists');
var easyimage = require('easyimage');
var async = require('async');
var fs = require('fs-extra');
var Q = require('q');
var _ = require('lodash');


var _thumbnailAndUpload = function(f, opts, callback) {

    var staticUrl = '/';
    if(config.url) {
        staticUrl = 'http://' + config.url + '/';
    }

    // check if thumbnailing exists,
    // and if s3 creds exist
    var s3Exists = !!config.s3.key;
    var s3Client = null;

    if(s3Exists) {

        s3Client = knox.createClient({
            secure: false,
            key: process.env.S3_KEY,
            secret: process.env.S3_SECRET,
            bucket: process.env.S3_BUCKET,
        });
     }

    var maxWidth = 500;
    var maxHeight = 500;

    // Image file info
    var imgPath = path.resolve(f);
    var extension = path.extname(imgPath).toLowerCase();
    var filenameWithoutExtension = path.basename(imgPath, extension);


    var thumbnailPath;

    if(process.env.NODE_ENV === 'production') {
        thumbnailPath = path.resolve(__dirname + '/../../' + './tmp/' + filenameWithoutExtension + '_thumbnail' + extension);
    } else {
        thumbnailPath = path.dirname(imgPath) + filenameWithoutExtension + '_thumbnail' + extension;
    }

    // Upload paths for s3
    var uploadName = randomstring.generate();


    var destPath;

    if(opts.sessionId) {
        destPath = '/sessions/' + opts.sessionId + '/';
    } else if(opts.dashboardId) {
        destPath = '/dashboard/' + opts.dashboardId + '/';
    } else {
        throw new Error('Must provide session id or dashboard id when thumbnailing and uploading images!');
    }

    var originalS3Path = destPath + uploadName;
    var thumbnailS3Path = destPath + uploadName + '_small';

    // s3 headers
    var headers = {
      'x-amz-acl': 'public-read',
      'Access-Control-Allow-Origin': '*',
    };
    if( extension === '.jpg' || extension === '.jpeg' ) {
        headers['Content-Type'] = 'image/jpeg';
    } else if (extension === '.png') {
        headers['Content-Type'] = 'image/png';
    }

    commandExists('identify', function(err, imageMagickExists) {

        if(imageMagickExists) {

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

                    if(s3Exists) {
                        async.parallel([
                            function(callback) {
                                console.log('s3 exists');
                                console.log('uploading image');
                                console.log(imgPath + ':' + originalS3Path);
                                s3Client.putFile(imgPath, originalS3Path, headers, callback);
                            },
                            function(callback) {
                                console.log('uploading thumbnail');
                                console.log(thumbnailPath + ':' + thumbnailS3Path);
                                s3Client.putFile(thumbnailPath, thumbnailS3Path, headers, callback);
                            }
                        ], function(err) {
                            if(err) {
                                return callback(err);
                            }
                            var imgURL = 'https://s3.amazonaws.com/' + process.env.S3_BUCKET + originalS3Path;
                            callback(null, imgURL);
                        });
                    } else {

                        console.log('S3 Credentials not found. Using local images');

                        async.parallel([
                            function(callback) {
                                var outpath = path.resolve(__dirname + '../../../public/images/uploads' + originalS3Path);
                                fs.copy(imgPath, outpath, callback);        
                            },
                            function(callback) {
                                var outpath = path.resolve(__dirname + '../../../public/images/uploads' + thumbnailS3Path);
                                fs.copy(thumbnailPath, outpath, callback);
                            }
                        ], function(err) {
                            if(err) {
                                return callback(err);
                            }

                            return callback(null, staticUrl + 'images/uploads' + originalS3Path);
                        });
                    }

                }, function(err) {
                    console.log(err);
                    callback(err);
                });
        } else {

            if(s3Exists) {
                async.parallel([
                    function(callback) {
                        console.log(imgPath + ':' + originalS3Path);
                        s3Client.putFile(imgPath, originalS3Path, headers, callback);
                    },
                    function(callback) {
                        console.log(thumbnailPath + ':' + thumbnailS3Path);
                        s3Client.putFile(thumbnailPath, thumbnailS3Path, headers, callback);
                    }
                ], function(err) {
                    if(err) {
                        return callback(err);
                    }

                    var imgURL = 'https://s3.amazonaws.com/' + process.env.S3_BUCKET + originalS3Path;
                    callback(null, imgURL);
                    
                });
            } else {

                console.log('S3 Credentials not found. Using local images');

                async.parallel([
                    function(callback) {
                        var outpath = path.resolve(__dirname + '../../../public/images/uploads' + originalS3Path);
                        console.log(outpath);
                        fs.copy(imgPath, outpath, callback);        
                    },
                    function(callback) {
                        var outpath = path.resolve(__dirname + '../../../public/images/uploads' + thumbnailS3Path);
                        console.log(outpath);
                        fs.copy(imgPath, outpath, callback);
                    }
                ], function(err) {
                    if(err) {
                        return callback(err);
                    }

                    return callback(null, staticUrl + 'images/uploads' + originalS3Path);
                });
            }
        }
    });


};

module.exports = {

    thumbnailAndUpload: function(f, opts) {

        if(_.isArray(f)) {

            console.log('is array');
            var files = f;
            return Q.allSettled(_.map(files, function(f) {
                return Q.nfcall(_thumbnailAndUpload, f, opts);
            })).then(function(results) {

                console.log('is settled');
                var imgs = [];

                _.each(results, function(r) {
                    if(r.state === 'fulfilled') {
                        imgs.push(r.value);
                    } else {
                        throw new Error(r.reason);
                    }
                });

                return imgs;
            });

        } else {
            return this.thumbnailAndUpload([f], opts);
        }
    },

};
