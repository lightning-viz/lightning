
module.exports = function(sequelize, DataTypes) {

    var Session = sequelize.define('Session', {
        name: DataTypes.STRING,
        'id': {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
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
                next();
            }
        }
    });

    return Session;
};

