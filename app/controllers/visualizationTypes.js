var models = require('../models');
var _ = require('lodash');
var cache = require('../cache');
var sass = require('node-sass');
var browserify = require('browserify');
var path = require('path');
var uuid = require('node-uuid');
var resumer = require('resumer');
var tasks = require('../../tasks');
var config = require('../../config/config');
var npm = require('npm');


var matchedPackages = [];
console.log('searching');
// npm.commands.search(['lightning-visualization'], function(packages) {
//     _.each(packages, function(p, packageName) {
//         console.log(packageName);
//         console.log(p);
//     });
// });

exports.index = function (req, res, next) {

    models.VisualizationType.findAll()
        .then(function(types) {
            return res.json(types);
        }).error(next);
};


exports.show = function (req, res, next) {


    models.VisualizationType.findAll({
            order: '"name" ASC'
        })
        .then(function(types) {
            
            return res.render('viz-types/show', {
                vizTypes: types
            });

        }).error(next);
};

exports.resetDefaults = function(req, res, next) {

    console.log('resetting visualization defaults');

    models.VisualizationType
        .destroy({}, {truncate: true}).success(function() {

            console.log('successfully deleted current visualizations');
            
            tasks.getDefaultVisualizations(function() {
                return res.redirect(config.baseURL + 'visualization-types');
            });

        }).error(function(err) {
            console.log(err);
            return res.status(500).send();
        });
};

exports.fetchDefaults = function (req, res, next) {

    tasks.getDefaultVisualizations(function() {
        return res.redirect(config.baseURL + 'visualization-types');
    });
};

exports.create = function (req, res, next) {
    
    models.VisualizationType
        .create(_.pick(req.body, 'name', 'initialDataFields', 'javascript', 'styles', 'markup', 'sampleData', 'sampleOptions'))
        .then(function(type) {
            return res.json(type);
        }).error(function(err) {
            return res.status(500).send();
        });
        
};

exports.edit = function (req, res, next) {

    console.log('editing');
    
    models.VisualizationType
        .find(req.params.vid)
        .success(function(vizType) {
            return vizType.updateAttributes(_.pick(req.body, 'name', 'initialDataFields', 'javascript', 'styles', 'markup'));
        })
        .success(function(vizType) {
            setTimeout(function() {
                _.each(cache.keys(), function(key) {

                    console.log(key);
                    if(key.indexOf(vizType.name) > -1) {
                        console.log('deleting ' + key);
                        cache.del(key);        
                    }
                });
            }, 0);
            return res.status(200).send();
        }).error(function() {
            return res.status(500).send();
        });      
};

exports.delete = function (req, res, next) {

    var vizTypeId = req.params.vid;

    models.VisualizationType
        .find(vizTypeId)
        .then(function(vizType) {
            vizType.destroy().success(function() {
                return res.json(vizType);                
            }).error(next);
        }).error(next);
};

exports.getDelete = function(req, res, next) {
    
    var vizTypeId = req.params.vid;

    models.VisualizationType
        .find(vizTypeId)
        .then(function(vizType) {
            vizType.destroy().success(function() {
                return res.redirect(config.baseURL + 'visualization-types/');
            }).error(next);
        }).error(next);
};



exports.preview = function(req, res, next) {

    console.log('requested url: ' + req.url);

    var url = req.query.url;
    var file = req.query.file;

    var tmpPath = path.resolve(__dirname + '/../../tmp/js-build/' + uuid.v4() + '/');

    req.session.lastBundlePath = tmpPath;

    var vizTypePromise;

    if(req.query.url) {
        var url = req.query.url;
        var name = url;
        if(req.query.path) {
            name += '/' + req.query.path;
        }

        name = /[^/]*$/.exec(name)[0];

        vizTypePromise = models.VisualizationType
            .createFromRepoURL(url, { name: name }, {preview: true, path: req.query.path});
    } else if(req.query.path && process.env.NODE_ENV !== 'production') {
        var p = path.resolve(req.query.path);
        var name = /[^/]*$/.exec(p)[0];

        vizTypePromise = models.VisualizationType
            .createFromFolder(p, { name: name}, {preview: true});
    }

    vizTypePromise
        .then(function(vizType) {

            console.log('created viz preview');

            vizType.exportToFS(tmpPath)
                .spread(function() {
                    var b = browserify();
                    if(vizType.isModule) {
                        console.log(isModule);
                        b.require(vizType.name, {
                            expose: vizType.name
                        });
                    } else {
                        var stream = resumer().queue(vizType.javascript).end();
                        b.require(stream, {
                            basedir: tmpPath,
                            expose: vizType.name
                        });
                    }

                    b.bundle(function(err, buf) {

                        if(err) {
                            return next(err);
                        }               

                        var javascript = buf.toString('utf8');

                        var scssData = '';
                        if(vizType.styles) {
                            scssData = '#lightning-body {\n';
                            scssData += vizType.styles + '\n';
                            scssData += '\n}';
                        }
                        sass.render({
                            data: scssData,
                            success: function(css) {

                                if(req.url.indexOf('/preview/full') > -1) {
                                    return res.render('viz-types/full-preview', {
                                        vizType: vizType,
                                        javascript: javascript,
                                        css: css
                                    });
                                }
                                return res.render('viz-types/preview-editor', {
                                    vizType: vizType,
                                    javascript: javascript,
                                    css: css
                                });
                                
                            }
                        });
                    });
                });

        }).fail(function(err) {
            next(err);
        });

};

