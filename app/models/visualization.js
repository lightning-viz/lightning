var validator = require('validator');

module.exports = function(sequelize, DataTypes) {
    var Visualization = sequelize.define('Visualization', {
        data: 'JSON',
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
                next();
            }
        }
    });

    return Visualization;
};
