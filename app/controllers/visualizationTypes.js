
var models = require('../models');
var _ = require('lodash');


exports.index = function (req, res, next) {

    models.VisualizationType.findAll()
        .then(function(types) {
            return res.json(types);
        }).error(next);
};


exports.create = function (req, res, next) {
    
    models.VisualizationType
        .create(_.pick(req.body, 'name', 'initialDataField'))
        .then(function(type) {
            return res.json(type);
        }).error(function() {
            return res.status(500).send();
        });
        
};
