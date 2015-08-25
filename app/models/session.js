
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
                var identifier = '' + this.id;
                return this.name || ('Session ' + identifier.substring(0, 5));
            }
        },

        hooks: {
            beforeCreate: function(session, options, next) {
                next();
            }
        }
    });

    return Session;
};

