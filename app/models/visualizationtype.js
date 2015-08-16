var path = require('path');
var git = require('gift');
var fs = require('fs-extra');
var Q = require('q');
var uuid = require('node-uuid');
var glob = require('glob');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/database')[env];
var isPostgres = config.dialect === 'postgres';
var npm = require('npm');

module.exports = function(sequelize, DataTypes) {
    var schema;
    if(isPostgres) {
        schema = {
            name: {type: DataTypes.STRING, unique: true},
            initialDataFields: DataTypes.ARRAY(DataTypes.STRING),

            enabled: {type: DataTypes.BOOLEAN, defaultValue: true},
            imported: {type: DataTypes.BOOLEAN, defaultValue: false},
            isModule: {type: DataTypes.BOOLEAN, defaultValue: false},
            isStreaming: {type: DataTypes.BOOLEAN, defaultValue: false},
            moduleName: {type: DataTypes.STRING},

            thumbnailLocation: DataTypes.STRING,

            sampleData: 'JSON',
            sampleOptions: 'JSON',
            codeExamples: 'JSON',
            sampleImages: DataTypes.ARRAY(DataTypes.STRING),

            javascript: DataTypes.TEXT,
            markup: DataTypes.TEXT,
            styles: DataTypes.TEXT
        };
    } else {
        schema = {
        name: {type: DataTypes.STRING, unique: true},
        enabled: {type: DataTypes.BOOLEAN, defaultValue: true},
        imported: {type: DataTypes.BOOLEAN, defaultValue: false},
        isModule: {type: DataTypes.BOOLEAN, defaultValue: false},
        isStreaming: {type: DataTypes.BOOLEAN, defaultValue: false},
        moduleName: {type: DataTypes.STRING},

        thumbnailLocation: DataTypes.STRING,

        sampleData: {
            type: DataTypes.TEXT,
            get: function() {
                return JSON.parse(this.getDataValue('sampleData') || '{}');
            },
            set: function(val) {
                return this.setDataValue('sampleData', JSON.stringify(val));
            }
        },
        sampleOptions: {
            type: DataTypes.TEXT,
            get: function() {
                return JSON.parse(this.getDataValue('sampleOptions') || '{}');
            },
            set: function(val) {
                return this.setDataValue('sampleOptions', JSON.stringify(val));
            }
        },
        codeExamples: {
            type: DataTypes.TEXT,
            get: function() {
                return JSON.parse(this.getDataValue('codeExamples') || '{}');
            },
            set: function(val) {
                return this.setDataValue('codeExamples', JSON.stringify(val));
            }
        },
        sampleImages: {
            type: DataTypes.TEXT,
            get: function() {
                return JSON.parse(this.getDataValue('sampleImages') || '[]');
            },
            set: function(val) {
                return this.setDataValue('sampleImages', JSON.stringify(val));
            }
        },
        initialDataFields: {
            type: DataTypes.TEXT,
            get: function() {
                return JSON.parse(this.getDataValue('initialDataFields') || '[]');
            },
            set: function(val) {
                return this.setDataValue('initialDataFields', JSON.stringify(val));
            }
        },
        javascript: DataTypes.TEXT,
        markup: DataTypes.TEXT,
        styles: DataTypes.TEXT
    };
    }


    var VisualizationType = sequelize.define('VisualizationType', schema, {
        classMethods: {
            associate: function(models) {
                 // associations can be defined here
            },

            _bustRequire: function(name) {
                delete require.cache[require.resolve(name)];
                return require(name);
            },

            _buildFromNPM: function(name, preview) {
                var lightningConfig = this._bustRequire(name + '/package.json').lightning || {};
                var sampleData = lightningConfig.sampleData;
                var sampleOptions = lightningConfig.sampleOptions;

                var codeExamples = {};
                var codeExampleMap = {
                    'python': 'py',
                    'scala': 'scala',
                    'javascript': 'js'
                };

                _.each(codeExampleMap, function(extension, language) {
                    var examplePath = path.resolve(__dirname + '/../../node_modules/' + name + '/data/example.' + extension);
                    var exampleExists = fs.existsSync(examplePath);
                    if(exampleExists) {
                        codeExamples[language] = fs.readFileSync(examplePath).toString('utf8');
                    }
                });

                try {
                    sampleData = this._bustRequire(name + '/lightning-sample-data.json');
                } catch(e) {
                    sampleData = sampleData || [];
                }                
                try {
                    sampleData = this._bustRequire(name + '/data/sample-data.json');
                } catch(e) {
                    sampleData = sampleData || [];
                }
                try {
                    sampleOptions = this._bustRequire(name + '/lightning-sample-options.json');
                } catch(e) {
                    sampleOptions = sampleOptions || {};
                }                
                try {
                    sampleOptions = this._bustRequire(name + '/data/sample-options.json');
                } catch(e) {
                    sampleOptions = sampleOptions || {};
                }

                var sampleImages = lightningConfig.sampleImages;
                try {
                    sampleImages = this._bustRequire(name + '/lightning-sample-images.json');
                } catch(e) {
                    sampleImages = sampleImages || [];
                }

                try {
                    sampleImages = this._bustRequire(name + '/data/sample-images.json');
                } catch(e) {
                    sampleImages = sampleImages || [];
                }

                var vizTypeObj = {
                    name: lightningConfig.name || name,
                    isStreaming: lightningConfig.isStreaming || false,
                    isModule: true,
                    moduleName: name,
                    sampleData: sampleData,
                    sampleOptions: sampleOptions,
                    sampleImages: sampleImages,
                    codeExamples: codeExamples
                };

                // check if example image exists
                var thumbnailExtensions = ['png', 'jpg', 'jpeg', 'gif'];
                _.find(thumbnailExtensions, function(extension) {
                    var thumbnailPath = path.resolve(__dirname + '/../../node_modules/' + name + '/data/thumbnail.' + extension);
                    var thumbnailExists = fs.existsSync(thumbnailPath);
                    if(thumbnailExists) {
                        vizTypeObj.thumbnailLocation = thumbnailPath;
                    }
                    return thumbnailExists;
                });

                if(preview) {
                    return VisualizationType.build(vizTypeObj);
                }
                return VisualizationType.create(vizTypeObj);
            },

            _createLinkNPM: function(command, name, preview) {
                var self = this;
                var loglevel = npm.config.get('loglevel');
                npm.config.set('loglevel', 'silent');
                return Q.nfcall(npm.commands.uninstall, [name])
                    .then(function(results) {
                        return Q.nfcall(command, [name]);
                    }).then(function() {
                        npm.config.set('loglevel', loglevel);
                        console.log(('Successfully installed ' + name).green);
                        return self._buildFromNPM(name, preview);
                    });
            },

            createFromNPM: function(name) {
                return this._createLinkNPM(npm.commands.install, name, false);
            },

            linkFromNPM: function(name) {
                return this._createLinkNPM(npm.commands.install, name, true);
            },

            linkFromLocalModule: function(name) {
                return this._createLinkNPM(npm.commands.link, name, true);
            },


            createFromLocalModule: function(name) {
                return this._createLinkNPM(npm.commands.link, name, false);
            },

            createFromRepoURL: function(url, attributes, opts) {

                attributes = attributes || {};
                opts = opts || {};
                // clone REPO, extract js, css, and html files...

                var self = this;

                var repoPath = path.resolve(__dirname + '/../../tmp/repos/' + uuid.v4());

                return Q.nfcall(fs.remove, repoPath)
                    .then(function() {
                        return Q.ninvoke(git, 'clone', url, repoPath);
                    })
                    .then(function() {
                        return self.createFromFolder(repoPath + (opts.path ? ('/' + opts.path) : ''), attributes, opts);
                    });
            },
            

            createManyFromRepoURL: function(url) {

                var ignoreFolders = ['.git'];

                var self = this;

                var infoStat = function(filename, callback) {

                    fs.stat(filename, function(err, stat) {
                        stat.filename = filename;

                        if(err) {
                            callback(err);
                        } else {
                            callback(err, stat);
                        }

                    });
                };

                var repoPath = path.resolve(__dirname + '/../../tmp/repos/' + uuid.v4());

                return Q.nfcall(fs.remove, repoPath)
                    .then(function() {
                        return Q.ninvoke(git, 'clone', url, repoPath);
                    })
                    .then(function() {
                        return Q.nfcall(fs.readdir, repoPath);
                    }).then(function(files) {
                        var funcs = [];
                        _.each(files, function(file) {
                            if(ignoreFolders.indexOf(file) === -1) {
                                funcs.push(Q.nfcall(infoStat, repoPath + '/' + file));
                            }
                        });

                        return funcs;
                    }).spread(function() {
                        var stats = Array.prototype.slice.call(arguments, 0);

                        var funcs = [];
                        _.each(stats, function(stat) {
                            if(stat.isDirectory()) {
                                funcs.push(self.createFromFolder(stat.filename, {
                                    name: stat.filename.replace(/^.*[\\\/]/, '')
                                }));
                            }
                        });

                        return funcs;
                    });

            },

            createFromFolder: function(path, attributes, opts) {

                console.log('Create from folder: ' + path);

                attributes = attributes || {};
                opts = opts || {};
                // clone REPO, extract js, css, and html files...

                return Q.all([
                    Q.nfcall(glob, path + '/*.js'),
                    Q.nfcall(glob, path + '/*.{css,scss}'),
                    Q.nfcall(glob, path + '/*.{html,jade}'),
                    Q.nfcall(glob, path + '/sample-data.json'),
                    Q.nfcall(glob, path + '/sample-images.json'),
                    Q.nfcall(glob, path + '/package.json'),
                ])
                .spread(function(jsFiles, styleFiles, markupFiles, sampleDataFiles, sampleImageFiles, packageJSONFiles) {

                    if(jsFiles.length > 1) {
                        throw new Error('There can\'t be more than one javascript file');
                    } else if(styleFiles.length > 1) {
                        throw new Error('There can\'t be more than one style file');
                    } else if(markupFiles.length > 1) {
                        throw new Error('There can\'t be more than one markup file');
                    }

                    return [
                        (jsFiles.length) ? Q.nfcall(fs.readFile, jsFiles[0]) : '',
                        (styleFiles.length) ? Q.nfcall(fs.readFile, styleFiles[0]) : '',
                        (markupFiles.length) ? Q.nfcall(fs.readFile, markupFiles[0]) : '',
                        (sampleDataFiles.length) ? Q.nfcall(fs.readFile, sampleDataFiles[0]) : '[]',
                        (sampleImageFiles.length) ? Q.nfcall(fs.readFile, sampleImageFiles[0]) : '[]',
                        (packageJSONFiles.length) ? Q.nfcall(fs.readFile, packageJSONFiles[0]) : '[]',
                    ];


                }).spread(function(javascript, styles, markup, sampleData, sampleImages, packageJSON) {
                    sampleImages = JSON.parse(sampleImages);
                    if(!sampleImages.length) {
                        sampleImages = null;
                    }

                    try {
                        packageJSON = JSON.parse(packageJSON);
                    } catch(e) {
                        console.warn('Invalid package.json: ' + e.toString());
                    }

                    var vizTypeObj = _.extend(attributes, {
                        javascript: javascript.toString('utf8'),
                        styles: styles.toString('utf8'),
                        markup: markup.toString('utf8'),
                        sampleData: JSON.parse(sampleData.toString('utf8')),
                        sampleImages: sampleImages
                    });

                    vizTypeObj = _.extend(vizTypeObj, packageJSON['lightning-viz'] || {});

                    if(opts.preview) {
                        return VisualizationType.build(vizTypeObj);
                    }

                    return VisualizationType.create(vizTypeObj);

                });
            },


        },

        instanceMethods: {

            exportToFS: function(p) {

                var self = this;

                var jsPath = path.resolve(p);
                var stylePath = path.resolve(p);
                var markupPath = path.resolve(p);

                var funcs = [];
                if(self.javascript) {
                    funcs.push(Q.nfcall(fs.outputFile, jsPath + '/' + self.name + '.js', self.javascript));
                }
                if(self.styles) {
                    funcs.push(Q.nfcall(fs.outputFile, stylePath + '/' + self.name + '.scss', self.styles));
                }
                if(self.markup) {
                    funcs.push(Q.nfcall(fs.outputFile, markupPath + '/' + self.name + '.jade', self.markup));
                }
                return Q.all(funcs);
            },
            deleteAndUninstall: function() {
                var self = this;
                if(this.isModule) {
                    return Q.nfcall(npm.commands.uninstall, [this.moduleName])
                        .then(function() {
                            return self.destroy();
                        });
                }
                return self.destroy();
            }
        },

        hooks: {
            beforeValidate: function(vizType, next) {
                if(isPostgres) {
                    vizType.sampleData = JSON.stringify(vizType.sampleData);
                    vizType.sampleOptions = JSON.stringify(vizType.sampleOptions);
                    vizType.codeExamples = JSON.stringify(vizType.codeExamples);
                }
                next();
            }
        }
    });

    return VisualizationType;
};
