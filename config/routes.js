'use strict';

// controllers
var home = require('../app/controllers/home');
var session = require('../app/controllers/session');
var visualizationTypes = require('../app/controllers/visualizationTypes');
var visualization = require('../app/controllers/visualization');
var staticController = require('../app/controllers/static');
var basicAuth = require('basic-auth-connect');
var config = require('./config');

/**
 * Expose
 */

module.exports = function (app) {

    var auth = config.auth || {};
    var baseURL = config.baseURL || '/';
    if(baseURL.slice(-1) !== '/') {
        baseURL += '/';
    }

    if(baseURL.slice(0) !== '/') {
        baseURL = '/' + baseURL;
    }




    var authMiddleware = function(req, res, next) {next()};


    if(auth.username && auth.password) {
        authMiddleware = basicAuth(auth.username, auth.password);
    }


    app.options('*', function (req, res) {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Headers", "X-Requested-With");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");
        res.status(200).send();
    })


    app.get(baseURL + 'playground', home.playground);

    app.get(baseURL + 'js/dynamic/viz', staticController.getDynamicVizBundle);
    app.get(baseURL + 'css/dynamic/viz', staticController.getDynamicVizStyles);
    app.post(baseURL + 'js/dynamic', staticController.bundleJSForExecution);
    app.post(baseURL + 'css/dynamic', staticController.buildSCSS);
    app.get(baseURL + 'visualizations/:vid/public', visualization.publicRead);
    app.get(baseURL + 'visualizations/:vid/screenshot', visualization.screenshot);
    app.get(baseURL + 'sessions/:sid/public', session.publicRead);
    app.get(baseURL + 'visualizations/:vid/iframe', visualization.iframe);
    app.get(baseURL + 'visualizations/:vid/pym', visualization.pym);

    // visualizations
    app.post(baseURL + 'visualizations/types', authMiddleware, visualizationTypes.create);
    app.put(baseURL + 'visualizations/types/:vid', authMiddleware, visualizationTypes.edit);
    app.get(baseURL + 'visualizations/types', authMiddleware, visualizationTypes.index);

    app.get(baseURL + 'visualization-types', authMiddleware, visualizationTypes.show);
    app.get(baseURL + 'visualization-types/fetch-defaults', authMiddleware, visualizationTypes.fetchDefaults);
    app.get(baseURL + 'visualization-types/reset-defaults', authMiddleware, visualizationTypes.resetDefaults);
    app.post(baseURL + 'visualization-types', authMiddleware, visualizationTypes.importViz);
    app.get(baseURL + 'visualization-types/preview', authMiddleware, visualizationTypes.preview);
    app.get(baseURL + 'visualization-types/preview/full', authMiddleware, visualizationTypes.preview);
    app.get(baseURL + 'visualization-types/:vid', authMiddleware, visualizationTypes.editor);
    
    app.get(baseURL, authMiddleware, home.index);
    app.get(baseURL + 'sessions', authMiddleware, session.index);
    app.get(baseURL + 'sessions/create/', authMiddleware, session.getCreate);
    app.get(baseURL + 'status', authMiddleware, home.status);

    app.get(baseURL + 'sessions/:sid/delete/', authMiddleware, session.getDelete);
    app.delete(baseURL + 'sessions/:sid/', authMiddleware, session.delete);
    app.delete(baseURL + 'visualization-types/:vid/', authMiddleware, visualizationTypes.delete);
    app.get(baseURL + 'visualization-types/:vid/delete', authMiddleware, visualizationTypes.getDelete);

    app.get(baseURL + 'sessions/:sid', authMiddleware, session.feed);
    app.get(baseURL + 'sessions/:sid/feed', authMiddleware, session.feed);
    
    app.put(baseURL + 'sessions/:sid', authMiddleware, session.update);
    app.put(baseURL + 'visualizations/:vid', authMiddleware, visualization.update);

    app.post(baseURL + 'sessions', authMiddleware, session.create);
    app.post(baseURL + 'sessions/:sid/visualizations', authMiddleware, session.addData);
    app.get(baseURL + 'visualizations/:vid', authMiddleware, visualization.read);
    app.delete(baseURL + 'visualizations/:vid', authMiddleware, visualization.delete);
    app.get(baseURL + 'visualizations/:vid/delete', authMiddleware, visualization.getDelete);
    app.get(baseURL + 'visualizations/:vid/embed', authMiddleware, visualization.embed);
    app.get(baseURL + 'sessions/:sid/visualizations', authMiddleware, session.listVisualizations);


    app.post(baseURL + 'sessions/:sid/visualizations/:vid/data', authMiddleware, session.appendData);
    app.post(baseURL + 'sessions/:sid/visualizations/:vid/data/:field', authMiddleware, session.appendData);


    app.put(baseURL + 'sessions/:sid/visualizations/:vid/data', authMiddleware, session.updateData);
    app.put(baseURL + 'sessions/:sid/visualizations/:vid/data/:field', authMiddleware, session.updateData);
    


    // public / userland stuff
    app.get(baseURL + 'sessions/:sid/visualizations/:vid/data', visualization.getData);
    app.get(baseURL + 'sessions/:sid/visualizations/:vid/settings', visualization.getSettings);
    app.put(baseURL + 'visualizations/:vid/settings', visualization.updateSettings);
    app.post(baseURL + 'visualizations/:vid/settings', visualization.updateSettings);
    app.get(baseURL + 'visualizations/:vid/settings', visualization.getSettings);
    app.get(baseURL + 'visualizations/:vid/data', visualization.getData);

    
    // dynamic fields
    var safeBaseURL = baseURL.replace(/\//g, '\\/');
    var visualizationDataWithKeysRegex = new RegExp('^' + safeBaseURL + 'visualizations\\/(\\d+)\\/data\\/([^ ]+)');
    var visualizationSettingsWithKeysRegex = new RegExp('^' + safeBaseURL + 'visualizations\\/(\\d+)\\/settings\\/([^ ]+)');
    var sessionDataWithKeysRegex = new RegExp('^' + safeBaseURL + 'sessions\\/\\d+\\/visualizations(\\d+)\\/data\\/([^ ]+)');
    var sessionSettingsWithKeysRegex = new RegExp('^' + safeBaseURL + 'sessions\\/\\d+\\/visualizations\\/(\\d+)\\/settings\\/([^ ]+)');

    app.get(visualizationDataWithKeysRegex, visualization.getDataWithKeys);
    app.get(visualizationSettingsWithKeysRegex, visualization.getSettingsWithKeys);
    app.get(sessionDataWithKeysRegex, visualization.getDataWithKeys);
    app.get(sessionSettingsWithKeysRegex, visualization.getSettingsWithKeys);
    // app.post('/sessions/:sid/visualizations/:vid/images', session.addImage);




    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
            || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }
        console.error(err.stack);
        // error page
        res.status(500).render('500', { error: err.stack });
    });

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not found'
        });
    });
};
