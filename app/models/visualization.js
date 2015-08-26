var validator = require('validator');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/database')[env];
var isPostgres = config.dialect === 'postgres';

module.exports = function(sequelize, DataTypes) {


    var schema;
    if(isPostgres) {
        schema = {
            'id': {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            data: DataTypes.JSON,
            opts: DataTypes.JSON,
            settings: DataTypes.JSON,
            name: DataTypes.STRING,
            description: DataTypes.TEXT,
            images: DataTypes.ARRAY(DataTypes.STRING)
        };
    } else {
        schema = {
            data: {
                type: DataTypes.TEXT,
                get: function() {
                    return JSON.parse(this.getDataValue('data') || '{}');
                },
                set: function(val) {
                    return this.setDataValue('data', JSON.stringify(val));
                }
            },
            opts: {
                type: DataTypes.TEXT,
                get: function() {
                    return JSON.parse(this.getDataValue('opts') || '{}');
                },
                set: function(val) {
                    return this.setDataValue('opts', JSON.stringify(val));
                }
            },
            settings: {
                type: DataTypes.TEXT,
                get: function() {
                    return JSON.parse(this.getDataValue('settings') || '{}');
                },
                set: function(val) {
                    return this.setDataValue('settings', JSON.stringify(val));
                }
            },
            name: DataTypes.STRING,
            description: DataTypes.TEXT,
            'id': {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            images: {
                type: DataTypes.TEXT,
                get: function() {
                    return JSON.parse(this.getDataValue('images') || '[]');
                },
                set: function(val) {
                    return this.setDataValue('images', JSON.stringify(val));
                }
            }
        };
    }

    var Visualization = sequelize.define('Visualization', schema, {
        classMethods: {
            associate: function(models) {
                 // associations can be defined here
                 Visualization.belongsTo(models.Session);
                 Visualization.belongsTo(models.VisualizationType);
            },

            getNamedObjectForVisualization: function(vid, name) {
                name = validator.escape(name);


                if(isPostgres) {
                    return sequelize
                        .query('SELECT data->\'' + name + '\'' + ' AS ' + name + ' FROM "Visualizations" WHERE id=' + vid);
                }


                return this.findById(vid).then(function(viz) {
                    var data = viz.data;
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


                return this.findById(vid).then(function(viz) {
                    var data = viz.data;
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


                return this.findById(vid).then(function(viz) {

                    var data = viz.data;
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


                return this.findById(vid).then(function(viz) {

                    var settings = viz.settings;
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
                if (type.initialDataFields && type.initialDataFields.length) {
                    var ret = {};
                    _.each(type.initialDataFields, function(field) {
                        if(!_.isUndefined(this.data[field])) {
                            ret[field] = this.data[field];
                        }
                    }, this);
                    return ret;
                } 

                return this.data;
            }
        }
    });

    return Visualization;
};
