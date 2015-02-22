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
            type: DataTypes.STRING,
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
                 Visualization.belongsTo(models.Session);
                 Visualization.belongsTo(models.Dashboard);
                 Visualization.belongsTo(models.DataSet);
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


                return this.find(vid).then(function(viz) {

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
            getData: function() {
                return Visualization.getDataForVisualization(this.id);
            },
            queryData: function(keys) {
                return Visualization.queryDataForVisualization(this.id, keys);
            },
            getInitialData: function(type) {
                if(type.initialDataFields.lenth) {
                    var ret = {};
                    _.each(type.initialDataFields, function(field) {
                        if(!_.isUndefined(this.data[field])) {
                            ret[field] = this.data[field];
                        }
                    }, this);
                    return ret;
                } 

                return this.data;
            },

            updateData: function(data, fieldName) {
                if(fieldName) {
                    this.data[fieldName] = data;
                } else {
                    this.data = data;
                }

                return this.save();
            },            

            appendData: function(data, fieldName) {

                var self = this;
                var vdata;
                if(fieldName) {
                    if(_.isArray(self.data[fieldName])) {
                        if(self.type.indexOf('streaming') > -1) {
                            _.each(data, function(d, i) {
                                if(i < self.data[fieldName].length) {
                                    self.data[fieldName][i] = self.data[fieldName][i].concat(d);
                                }
                            });
                        } else {
                            vdata = self.data;
                            vdata[fieldName].push(data);
                            self.data = vdata;
                        }
                    } else if(_.isUndefined(self.data[fieldName])) {
                        self.data[fieldName] = data;
                    } else {
                        console.log('unknown field');
                    }
                } else {
                    if(_.isArray(self.data)) {
                        if(_.isArray(data)) {
                            if(self.type.indexOf('streaming') > -1) {
                                _.each(data, function(d, i) {

                                });
                            } else {
                                self.data = self.data.concat(data);
                            }
                        } else {
                            vdata = self.data;
                            vdata.push(data);
                            self.data = vdata;
                        }
                    } else if(_.isUndefined(self.data)) {
                        self.data = data;
                    } else {
                        console.log('unknown field');
                    }
                }

                return this.save();
            },

            updateImages: function(images) {
                this.images = images;
                return this.save();
            },

            appendImages: function(images) {
                if(this.images) {
                    this.images = this.images.concat(images);
                } else {
                    this.images = images;
                }
                return this.save();
            },

        },

        hooks: {
            beforeValidate: function(visualization, next) {

                if(isPostgres) {
                    visualization.settings = JSON.stringify(visualization.settings);
                    visualization.data = JSON.stringify(visualization.data);
                    visualization.opts = JSON.stringify(visualization.opts);
                }
                next();
            }
        }
    });

    return Visualization;
};
