var models = require('../models');
var _ = require('lodash');
var resumer = require('resumer');
var browserify = require('browserify');
var path = require('path');
var cache = require('memory-cache');
var sass = require('node-sass');


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

exports.getDynamicVizBundle = function (req, res, next) {

    res.set('Content-Type', 'application/javascript');


    // Get all vizTypes in array
    var visualizationTypes = _.uniq(req.query.visualizations).sort();

    var bundle = cache.get('js/' + visualizationTypes.toString());

    if(bundle) {
        return res.send(bundle);
    }

    console.log('building viz bundle with ' + visualizationTypes);

    var b = browserify();

    models.VisualizationType
        .findAll({
            where: {
                name: {
                    in: visualizationTypes
                }
            }
        }).success(function(vizTypes) {

            console.log(_.pluck(vizTypes, 'name'));

            _.each(vizTypes, function(vizType) {

                var stream = resumer().queue(vizType.javascript).end();
                b.add(stream, {
                    // basedir: path.resolve(__dirname + '/../../ui/js/viz/'),
                    expose: 'viz/' + vizType.name,
                    entry: false
                });

            });

            b.bundle(function(err, buf) {

                if(err) {
                    return next(err);
                }               

                var out = protectRequire(buf.toString('utf8'));
                cache.put('js/' + visualizationTypes.toString(), out, 1000 * 60 * 60);
                res.send(out); 
            });
        }).error(next);

};


exports.bundleJSForExecution = function(req, res, next) {
    
    res.set('Content-Type', 'application/javascript');
    
    var b = browserify();

    var js = req.body.javascript;
    var stream = resumer().queue(js).end();
    b.require(stream, {
        basedir: path.resolve(__dirname + '/../../ui/js/viz/'),
        expose: 'dynamicallyBundledJavascript'
    });

    b.bundle().pipe(res);
};



exports.getDynamicVizStyles = function (req, res, next) {

    res.set('Content-Type', 'text/css');


    // Get all vizTypes in array
    var visualizationTypes = _.uniq(req.query.visualizations).sort();    
    var styles = cache.get('css/' + visualizationTypes.toString());

    if(styles) {
        return res.send(styles);
    }

    console.log('building viz styles with ' + visualizationTypes);

    models.VisualizationType
        .findAll({
            where: {
                name: {
                    in: visualizationTypes
                }
            }
        }).success(function(vizTypes) {

            var scssData = '#lightning-body {\n';
            _.each(vizTypes, function(vizType) {
                scssData += vizType.styles + '\n';
            });

            scssData += '\n}';

            sass.render({
                data: scssData,
                success: function(css) {
                    cache.put('css/' + visualizationTypes.toString(), css, 1000 * 60 * 60);
                    res.send(css);
                }
            });
        }).error(next);

};

