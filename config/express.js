
/**
 * Module dependencies.
 */
var session = require('cookie-session');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var serveStatic = require('serve-static');
var slashes = require('connect-slashes');
var favicon = require('serve-favicon');

var winston = require('winston');
var helpers = require('view-helpers');
var config = require('./config');
var pkg = require('../package.json');
var moment = require('moment');
var path = require('path');
var cors = require('cors');

var env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app, io) {

    // Compression middleware (should be placed before express.static)
    app.use(compression({
        threshold: 512
    }));

    // Static files middleware
    app.use(favicon(path.resolve(__dirname + '/../public/images/favicon.ico')));
    app.use(serveStatic(config.root + '/public'));

    // Use winston on production
    var log;
    if (env !== 'development') {
        log = {
            stream: {
                write: function (message, encoding) {
                    winston.info(message);
                }
            }
        };
    } else {
        log = { format: 'dev' };
    }

    // Don't log during tests
    // Logging middleware
    app.set('trust proxy', 'loopback');
    app.use(cors());
    app.use(slashes());

    // set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');

    app.use(function (req, res, next) {
        req.io = io;
        next();
    });


    var baseUrl = config.baseURL;
    var static_url = baseUrl;
    if(config.url) {
        static_url = config.url + baseUrl;
    }

    // cookieParser should be above session
    app.use(cookieParser());

    // bodyParser should be above methodOverride
    app.use(bodyParser.json({limit: '50mb'}));    
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));


    var getRequestStaticUrl = function(req) {
        if(req.query.host) {
            return req.query.host;
        }

        if(req.headers.host) {
            var reqType = req.headers['x-forwarded-proto'];
            return ((req.secure || reqType === 'https') ? 'https' : 'http') + '://' + req.headers.host + baseUrl;
        }

        return static_url + baseUrl;
    };


    // expose package.json to views
    app.use(function (req, res, next) {

        var staticUrl = getRequestStaticUrl(req);
        if(staticUrl.slice(-1) !== '/') {
            staticUrl += '/';
        }

        res.locals.pkg = pkg;
        res.locals.env = env;
        res.locals.moment = moment;
        res.locals._ = require('lodash');
        res.locals.marked = require('marked');
        res.locals.utils = require('../app/utils');
        res.locals.STATIC_URL =  staticUrl;
        res.locals.BASE_URL = baseUrl;
        next();
    });


    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    // express/mongo session storage
    app.use(session({
        secret: pkg.name,
        // store: new mongoStore({
        //     url: config.db,
        //     collection : 'sessions'
        // }),
        cookie: {
            maxAge: 1000*60*60
        }
    }));

    // should be declared after session and flash
    app.use(helpers(pkg.name));

    // adds CSRF support
    if (process.env.NODE_ENV !== 'test') {
        // app.use(csrf());

        // // This could be moved to view-helpers :-)
        // app.use(function(req, res, next){
        //     res.locals.csrf_token = req.csrfToken();
        //     next();
        // });
    }
};
