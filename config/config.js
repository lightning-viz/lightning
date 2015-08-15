
/**
 * Module dependencies.
 */

var path = require('path');
var extend = require('util')._extend;
var argv = require('yargs').argv;

var development = require('./env/development');
var test = require('./env/test');
var production = require('./env/production');


var defaultVisualizations = argv.default_visualizations ? argv.default_visualizations : process.env.LIGHTNING_DEFAULT_VISUALIZATIONS;
if(defaultVisualizations) {
  defaultVisualizations = defaultVisualizations.join(',');
} else {
  defaultVisualizations = [
    'lightning-adjacency',
    'lightning-circle',
    'lightning-force',
    'lightning-gallery',
    'lightning-graph',
    'lightning-graph-bundled',
    'lightning-image',
    'lightning-image-poly',
    'lightning-line',
    'lightning-line-streaming',
    'lightning-map',
    'lightning-matrix',
    'lightning-scatter',
    'lightning-scatter-streaming',
    'lightning-scatter-3',
    'lightning-volume'
  ];
}

var defaults = {
  root: path.normalize(__dirname + '/..'),
  auth: {
    username: argv.username ? '' + argv.username : process.env.LIGHTNING_USERNAME,
    password: argv.password ? '' + argv.password : process.env.LIGHTNING_PASSWORD,
  },
  defaultVisualizations: defaultVisualizations
};


var formatBaseUrl = function(baseUrl) {
    baseUrl = baseUrl || '/';
    if(baseUrl.slice(-1) !== '/') {
        baseUrl += '/';
    }

    if(baseUrl.slice(0, 1) !== '/') {
        baseUrl = '/' + baseUrl;
    }

    if(baseUrl === '//') {
        baseUrl = '/';
    }
    return baseUrl;
}

/**
 * Expose
 */

var config = {
  development: extend(development, defaults),
  test: extend(test, defaults),
  production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];

config.baseURL = formatBaseUrl(config.baseURL);

module.exports = config;







