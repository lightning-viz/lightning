var uuid = require('node-uuid');

module.exports = function(sequelize, DataTypes) {

    var Session = sequelize.define('Session', {
        name: DataTypes.STRING,
        identifier: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                 Session.hasMany(models.Visualization);
            }
        },

        instanceMethods: {
            getDisplayName: function() {
                return this.name || ('Session ' + this.id);
            }
        },

        hooks: {
            beforeCreate: function(session, next) {
                session.identifier = uuid.v4();
                next();
            }
        }
    });

    return Session;
};

