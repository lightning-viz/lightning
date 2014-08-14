var validator = require('validator');

module.exports = function(sequelize, DataTypes) {
  var Visualization = sequelize.define('Visualization', {
    data: 'JSON',
    name: DataTypes.STRING,
    images: DataTypes.ARRAY(DataTypes.STRING)
  }, {
    classMethods: {
      associate: function(models) {
         // associations can be defined here
      }
    },

    instanceMethods: {
      getNamedObjectAtIndex: function(name, index) {

        name = validator.escape(name);
        if(!validator.isNumeric(index)) {
          throw Error('Must provide numeric index');
        }
        return sequelize
          .query('SELECT data->\'' + name + '\'->' + index + ' AS ' + name + ' FROM "Visualizations" WHERE id=' + this.id);
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
