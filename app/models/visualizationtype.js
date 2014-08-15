module.exports = function(sequelize, DataTypes) {
  var VisualizationType = sequelize.define('VisualizationType', {
    name: DataTypes.STRING,
    initialDataField: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
         // associations can be defined here
      }
    }
  });

  return VisualizationType
}
