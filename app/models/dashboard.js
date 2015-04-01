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
                console.log('setting layout');
                console.log(val);
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
                var maxItem = _.max(this.layout, function(layoutItem) {
                    return layoutItem.row + layoutItem.size_y;
                });

                var maxRow = maxItem.row + maxItem.size_y;
                return Math.max(maxRow, 0) + 1;
            },

            addVisualizationToLayout: function() {
                console.log(this.layout);
                console.log(this.getNextOpenRow());
                var tl = this.layout;

                tl.push({
                    row: this.getNextOpenRow(),
                    col: 1,
                    size_x: 1,
                    size_y: 1
                });

                this.layout = tl;
                console.log(this.layout);
            },

            addVisualization: function(vizObj) {
                var models = require('./index.js');
                this.addVisualizationToLayout();
                this.save();
                return models.Visualization.create(vizObj);           
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
