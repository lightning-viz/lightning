
var models = require('../models');
var _ = require('lodash');
var cache = require('../cache');
var sass = require('node-sass');
var browserify = require('browserify');
var path = require('path');
var uuid = require('node-uuid');
var resumer = require('resumer');

function protectRequire(str) {
    var protectedVars = ['define', 'require'];
    var initialCode = ';';
    var postCode = ';';
    _.each(protectedVars, function(v) {
        initialCode += 'window._' + v + ' = window.' + v + ';';
        initialCode += 'window.' + v + ' = undefined;';

        postCode += 'window.' + v + ' = window._' + v + ';';
    });

    return initialCode + str;// + postCode;

}


exports.index = function (req, res, next) {

    models.VisualizationType.findAll()
        .then(function(types) {
            return res.json(types);
        }).error(next);
};


exports.show = function (req, res, next) {
    models.VisualizationType.findAll()
        .then(function(types) {
            
            return res.render('viz-types/show', {
                vizTypes: types
            });

        }).error(next);
};

exports.create = function (req, res, next) {
    
    models.VisualizationType
        .create(_.pick(req.body, 'name', 'initialDataField', 'javascript', 'styles', 'markup', 'sampleData', 'sampleOptions'))
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
            return vizType.updateAttributes(_.pick(req.body, 'name', 'initialDataField', 'javascript', 'styles', 'markup'));
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

exports.preview = function(req, res, next) {

    var url = req.query.url;

    var tmpPath = path.resolve(__dirname + '/../../tmp/js-build/' + uuid.v4() + '/viz/');

    req.session.lastBundlePath = tmpPath;
    var b = browserify();


    models.VisualizationType
        .createFromRepoURL(url, { name: url, preview: true })
        .then(function(vizType) {

            console.log('created viz preview');

            vizType.exportToFS(tmpPath)
                .spread(function() {

                    var stream = resumer().queue(vizType.javascript).end();
                    b.require(stream, {
                        basedir: tmpPath,
                        expose: 'viz/' + vizType.name
                    });

                    b.bundle(function(err, buf) {

                        if(err) {
                            return next(err);
                        }               

                        var javascript = protectRequire(buf.toString('utf8'));

                        if(vizType.styles) {
                            var scssData = '#lightning-body {\n';
                            scssData += vizType.styles + '\n';
                            scssData += '\n}';
                            sass.render({
                                data: scssData,
                                success: function(css) {

                                    return res.render('viz-types/preview-editor', {
                                        vizType: vizType,
                                        javascript: javascript,
                                        css: css
                                    });

                                    
                                }
                            });
                        } else {

                            return res.render('viz-types/preview-editor', {
                                vizType: vizType,
                                javascript: javascript,
                                css: ''
                            });                            
                        }

                    });


                });

        }).fail(function(err) {
            next(err);
        });

}


exports.importViz = function(req, res, next) {

    var backURL = req.header('Referer');
    var name = req.body.name;
    var url = req.body.url;

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


exports.editor = function (req, res, next) {

    models.VisualizationType.find(req.params.vid)
        .then(function(type) {
            
            return res.render('viz-types/editor', {
                vizType: type
            });

        }).error(next);
};

