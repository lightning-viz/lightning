var path = require('path');
var fs = require('fs-extra');
var Q = require('q');
var uuid = require('node-uuid');
var glob = require('glob');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development';
var dbConfig = require(__dirname + '/../../config/database')[env];
var isPostgres = dbConfig.dialect === 'postgres';
var config = require(__dirname + '/../../config/config');
var npm = require('npm');
var utils = require('../utils');
var debug = require('debug')('lightning:server:models:visualization-types');

module.exports = function(sequelize, DataTypes) {
    var schema;
    if(isPostgres) {
        schema = {
            'id': {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            name: {type: DataTypes.STRING, unique: true},
            initialDataFields: DataTypes.ARRAY(DataTypes.STRING),

            enabled: {type: DataTypes.BOOLEAN, defaultValue: true},
            imported: {type: DataTypes.BOOLEAN, defaultValue: false},
            isStreaming: {type: DataTypes.BOOLEAN, defaultValue: false},
            moduleName: {type: DataTypes.STRING},

            thumbnailLocation: DataTypes.STRING,

            sampleData: DataTypes.JSON,
            sampleOptions: DataTypes.JSON,
            codeExamples: DataTypes.JSON,
            sampleImages: DataTypes.ARRAY(DataTypes.STRING),
        };
    } else {
        schema = {
          'id': {
              type: DataTypes.UUID,
              primaryKey: true,
              defaultValue: DataTypes.UUIDV4,
          },
          name: {type: DataTypes.STRING, unique: true},
          enabled: {type: DataTypes.BOOLEAN, defaultValue: true},
          imported: {type: DataTypes.BOOLEAN, defaultValue: false},
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
          }
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
                // var sampleOptions = lightningConfig.sampleOptions;
                var sampleImages = lightningConfig.sampleImages;
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

                var samplesInput = {
                    data: {
                        filepaths: ['lightning-sample-data.json', 'data/sample-data.json'],
                        defaultValue: sampleData || []
                    },
                    options: {
                        filepaths: ['lightning-sample-options.json', 'data/sample-options.json'],
                        defaultValue: {}
                    },
                    images: {
                        filepaths: ['lightning-sample-images.json', 'data/sample-images.json'],
                        defaultValue: sampleImages || []
                    }
                };

                var self = this;
                var samples = {};
                _.each(samplesInput, function(val, key) {
                    _.each(val.filepaths, function(samplePath) {
                        try {
                            samples[key] = self._bustRequire(name + '/' + samplePath);
                        } catch(e) {
                            samples[key] = samples[key] || val.defaultValue;
                        };
                    });
                });

                var vizTypeObj = {
                    name: lightningConfig.name || name,
                    isStreaming: lightningConfig.isStreaming || false,
                    moduleName: name,
                    sampleData: samples.data,
                    sampleOptions: samples.options,
                    sampleImages: samples.images,
                    codeExamples: codeExamples
                };

                if(preview) {
                    return VisualizationType.build(vizTypeObj);
                }

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

                if(vizTypeObj.thumbnailLocation && config.s3.key) {
                    return utils.uploadToS3(vizTypeObj.thumbnailLocation)
                            .then(function(results) {
                                vizTypeObj.thumbnailLocation = results.req.url;
                                return VisualizationType.create(vizTypeObj);
                            });
                }

                return VisualizationType.create(vizTypeObj);
            },

            _createLinkNPM: function(command, installName, moduleName, preview) {
                var self = this;
                var loglevel = npm.config.get('loglevel');
                npm.config.set('loglevel', 'silent');
                return Q.nfcall(npm.commands.uninstall, [moduleName])
                    .then(function(results) {
                        return Q.nfcall(command, [installName]);
                    }).then(function() {
                        npm.config.set('loglevel', loglevel);
                        debug(('Successfully installed ' + installName).green);
                        return self._buildFromNPM(moduleName, preview);
                    });
            },

            createFromNPM: function(installName, moduleName) {
                return this._createLinkNPM(npm.commands.install, installName, moduleName || installName, false);
            },

            linkFromNPM: function(installName, moduleName) {
                return this._createLinkNPM(npm.commands.install, installName, moduleName || installName, true);
            },

            linkFromLocalModule: function(installPath, moduleName) {
                debug('link from local module');
                var p = path.resolve(installPath);
                var self = this;
                var prefix = npm.prefix;
                npm.prefix = p;

                return Q.nfcall(npm.commands.link)
                  .then(function() {
                      npm.prefix = prefix;
                      return self._createLinkNPM(npm.commands.link, moduleName, moduleName, true);
                  })
            },

            createFromLocalModule: function(installPath, moduleName) {
                var p = path.resolve(installPath);
                var self = this;
                var prefix = npm.prefix;
                npm.prefix = p;

                return Q.nfcall(npm.commands.link)
                  .then(function() {
                      npm.prefix = prefix;
                      return self._createLinkNPM(npm.commands.link, moduleName, moduleName, false);
                  })
            },

            moduleNameFromInstallName: function(installName) {
                var re = new RegExp("^[^/]+/[^/]+$");

                if(re.test(installName)) {
                    var parts = installName.split("/");
                    return parts[parts.length - 1];
                }

                return installName;
            },

            packageObjectFromPath: function(filePath) {
                filePath = path.resolve(filePath);
                return Q.nfcall(fs.readJSON, filePath + '/package.json');
            }

        },

        instanceMethods: {

            getThumbnailURL: function() {
                if(this.thumbnailLocation.indexOf('http://') > -1 || this.thumbnailLocation.indexOf('https://') > -1) {
                    return this.thumbnailLocation;
                }

                return utils.getStaticUrl() + 'visualization-types/' + this.id + '/thumbnail';
            },

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
                return Q.nfcall(npm.commands.uninstall, [this.moduleName])
                    .then(function() {
                        return self.destroy();
                    });
                return self.destroy();
            },

            refreshFromNPM: function() {
                var self = this;
                var name = this.moduleName;
                var loglevel = npm.config.get('loglevel');
                npm.config.set('loglevel', 'silent');
                return exec('npm uninstall --silent ' + name)
                    .then(function(results) {
                        return exec('npm install --silent ' + name);
                    }).then(function() {
                        npm.config.set('loglevel', loglevel);
                        debug(('Successfully updated ' + name).green);
                    });
            }

        }
    });

    return VisualizationType;
};
