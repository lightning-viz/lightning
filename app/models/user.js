
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var userPlugin = require('mongoose-user');
var findOrCreate = require('mongoose-findorcreate')

var Schema = mongoose.Schema;

/**
 * User schema
 */

var UserSchema = new Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    username: { type: String, default: '' },
    hashed_password: { type: String, default: '' },
    salt: { type: String, default: '' },
    accessToken: { type: String, default: '' }
});

/**
 * User plugin
 */

// UserSchema.plugin(userPlugin, {});
UserSchema.plugin(findOrCreate);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

UserSchema.method({

});

/**
 * Statics
 */

UserSchema.static({

});

/**
 * Register
 */

mongoose.model('User', UserSchema);
