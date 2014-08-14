var validator = require('validator');

module.exports = function(sequelize, DataTypes) {
    var Visualization = sequelize.define('Visualization', {
        data: 'JSON',
        name: DataTypes.STRING,
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
                console.log('name');
                console.log('SELECT data->\'' + name + '\'' + ' AS ' + name + ' FROM "Visualizations" WHERE id=' + vid);
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
            }
        },

        instanceMethods: {
            getNamedObjectAtIndex: function(name, index) {
                return Visualization.getNamedObjectAtIndexForVisualization(this.id, name, index);
            }, 
            getNamedObject: function(name) {
                return Visualization.getNamedObjectForVisualization(this.id, name);
            }
        },

        hooks: {
            beforeValidate: function(visualization, next) {
                console.log('before validate');
                visualization.data = JSON.stringify(visualization.data);
                next();
            }
        }
    });

    return Visualization;
};
