var models = require('../models');
var Q = require('q');
var _ = require('lodash');
var webshot = require('webshot');
var config = require('../../config/config');
var debug = require('debug')('lightning:server:controllers:visualizations');
var cache = require('../cache');
var concat = require('concat-stream');

exports.getData = function (req, res, next) {
    var vizId = req.params.vid;

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "X-Requested-With");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");

    var Visualization = models.Visualization;

    Visualization
        .findById(vizId)
        .then(function(viz) {
            return res.json({
                data: viz.data
            });
        }).catch(next);
};

exports.getSettings = function (req, res, next) {
    var vizId = req.params.vid;

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "X-Requested-With");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");
    var Visualization = models.Visualization;
    Visualization
        .findById(vizId)
        .then(function(viz) {
            return res.json({
                settings: viz.settings || {}
            });
        }).catch(next);
};

exports.getDataWithKeys = function (req, res, next) {

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "X-Requested-With");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");


    var vizId = req.params[0];
    var keys = _.filter(req.params[1].split('/'), function(k) {
        return k.trim() !== '';
    });

    models.Visualization
        .queryDataForVisualization(vizId, keys)
        .then(function(results) {
            return res.json({
                data: results[0].data
            });
        }).catch(next);
};

exports.getSettingsWithKeys = function (req, res, next) {

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "X-Requested-With");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");

    var vizId = req.params[0];
    var keys = _.filter(req.params[1].split('/'), function(k) {
        return k.trim() !== '';
    });

    models.Visualization
        .querySettingsForVisualization(vizId, keys)
        .then(function(results) {
            return res.json({
                settings: results[0].settings || {}
            });
        }).catch(next);
};



exports.update = function (req, res, next) {

    var vid = req.params.vid;
    var Visualization = models.Visualization;

    debug('updating visualization ' + vid);

    Visualization
        .update(req.body, {
            where: {
                id: vid
            }
        }).then(function(visualizations) {
            return res.status(200).send();
        }).catch(function(err) {
            debug(err);
            return res.status(500).send();
        });

};

exports.updateSettings = function (req, res, next) {

    var vid = req.params.vid;
    var Visualization = models.Visualization;

    debug('updating visualization settings ' + vid);

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "X-Requested-With");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");

    Visualization
        .findById(vid)
        .then(function(viz) {
            if(_.isString(viz.settings)) {
                viz.settings = _.extend(JSON.parse(viz.settings || '{}'), req.body);
            } else {
                viz.settings = _.extend(viz.settings || {}, req.body);
            }
            viz.save()
                .then(function() {
                    return res.json({
                        settings: viz.settings
                    });
                }).catch(next);
        }).catch(next);

};

exports.updateData = function (req, res, next) {

    var vizId = req.params.vid;
    var fieldName = req.params.field;

    models.Visualization
        .findById(vizId)
        .then(function(viz) {

            if(fieldName) {
                viz.data[fieldName] = req.body.data;
            } else {
                viz.data = req.body.data;
            }

            viz.save()
                .then(function() {
                    return res.json(viz);
                }).catch(next);
        }).catch(next);
};

var readWithTemplate = function(template, req, res, next) {
    var vizId = req.params.vid;
    var Visualization = models.Visualization;
    var VisualizationType = models.VisualizationType;

    Visualization.find({
        where: {
            id: vizId
        },
        include: [VisualizationType]
    }).then(function(viz) {
        res.render(template, {
            viz: viz,
        });
    });
}

exports.read = function (req, res, next) {
    return readWithTemplate('session/visualization', req, res, next);
};

exports.publicRead = function (req, res, next) {
    return readWithTemplate('session/visualization-public', req, res, next);
};

exports.embed = function (req, res, next) {
    return readWithTemplate('session/visualization-embed', req, res, next);
};

exports.pym = function (req, res, next) {
    return readWithTemplate('session/visualization-pym', req, res, next);
};

exports.iframe = function (req, res, next) {
    return readWithTemplate('session/visualization-iframe', req, res, next);
};

exports.delete = function (req, res, next) {

    var vizId = req.params.vid;
    models.Visualization
        .findById(vizId)
        .then(function(viz) {
            if(!viz) {
                return res.status(404).send();
            }

            var sessionId = viz.SessionId;
            viz.destroy({where: {}}).then(function() {
                req.io.of(viz.getSessionSocketNamespace())
                    .emit('viz:delete', vizId);
                return res.json(viz);
            }).catch(next);
        }).catch(next);
};

exports.getDelete = function(req, res, next) {
    var vizId = req.params.vid;

    models.Visualization
        .findById(vizId)
        .then(function(viz) {
            if(!viz) {
                return res.status(404).send();
            }
            var sessionId = viz.SessionId;
            viz.destroy({where: {}}).then(function() {
                req.io.of(viz.getSessionSocketNamespace())
                    .emit('viz:delete', vizId);
                return res.redirect(config.baseURL + 'sessions/' + sessionId);
            }).catch(next);
        }).catch(next);
};

exports.screenshot = function(req, res, next) {
    var vizId = req.params.vid;
    var host = req.headers.host;
    var url = 'http://' + host + '/visualizations/' + vizId + '/iframe';

    res.setHeader('Content-Type', 'image/png');

    var img = cache.get('screenshot/' + vizId);
    if(img) {
      console.log(img);
        return res.send(img);
    }

    var width = req.query.width || 1024;
    var height = req.query.height || 768;

    var opts = {
        screenSize: {
            width: width,
            height: height
        },
        renderDelay: 500,
    };

    if(process.env.PHANTOM_PATH) {
      opts.phantomPath = process.env.PHANTOM_PATH;
    }

    webshot(url, opts, function(err, renderStream) {

        if(err) {
            return res.status(500).send();
        }

        var concatStream = concat(function(screenshot) {
            cache.put('screenshot/' + vizId, screenshot, 1000 * 60 * 10);
        });

        renderStream.pipe(res);
        renderStream.pipe(concatStream);
    });
}
