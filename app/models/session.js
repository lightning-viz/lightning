module.exports = function(sequelize, DataTypes) {

  var Session = sequelize.define('Session', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
         Session.hasMany(models.Visualization);
      }
    }
  });

  return Session;
};

