var validator = require('validator');
var _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
    var Visualization = sequelize.define('Visualization', {
        data: 'JSON',
        opts: 'JSON',
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        type: DataTypes.STRING,
        images: DataTypes.ARRAY(DataTypes.STRING)
    }, {
        classMethods: {
            associate: function(models) {
                 // associations can be defined here
                 Visualization.belongsTo(models.Session);
            },
            getNamedObjectForVisualization: function(vid, name) {
                name = validator.escape(name);
                return sequelize
                    .query('SELECT data->\'' + name + '\'' + ' AS ' + name + ' FROM "Visualizations" WHERE id=' + vid);
            },

            getNamedObjectAtIndexForVisualization: function(vid, name, index) {
                
                name = validator.escape(name);
                if(!validator.isNumeric(index)) {
                    throw Error('Must provide numeric index');
                }
                return sequelize
                    .query('SELECT data->\'' + name + '\'->' + index + ' AS ' + name + ' FROM "Visualizations" WHERE id=' + vid);
            },

            getDataForVisualization: function(vid) {
                return sequelize.query('SELECT * from "Visualizations" WHERE id=' + vid);
            },

            queryDataForVisualization: function(vid, keys) {

                var qs = _.chain(keys)
                            .map(validator.escape)
                            .map(function(key) {
                                if(!validator.isNumeric(key)) {
                                    return '\'' + key + '\'';
                                }
                                return key;
                            })
                            .value()
                            .join('->');

                return sequelize
                    .query('SELECT data->' + qs + ' AS data FROM "Visualizations" WHERE id=' + vid);
            }
        },

        instanceMethods: {
            getNamedObjectAtIndex: function(name, index) {
                return Visualization.getNamedObjectAtIndexForVisualization(this.id, name, index);
            }, 
            getNamedObject: function(name) {
                return Visualization.getNamedObjectForVisualization(this.id, name);
            },
            getData: function() {
                return Visualization.getDataForVisualization(this.id);
            },
            queryData: function(keys) {
                return Visualization.queryDataForVisualization(this.id, keys);
            },
            getInitialData: function(type) {
                if(type.initialDataField) {
                    return this.data[type.initialDataField];
                } 

                return this.data;
            }
        },

        hooks: {
            beforeValidate: function(visualization, next) {
                visualization.data = JSON.stringify(visualization.data);
                visualization.opts = JSON.stringify(visualization.opts);
                next();
            }
        }
    });

    return Visualization;
};
