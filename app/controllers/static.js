var models = require('../models');
var _ = require('lodash');
var resumer = require('resumer');
var browserify = require('browserify');
var path = require('path');
var cache = require('../cache');
var sass = require('node-sass');
var uuid = require('node-uuid');
var Q = require('q');


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
    res.set('Access-Control-Allow-Origin', "*");

    // Get all vizTypes in array
    var visualizationTypes = _.uniq(req.query.visualizations).sort();

    if(!req.query.cachemiss) {
        var bundle = cache.get('js/' + visualizationTypes.toString());

        if(bundle) {
            return res.send(bundle);
        }
    }

    console.log('building viz bundle with ' + visualizationTypes);
    var tmpPath = path.resolve(__dirname + '/../../tmp/js-build/' + uuid.v4() + '/viz/');

    req.session.lastBundlePath = tmpPath;


    var b = browserify();

    models.VisualizationType
        .findAll().success(function(vizTypes) {

            console.log(_.pluck(vizTypes, 'name'));


            var funcs = [];
            _.each(vizTypes, function(vizType) {
                funcs.push(vizType.exportToFS(tmpPath));
            });

            Q.all(funcs).spread(function() {

                _.each(_.filter(vizTypes, function(vizType) { return (visualizationTypes.indexOf(vizType.name) > -1); }), function(vizType) {

                    var stream = resumer().queue(vizType.javascript).end();
                    b.require(stream, {
                        basedir: tmpPath,
                        expose: 'viz/' + vizType.name
                    });

                });

                b.bundle(function(err, buf) {

                    if(err) {
                        return next(err);
                    }               

                    // var out = protectRequire(buf.toString('utf8'));
                    var out = buf.toString('utf8');
                    cache.put('js/' + visualizationTypes.toString(), out, 1000 * 60 * 60);
                    res.send(out); 
                });
            });
        }).error(next);

};


exports.bundleJSForExecution = function(req, res, next) {
    
    res.set('Content-Type', 'application/javascript');
    
    var b = browserify();

    var js = req.body.javascript;
    var stream = resumer().queue(js).end();
    b.require(stream, {
        basedir: req.session.lastBundlePath || '',
        expose: 'dynamicallyBundledJavascript'
    });

    var bundle = b.bundle();

    bundle.on('error', function(err) {
        console.log(err);
        return res.status(500).send();
    });

    bundle.pipe(res);


};



exports.buildSCSS = function(req, res) {
    res.set('Content-Type', 'text/css');

    var scssData = '#lightning-body {\n';
    scssData += req.body.styles + '\n';
    scssData += '\n}';

    sass.render({
        data: scssData,
        success: function(css) {
            res.send(css);
        }
    });
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
                if(vizType.styles) {
                    scssData += vizType.styles  + '\n';
                }
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

