'use strict';

module.exports = function(sequelize, DataTypes) {
    var Dashboard = sequelize.define('Dashboard', {
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                
            }
        }
    });

    return Dashboard;
};
