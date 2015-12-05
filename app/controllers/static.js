var models = require('../models');
var _ = require('lodash');
var resumer = require('resumer');
var browserify = require('browserify');
var path = require('path');
var cache = require('../cache');
var sass = require('node-sass');
var uuid = require('node-uuid');
var Q = require('q');
var debug = require('debug')('lightning:server:controllers:static');
var config = require('../../config/config');



exports.getDynamicVizBundle = function (req, res, next) {

    res.set('Content-Type', 'application/javascript');
    res.set('Access-Control-Allow-Origin', "*");

    // Get all vizTypes in array
    var visualizationTypes = _.uniq(req.query.visualizations).sort();

    var cacheHit = false;

    if(!req.query.cachemiss) {
        var bundle = cache.get('js/' + visualizationTypes.toString());

        if(bundle) {
            cacheHit = true;
            res.send(bundle);
        }
    }

    debug('building viz bundle with ' + visualizationTypes);
    var tmpPath = path.resolve(__dirname + '/../../tmp/js-build/' + uuid.v4() + '/');

    req.session.lastBundlePath = tmpPath;
    var b = browserify({
        paths: [ config.root + '/node_modules']
    });

    models.VisualizationType
        .findAll().then(function(vizTypes) {

            debug('Found ' + vizTypes.length + ' visualization types');

            _.each(_.filter(vizTypes, function(vizType) { return (visualizationTypes.indexOf(vizType.name) > -1); }), function(vizType) {
                debug(vizType.moduleName);
                b.require(vizType.moduleName, {
                    expose: vizType.moduleName
                });
            });

            b.bundle(function(err, buf) {
                if(err) {
                    return next(err);
                }

                var out = buf.toString('utf8');
                cache.put('js/' + visualizationTypes.toString(), out, 1000 * 60 * 10);
                if(!cacheHit) {
                    res.send(out);
                }
            });

        }).error(function(err) {
            return res.status(500).send(err.message).end();
        });

};


exports.bundleJSForExecution = function(req, res, next) {

    res.set('Content-Type', 'application/javascript');

    var b = browserify({
        paths: [ config.root + '/node_modules']
    });
    var js = req.body.javascript;
    var stream = resumer().queue(js).end();
    b.require(stream, {
        basedir: req.session.lastBundlePath || '',
        expose: 'dynamicallyBundledJavascript'
    });

    var bundle = b.bundle();

    bundle.on('error', function(err) {
        debug(err);
        return res.status(500).send();
    });

    bundle.pipe(res);


};
