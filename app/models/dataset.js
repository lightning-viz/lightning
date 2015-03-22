'use strict';

var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/database')[env];
var isPostgres = config.dialect === 'postgres';
var validator = require('validator');
var _ = require('lodash');



module.exports = function(sequelize, DataTypes) {

    var schema = {
        identifier: DataTypes.STRING,
        name: DataTypes.STRING,
        data: 'JSON',
    };

    if(!isPostgres) {
        schema.data = {
            type: DataTypes.TEXT,
            get: function() {
                return JSON.parse(this.getDataValue('data') || '{}');
            },
            set: function(val) {
                return this.setDataValue('data', JSON.stringify(val));
            }
        };
    }


    var DataSet = sequelize.define('DataSet', schema, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
             DataSet.belongsTo(models.Dashboard);
            },


            getDataForVisualization: function(vid) {
                return sequelize.query('SELECT * from "DataSets" WHERE id=' + vid);
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
                        .query('SELECT data->' + qs + ' AS data FROM "DataSets" WHERE id=' + vid);

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
                        .query('SELECT settings->' + qs + ' AS settings FROM "DataSets" WHERE id=' + vid);

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
                return DataSet.getDataForVisualization(this.id);
            },
            queryData: function(keys) {
                return DataSet.queryDataForVisualization(this.id, keys);
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
            beforeValidate: function(dataset, next) {

                if(isPostgres) {
                    dataset.data = JSON.stringify(dataset.data);
                }
                next();
            }
        }
    });

    return DataSet;
};
