var models = require('../models');
var _ = require('lodash');
var cache = require('../cache');
var browserify = require('browserify');
var path = require('path');
var uuid = require('uuid');
var tasks = require('../../tasks');
var config = require('../../config/config');
var Q = require('q');
var debug = require('debug')('lightning:server:controllers:visualization-types');

exports.index = function (req, res, next) {

    models.VisualizationType.findAll()
        .then(function(types) {
            return res.json(types);
        }).catch(next);
};


exports.show = function (req, res, next) {


    models.VisualizationType.findAll({
            order: '"name" ASC'
        })
        .then(function(types) {

            return res.render('viz-types/show', {
                vizTypes: types
            });

        }).catch(next);
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
    debug('refreshing npm-based visualizations');

    models.VisualizationType
        .findAll()
        .then(function(vizTypes) {
            Q.all(_.map(vizTypes, function(vizType) {
                return vizType.refreshFromNPM();
            })).spread(function() {
                debug("Successfully updated from npm.");
            }).catch(function(err) {
                debug("Error refreshing from npm:");
                debug(err);
            });

            return res.redirect(config.baseURL + 'visualization-types');
        }).catch(function(err) {
            debug(err);
            return res.status(500).send();
        });
};

exports.resetDefaults = function(req, res, next) {

    debug('resetting visualization defaults');

    models.VisualizationType
        .destroy({where: {}, truncate: true}).then(function() {
            debug('successfully deleted current visualizations');
            tasks.getDefaultVisualizations(function() {
                return res.redirect(config.baseURL + 'visualization-types');
            });

        }).catch(function(err) {
            debug(err);
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
        .findById(req.params.vid)
        .then(function(vizType) {
            return vizType.updateAttributes(_.pick(req.body, 'name', 'isStreaming', 'initialDataFields', 'javascript', 'styles', 'markup'));
        })
        .then(function(vizType) {
            setTimeout(function() {
                _.each(cache.keys(), function(key) {

                    debug(key);
                    if(key.indexOf(vizType.name) > -1) {
                        debug('deleting ' + key);
                        cache.del(key);
                    }
                });
            }, 0);
            return res.status(200).send();
        }).catch(function() {
            return res.status(500).send();
        });
};

exports.delete = function (req, res, next) {

    var vizTypeId = req.params.vid;

    models.VisualizationType
        .findById(vizTypeId)
        .then(function(vizType) {
            vizType.deleteAndUninstall().then(function() {
                return res.json(vizType);
            }).catch(next);
        }).catch(next);
};

exports.getDelete = function(req, res, next) {

    var vizTypeId = req.params.vid;

    models.VisualizationType
        .findById(vizTypeId)
        .then(function(vizType) {
            vizType
                .deleteAndUninstall()
                .then(function() {
                    return res.redirect(config.baseURL + 'visualization-types/');
                }).catch(next);
        }).catch(next);
};


exports.previewNPM = function(req, res, next) {

    var location = req.params.location;
    var installVal = req.query.name || req.query.path;
    var linker, getModuleName;
    if(location === 'remote') {
        linker = models.VisualizationType.linkFromNPM.bind(models.VisualizationType);
        moduleNameGetter = models.VisualizationType.moduleNameFromInstallName;
        getModuleName = function() {
          return models.VisualizationType.moduleNameFromInstallName(installVal);
        }
    } else if(location === 'local') {
        linker = models.VisualizationType.linkFromLocalModule.bind(models.VisualizationType);
        getModuleName = function() {
          return models.VisualizationType
            .packageObjectFromPath(installVal)
            .then(function(packageObj) {
              return packageObj.name;
            })
        }
    } else {
        return res.status(500).send('Invalid location.').end();
    }

    var moduleName;
    Q.fcall(getModuleName)
        .then(function(mn) {
            moduleName = mn;
            debug(installVal + ' : ' + moduleName);
            debug('requested to link module: ' + installVal);
            return models.VisualizationType
                .findAll({
                    where: {
                        moduleName: moduleName
                    }
                })
        })
        .then(function(visualizations) {
            if(visualizations && visualizations.length) {
                throw new Error('Please delete the installed ' + visualizations[0].name + ' visualization before trying to preview ' + installName);
            }
            return linker(installVal, moduleName);
        }).then(function(vizType) {
            var b = browserify({
                paths: [ config.root + '/node_modules']
            });
            b.require(moduleName);
            b.bundle(function(err, buf) {
                if(err) {
                    debug(err);
                    return res.status(500).send(err.message).end();
                }

                return res.render('viz-types/preview-editor', {
                    vizType: vizType,
                    javascript: buf.toString('utf8'),
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
    var installVal = req.query.name || req.query.path;
    var creator, getModuleName;
    if(location === 'remote') {
        creator = models.VisualizationType.createFromNPM.bind(models.VisualizationType);
        moduleNameGetter = models.VisualizationType.moduleNameFromInstallName;
        getModuleName = function() {
          return models.VisualizationType.moduleNameFromInstallName(installVal);
        }
    } else if(location === 'local') {
        creator = models.VisualizationType.createFromLocalModule.bind(models.VisualizationType);
        getModuleName = function() {
          return models.VisualizationType
            .packageObjectFromPath(installVal)
            .then(function(packageObj) {
              return packageObj.name;
            })
        }
    } else {
        return res.status(500).send('Invalid location.').end();
    }

    var moduleName;
    Q.fcall(getModuleName)
        .then(function(mn) {
            moduleName = mn;
            debug(installVal + ' : ' + moduleName);
            debug('requested to link module: ' + installVal);
            return models.VisualizationType
                .findAll({
                    where: {
                        moduleName: moduleName
                    }
                })
        }).then(function(visualizations) {
            if(visualizations && visualizations.length) {
                throw new Error('Please delete the installed ' + visualizations[0].name + ' visualization before trying to install ' + installVal);
            }
            return creator(installVal, moduleName);
        }).then(function(vizType) {
            return res.redirect('/visualization-types/edit/' + vizType.id);
        }).catch(function(err) {
            return res.status(500).send(err.message).end();
        });
};


exports.advanced = function (req, res, next) {
    return res.render('viz-types/advanced', {});
};

exports.editor = function (req, res, next) {

    models.VisualizationType.findById(req.params.vid)
        .then(function(type) {
            return res.render('viz-types/editor', {
                vizType: type
            });

        }).catch(next);
};


exports.thumbnail = function (req, res, next) {

    return models.VisualizationType.findById(req.params.vid)
        .then(function(type) {
            if(type.thumbnailLocation) {
                return res.sendFile(type.thumbnailLocation);
            }

            return res.status(404).send('no thumbnail found').end();

        }).catch(next);
};



exports.importPreviewHandler = function(req, res, next) {
    var method = req.params.method;
    var importPreview = req.params.importPreview;

    debug('preview');
    if(importPreview === 'import') {
        debug('import npm');
        return exports.importNPM(req, res, next);
    } else {
        debug('preview npm');
        return exports.previewNPM(req, res, next);
    }
};
