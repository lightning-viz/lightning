'use strict';
/**
 * Module dependencies.
 */

// var mongoose = require('mongoose');
var home = require('../app/controllers/home');
var session = require('../app/controllers/session');

/**
 * Expose
 */

module.exports = function (app) {

    app.get('/', home.index);
    app.get('/sessions', session.index);
    app.get('/sessions/create/', session.getNew);
    app.get('/sessions/:sid', session.feed);
    app.get('/sessions/:sid/feed', session.feed);
    
    app.put('/sessions/:sid', session.update);

    app.post('/sessions', session.create);
    app.post('/sessions/:sid/visualizations', session.addData);
    app.get('/visualizations/:vid', session.read);


    app.post('/sessions/:sid/visualizations/:vid/data', session.appendData);
    app.post('/sessions/:sid/visualizations/:vid/data/:field', session.appendData);


    app.put('/sessions/:sid/visualizations/:vid/data', session.updateData);
    app.put('/sessions/:sid/visualizations/:vid/data/:field', session.updateData);


    
    
    app.get('/sessions/:sid/visualizations/:vid/data', session.getData);
    app.get('/visualizations/:vid/data', session.getData);
    app.get('/sessions/:sid/visualizations/:vid/data/:field', session.getDataField);
    app.get('/visualizations/:vid/data/:field', session.getDataField);
    app.get('/sessions/:sid/visualizations/:vid/data/:field/:index', session.getDataAtIndex);
    app.get('/visualizations/:vid/data/:field/:index', session.getDataAtIndex);
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
