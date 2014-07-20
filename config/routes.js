'use strict';
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var home = require('../app/controllers/home');

/**
 * Expose
 */

module.exports = function (app, passport) {

    app.get('/', home.index);

    


    app.get('/results/:uid', home.results);

    // app.get('/auth/facebook',
    //   passport.authenticate('facebook', { scope: 'read_stream' }));

    // app.get('/auth/facebook/callback',
    //   passport.authenticate('facebook', { failureRedirect: '/login' }),
    //   function(req, res) {
    //     // Successful authentication, redirect home.
    //     res.redirect('/results/' + req.user._id);
    //   });

    /**
     * Error handling
     */

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
