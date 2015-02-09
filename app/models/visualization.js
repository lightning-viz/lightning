var validator = require('validator');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/database')[env];
var isPostgres = config.dialect === 'postgres';




module.exports = function(sequelize, DataTypes) {


    var schema;
    if(isPostgres) {
        schema = {
            data: 'JSON',
            opts: 'JSON',
            settings: 'JSON',
            name: DataTypes.STRING,
            description: DataTypes.TEXT,
            type: DataTypes.STRING,
            images: DataTypes.ARRAY(DataTypes.STRING)
        };
    } else {
        schema = {
            data: 'JSON',
            opts: 'JSON',
            settings: 'JSON',
            name: DataTypes.STRING,
            description: DataTypes.TEXT,
            type: DataTypes.STRING,
            images: DataTypes.STRING
        };
    }

    var Visualization = sequelize.define('Visualization', schema, {
        classMethods: {
            associate: function(models) {
                 // associations can be defined here
                 Visualization.belongsTo(models.Session);
            },
            getNamedObjectForVisualization: function(vid, name) {
                name = validator.escape(name);


                if(isPostgres) {
                    return sequelize
                        .query('SELECT data->\'' + name + '\'' + ' AS ' + name + ' FROM "Visualizations" WHERE id=' + vid);
                }


                return this.find(vid).then(function(viz) {
                    var data = JSON.parse(viz.data);
                    var retObj = {};
                    retObj[name] = data[name];
                    return [retObj];
                });

            },

            getNamedObjectAtIndexForVisualization: function(vid, name, index) {
                
                name = validator.escape(name);
                if(!validator.isNumeric(index)) {
                    throw Error('Must provide numeric index');
                }

                if(isPostgres) {
                    return sequelize
                        .query('SELECT data->\'' + name + '\'->' + index + ' AS ' + name + ' FROM "Visualizations" WHERE id=' + vid);
                }


                return this.find(vid).then(function(viz) {
                    var data = JSON.parse(viz.data);
                    var retObj = {};
                    retObj[name] = data[name][index];
                    return [retObj];
                });
            },

            getDataForVisualization: function(vid) {
                return sequelize.query('SELECT * from "Visualizations" WHERE id=' + vid);
            },

            queryDataForVisualization: function(vid, keys) {

                if(isPostgres) {
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


                return this.find(vid).then(function(viz) {

                    var data = JSON.parse(viz.data);
                    _.each(keys, function(key) {
                        data = data[key];
                    });

                    return [{
                        data: data
                    }];
                });



            },

            querySettingsForVisualization: function(vid, keys) {

                if(isPostgres) {
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
                        .query('SELECT settings->' + qs + ' AS settings FROM "Visualizations" WHERE id=' + vid);

                }


                return this.find(vid).then(function(viz) {

                    var settings = JSON.parse(viz.settings);
                    _.each(keys, function(key) {
                        settings = settings[key];
                    });

                    return [{
                        settings: settings
                    }];
                });
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

                if(!isPostgres) {
                    visualization.images = JSON.stringify(visualization.images);
                }
                visualization.settings = JSON.stringify(visualization.settings);
                visualization.data = JSON.stringify(visualization.data);
                visualization.opts = JSON.stringify(visualization.opts);
                next();
            }
        }
    });

    return Visualization;
};
