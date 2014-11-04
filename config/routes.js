'use strict';

// controllers
var home = require('../app/controllers/home');
var session = require('../app/controllers/session');
var visualizationTypes = require('../app/controllers/visualizationTypes');
var visualization = require('../app/controllers/visualization');
var staticController = require('../app/controllers/static');


/**
 * Expose
 */

module.exports = function (app) {

    app.get('/playground', home.playground);

    app.get('/js/dynamic/viz', staticController.getDynamicVizBundle);
    app.get('/css/dynamic/viz', staticController.getDynamicVizStyles);
    app.post('/js/dynamic', staticController.bundleJSForExecution);
    app.post('/css/dynamic', staticController.buildSCSS);

    // visualizatinos
    app.post('/visualizations/types', visualizationTypes.create);
    app.put('/visualizations/types/:vid', visualizationTypes.edit);
    app.get('/visualizations/types', visualizationTypes.index);

    app.get('/visualization-types', visualizationTypes.show);
    app.get('/visualization-types/fetch-defaults', visualizationTypes.fetchDefaults);
    app.post('/visualization-types', visualizationTypes.importViz);
    app.get('/visualization-types/preview', visualizationTypes.preview);
    app.get('/visualization-types/:vid', visualizationTypes.editor);
    
    app.get('/', home.index);
    app.get('/sessions', session.index);
    app.get('/sessions/create/', session.getCreate);

    app.get('/sessions/:sid/delete/', session.getDelete);
    app.delete('/sessions/:sid/', session.delete);
    app.delete('/visualization-types/:vid/', visualizationTypes.delete);
    app.get('/visualization-types/:vid/delete', visualizationTypes.getDelete);

    app.get('/sessions/:sid', session.feed);
    app.get('/sessions/:sid/feed', session.feed);
    
    app.put('/sessions/:sid', session.update);
    app.put('/visualizations/:vid', visualization.update);

    app.post('/sessions', session.create);
    app.post('/sessions/:sid/visualizations', session.addData);
    app.get('/visualizations/:vid', visualization.read);
    app.get('/visualizations/:vid/embed', visualization.embed);


    app.post('/sessions/:sid/visualizations/:vid/data', session.appendData);
    app.post('/sessions/:sid/visualizations/:vid/data/:field', session.appendData);


    app.put('/sessions/:sid/visualizations/:vid/data', visualization.updateData);
    app.put('/sessions/:sid/visualizations/:vid/data/:field', visualization.updateData);


    
    
    app.get('/sessions/:sid/visualizations/:vid/data', visualization.getData);
    app.get('/visualizations/:vid/data', visualization.getData);
    app.get(/^\/visualizations\/(\d+)\/data\/([^ ]+)/, visualization.getDataWithKeys);
    app.get(/^\/sessions\/(\d+)\/visualizations\/(\d+)\/data\/([^ ]+)/, visualization.getDataWithKeys);
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
