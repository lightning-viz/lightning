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

                var repoPath = path.resolve(__dirname + '/../../tmp/repos/' + uuid.v4());

                return Q.nfcall(fs.remove, repoPath)
                    .then(function() {
                        return Q.ninvoke(git, 'clone', url, repoPath);
                    })
                    .then(function() {
                        // read some fiiiiles
                        return [
                            Q.nfcall(glob, repoPath + '/*.js'),
                            Q.nfcall(glob, repoPath + '/*.s?css'),
                            Q.nfcall(glob, repoPath + '/*.{html,jade}')
                        ];
                    })
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

            exportToFS: function() {

                var self = this;

                var jsPath = path.resolve(__dirname + '/../../ui/js/viz/imported/');
                var stylePath = path.resolve(__dirname + '/../../ui/stylesheets/viz/imported/');
                var markupPath = path.resolve(__dirname + '/../../ui/templates/viz/imported/');

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
            }

        }
    });

    return VisualizationType;
};
