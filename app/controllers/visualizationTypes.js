
var models = require('../models');
var _ = require('lodash');


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
            vizType.exportToFS().spread(function() {
                return res.status(200).send();    
            }).fail(function(err) {
                next(err);
            });
            
        }).error(function() {
            return res.status(500).send();
        });
        
};


exports.importViz = function(req, res, next) {

    var backURL = req.header('Referer');
    var name = req.body.name;
    var url = req.body.url;

    console.log(name);
    console.log(url);

    models.VisualizationType
        .createFromRepoURL(url, { name: name})
        .then(function(vizType) {
            
            vizType.exportToFS().spread(function() {
                return res.redirect(backURL);
            }).fail(function(err) {
                next(err);
            });
            
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