exports.previewNPM = function(req, res, next) {


    var location = req.params.location;
    var name = req.query.name;

    console.log('requested to link module: ' + name);

    var linker;
    if(location === 'registry') {
        linker = models.VisualizationType.linkFromNPM.bind(models.VisualizationType);
    } else if(location === 'local') {
        linker = models.VisualizationType.linkFromLocalModule.bind(models.VisualizationType);
    } else {
        return res.status(500).send('Invalid location.').end();
    }


    linker(name)
        .then(function(vizType) {
            var b = browserify();
            b.require(name);

            b.bundle(function(err, buf) {

                if(err) {
                    console.log(err);
                    return res.status(500).end();
                }

                var javascript = buf.toString('utf8');

                return res.render('viz-types/full-preview', {
                    vizType: vizType,
                    javascript: javascript,
                    css: ''
                });
            })

        }).catch(function(err) {
            console.log(err);
            return res.status(500).send('error compiling module').end();
        });
};

exports.importNPM = function(req, res, next) {

    var location = req.params.location;
    var name = req.query.name;

    console.log('requested to link module: ' + name);

    var creator;
    if(location === 'registry') {
        creator = models.VisualizationType.createFromNPM.bind(models.VisualizationType);
    } else if(location === 'local') {
        creator = models.VisualizationType.createFromLocalModule.bind(models.VisualizationType);
    } else {
        return res.status(500).send('Invalid location.').end();
    }
    console.log(creator);

    creator(name)
        .then(function(vizType) {

            var b = browserify();

            b.require(name);
            b.bundle(function(err, buf) {

                if(err) {
                    console.log(err);
                    return res.status(500).send('error compiling module').end();
                }
                var javascript = buf.toString('utf8');

                return res.render('viz-types/full-preview', {
                    vizType: vizType,
                    javascript: javascript,
                    css: ''
                });
            })

        }).catch(function(err) {
            console.log(err);
            return res.status(500).send('error compiling module').end();
        });
};


exports.importViz = function(req, res, next) {

    var backURL = req.header('Referer');
    var name = req.body.name  || req.query.name;
    var url = req.body.url || req.query.url;

    console.log(name);
    console.log(url);

    models.VisualizationType
        .createFromRepoURL(url, { name: name})
        .then(function() {
            return res.redirect(backURL);
        }).fail(function(err) {
            next(err);
        });
};

exports.advanced = function (req, res, next) {
    return res.render('viz-types/advanced', {});
};


exports.editor = function (req, res, next) {

    models.VisualizationType.find(req.params.vid)
        .then(function(type) {
            
            return res.render('viz-types/editor', {
                vizType: type
            });

        }).error(next);
};


exports.thumbnail = function (req, res, next) {

    models.VisualizationType.find(req.params.vid)
        .then(function(type) {
            if(type.thumbnailLocation) {
                return res.sendFile(type.thumbnailLocation);
            }
            
            return res.status(404).send('no thumbnail found').end();

        }).error(next);
};




exports.importPreviewHandler = function(req, res, next) {
    var method = req.params.method;
    var importPreview = req.params.importPreview;

    if(method === 'npm') {
        if(importPreview === 'import') {
            return exports.importNPM(req, res, next);
        } else {
            return exports.previewNPM(req, res, next);
        }
    } else if(method === 'git') {
        if(importPreview === 'import') {
            return exports.importViz(req, res, next);
        } else {
            return exports.preview(req, res, next);
        }
    } else {
        return exports.preview(req, res, next);
    }

}
