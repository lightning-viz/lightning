var path = require('path');
var git = require('gift');
var fs = require('fs-extra');
var Q = require('q');
var uuid = require('node-uuid');
var glob = require('glob');
var _ = require('lodash');


module.exports = function(sequelize, DataTypes) {
    var VisualizationType = sequelize.define('VisualizationType', {
        name: {type: DataTypes.STRING, unique: true},
        initialDataField: DataTypes.STRING,

        enabled: {type: DataTypes.BOOLEAN, defaultValue: true},
        imported: {type: DataTypes.BOOLEAN, defaultValue: false},

        thumbnailLocation: DataTypes.STRING,
        sampleData: 'JSON',
        sampleOptions: 'JSON',
        sampleImages: DataTypes.ARRAY(DataTypes.STRING),

        javascript: DataTypes.TEXT,
        markup: DataTypes.TEXT,
        styles: DataTypes.TEXT
    }, {
        classMethods: {
            associate: function(models) {
                 // associations can be defined here
            },

            createFromRepoURL: function(url, attributes) {

                attributes = attributes || {};
                // clone REPO, extract js, css, and html files...

                var self = this;

                var repoPath = path.resolve(__dirname + '/../../tmp/repos/' + uuid.v4());

                return Q.nfcall(fs.remove, repoPath)
                    .then(function() {
                        return Q.ninvoke(git, 'clone', url, repoPath);
                    })
                    .then(function() {
                        return self.createFromFolder(repoPath, attributes);
                    });
            },
            

            createManyFromRepoURL: function(url) {

                var ignoreFolders = ['.git'];

                var self = this;

                var infoStat = function(filename, callback) {

                    console.log('Stating file: ' + filename);

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

            createFromFolder: function(path, attributes) {

                attributes = attributes || {};
                // clone REPO, extract js, css, and html files...

                return Q.all([
                    Q.nfcall(glob, path + '/*.js'),
                    Q.nfcall(glob, path + '/*.{css,scss}'),
                    Q.nfcall(glob, path + '/*.{html,jade}')
                ])
                .spread(function(jsFiles, styleFiles, markupFiles) {

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
                        (markupFiles.length) ? Q.nfcall(fs.readFile, markupFiles[0]) : ''
                    ];


                }).spread(function(javascript, styles, markup) {

                    var vizTypeObj = _.extend(attributes, {
                        javascript: javascript.toString('utf8'),
                        styles: styles.toString('utf8'),
                        markup: markup.toString('utf8')
                    });

                    return VisualizationType.create(vizTypeObj);

                });
            },


        },

        instanceMethods: {

            // exportToFS: function() {

            //     var self = this;

            //     var jsPath = path.resolve(__dirname + '/../../ui/js/viz/');
            //     var stylePath = path.resolve(__dirname + '/../../ui/stylesheets/viz/');
            //     var markupPath = path.resolve(__dirname + '/../../ui/templates/viz/');

            //     var funcs = [];
            //     if(self.javascript) {
            //         funcs.push(Q.nfcall(fs.outputFile, jsPath + '/' + self.name + '.js', self.javascript));
            //     }
            //     if(self.styles) {

            //         console.log(stylePath + '/' + self.name + '.scss');
            //         funcs.push(Q.nfcall(fs.outputFile, stylePath + '/' + self.name + '.scss', self.styles));
            //     }
            //     if(self.markup) {
            //         console.log(markupPath + '/' + self.name + '.jade');
            //         funcs.push(Q.nfcall(fs.outputFile, markupPath + '/' + self.name + '.jade', self.markup));
            //     }
            //     return Q.all(funcs);
            // }

        },

        hooks: {

            beforeValidate: function(vizType, next) {

                vizType.sampleData = JSON.stringify(vizType.sampleData);
                vizType.sampleOptions = JSON.stringify(vizType.sampleOptions);
                next();
            }
        }
    });

    return VisualizationType;
};
