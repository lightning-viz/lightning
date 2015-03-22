'use strict';
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/database')[env];
var isPostgres = config.dialect === 'postgres';
var _ = require('lodash');

module.exports = function(sequelize, DataTypes) {
    var schema = {
        identifier: DataTypes.STRING,
        layout: {
            type: 'JSON',
            defaultValue: [],
        }
    };
    if(!isPostgres) {
        schema.layout = {
            type: DataTypes.TEXT,
            get: function() {
                return JSON.parse(this.getDataValue('layout') || '[]');
            },
            set: function(val) {
                return this.setDataValue('layout', JSON.stringify(val));
            }
        };
    }


    var Dashboard = sequelize.define('Dashboard', schema, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        },

        instanceMethods: {
            getDisplayName: function() {
                return this.name || ('Dashboard ' + this.id);
            },

            getNextOpenRow: function() {
                return _.max(this.layout, function(layoutItem) {
                    return layoutItem.row;
                }) + 1;
            }
        },

        hooks: {
            beforeValidate: function(dashboard, next) {
                if(isPostgres) {
                    dashboard.layout = JSON.stringify(dashboard.layout);
                }
                next();
            }
        }
    });

    return Dashboard;
};
