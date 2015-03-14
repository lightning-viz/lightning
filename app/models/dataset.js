'use strict';

var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../../config/database')[env];
var isPostgres = config.dialect === 'postgres';



module.exports = function(sequelize, DataTypes) {

    var schema = {
        identifier: DataTypes.STRING,
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
            }
        }
    });

    return DataSet;
};
