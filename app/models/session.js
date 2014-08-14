module.exports = function(sequelize, DataTypes) {

  console.log(sequelize.JSON);
  console.log(sequelize);


  var Session = sequelize.define('Session', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
         // associations can be defined here
      }
    }
  })

  return Session
}
