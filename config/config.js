
/**
 * Module dependencies.
 */

var path = require('path');
var extend = require('util')._extend;
var argv = require('yargs').argv;

var development = require('./env/development');
var test = require('./env/test');
var production = require('./env/production');


var defaults = {
  root: path.normalize(__dirname + '/..'),
  auth: {
    username: argv.username ? '' + argv.username : process.env.LIGHTNING_USERNAME,
    password: argv.password ? '' + argv.password : process.env.LIGHTNING_PASSWORD,
  }
};


/**
 * Expose
 */

module.exports = {
  development: extend(development, defaults),
  test: extend(test, defaults),
  production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];
