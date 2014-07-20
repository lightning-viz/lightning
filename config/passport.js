
/*!
 * Module dependencies.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');

// var facebook = require('./passport/facebook');

/**
 * Expose
 */

module.exports = function (passport, config) {
  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user)
    })
  })

  // use these strategies
  // passport.use(facebook);
};
