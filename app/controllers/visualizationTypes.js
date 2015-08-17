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
var Q = require('q');

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

exports.json = function (req, res, next) {

    var name = req.params.vizName;
    models.VisualizationType.find({
            where: {
                moduleName: name
            }
        })
        .then(function(vizType) {
            return res.json(vizType);
        }).catch(next);
};

exports.refreshNPM = function(req, res, next) {
    console.log('refreshing npm-based visualizations');

    models.VisualizationType
        .findAll({
            where: {
                isModule: true
            }
        }).then(function(vizTypes) {
            Q.all(_.map(vizTypes, function(vizType) {
                return vizType.refreshFromNPM();
            })).spread(function() {
                console.log("Successfully updated from npm.");
            }).catch(function(err) {
                console.log("Error refreshing from npm:");
                console.log(err);
            });

            return res.redirect(config.baseURL + 'visualization-types');
        }).catch(function(err) {
            console.log(err);
            return res.status(500).send();
        });
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
        .create(_.pick(req.body, 'name', 'initialDataFields', 'isStreaming', 'javascript', 'styles', 'markup', 'sampleData', 'sampleOptions'))
        .then(function(type) {
            return res.json(type);
        }).catch(function(err) {
            return res.status(500).send(err);
        });
        
};

exports.edit = function (req, res, next) {

    models.VisualizationType
        .find(req.params.vid)
        .success(function(vizType) {
            return vizType.updateAttributes(_.pick(req.body, 'name', 'isStreaming', 'initialDataFields', 'javascript', 'styles', 'markup'));
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
            vizType.deleteAndUninstall().then(function() {
                return res.json(vizType);                
            }).error(next);
        }).error(next);
};

exports.getDelete = function(req, res, next) {
    
    var vizTypeId = req.params.vid;

    models.VisualizationType
        .find(vizTypeId)
        .then(function(vizType) {
            vizType
                .deleteAndUninstall()
                .then(function() {
                    return res.redirect(config.baseURL + 'visualization-types/');
                }).catch(next);
        }).catch(next);
};



exports.preview = function(req, res, next) {

    var tmpPath = path.resolve(__dirname + '/../../tmp/js-build/' + uuid.v4() + '/');
    req.session.lastBundlePath = tmpPath;

    var vizTypePromise, name;

    if(req.query.url) {
        var url = req.query.url;
        name = url;
        if(req.query.path) {
            name += '/' + req.query.path;
        }

        name = req.query.name || /[^/]*$/.exec(name)[0];

        vizTypePromise = models.VisualizationType
            .createFromRepoURL(url, { name: name }, {preview: true, path: req.query.path});
    } else if(req.query.path && process.env.NODE_ENV !== 'production') {
        var p = path.resolve(req.query.path);
        name = req.query.name || /[^/]*$/.exec(p)[0];

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
                        b.require(vizType.moduleName, {
                            expose: vizType.moduleName
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
                        var scssData = '#lightning-body {\n';
                        if(vizType.styles) {
                            scssData += vizType.styles + '\n';
                        }
                        scssData += '\n}';
                        sass.render({
                            data: scssData,
                            success: function(sassResults) {
                                if(req.url.indexOf('/preview/full') > -1) {
                                    return res.render('viz-types/full-preview', {
                                        vizType: vizType,
                                        javascript: javascript,
                                        css: sassResults.css,
                                        path: path.resolve(req.query.path || ''),
                                        url: req.query.url,
                                        source: req.query.url ? 'gitRepo' : 'localFolder'
                                    });
                                }
                                return res.render('viz-types/preview-editor', {
                                    vizType: vizType,
                                    javascript: javascript,
                                    css: sassResults.css,
                                    path: path.resolve(req.query.path || ''),
                                    url: req.query.url,
                                    source: req.query.url ? 'gitRepo' : 'localFolder'
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

    models.VisualizationType
        .findAll({
            where: {
                moduleName: name
            }
        }).then(function(visualizations) {
            if(visualizations && visualizations.length) {
                throw new Error('Please delete the installed ' + visualizations[0].name + ' visualization before trying to preview ' + name);
            }

            var linker;
            if(location === 'registry') {
                linker = models.VisualizationType.linkFromNPM.bind(models.VisualizationType);
            } else if(location === 'local') {
                linker = models.VisualizationType.linkFromLocalModule.bind(models.VisualizationType);
            } else {
                return res.status(500).send('Invalid location.').end();
            }

            return linker(name);
        }).then(function(vizType) {
            var b = browserify();
            b.require(name);

            b.bundle(function(err, buf) {

                if(err) {
                    console.log(err);
                    return res.status(500).end();
                }

                var javascript = buf.toString('utf8');

                return res.render('viz-types/preview-editor', {
                    vizType: vizType,
                    javascript: javascript,
                    css: '',
                    location: location,
                    source: 'npm'
                });
            });
        }).catch(function(err) {
            return res.status(500).send(err.message).end();
        });
};

exports.importNPM = function(req, res, next) {

    var location = req.params.location;
    var name = req.query.name;

    console.log('requested to link module: ' + name);

    models.VisualizationType
        .findAll({
            where: {
                moduleName: name
            }
        }).then(function(visualizations) {
            if(visualizations && visualizations.length) {
                throw new Error('Please delete the installed ' + visualizations[0].name + ' visualization before trying to install ' + name);
            }
            var creator;
            if(location === 'registry') {
                creator = models.VisualizationType.createFromNPM.bind(models.VisualizationType);
            } else if(location === 'local') {
                creator = models.VisualizationType.createFromLocalModule.bind(models.VisualizationType);
            } else {
                return res.status(500).send('Invalid location.').end();
            }

            return creator(name);
        }).then(function(vizType) {
            return res.redirect('/visualization-types/edit/' + vizType.id);
        }).catch(function(err) {
            return res.status(500).send(err.message).end();
        });
};

exports.importViz = function(req, res, next) {

    var name = req.body.name  || req.query.name;
    var url = req.body.url || req.query.url;
    var path = req.body.path || req.query.path;

    var createPromise;
    if(url) {
        createPromise = models.VisualizationType.createFromRepoURL(url, {name: name});
    } else if(path) {
        createPromise = models.VisualizationType.createFromFolder(path, {name: name}, {preview: false});
    } else {
        return res.status(500).send('Invalid location.').end();
    }

    createPromise
        .then(function(viz) {
            return res.redirect('/visualization-types/edit/' + viz.id);
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
    } else if(method === 'git' || method === 'local') {
        if(importPreview === 'import') {
            return exports.importViz(req, res, next);
        } else {
            return exports.preview(req, res, next);
        }
    }

};
