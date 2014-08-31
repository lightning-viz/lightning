module.exports = function(sequelize, DataTypes) {
  var VisualizationType = sequelize.define('VisualizationType', {
    name: {type: DataTypes.STRING, unique: true},
    initialDataField: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
         // associations can be defined here
      }
    }
  });

  return VisualizationType;
};
