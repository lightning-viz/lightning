
/*!
 * Module dependencies.
 */

var _ = require('lodash');
var mongoose = require('mongoose');
var Session = mongoose.model('Notebook');



exports.index = function (req, res) {

    Session.find(function(err, sessions) {

        res.render('session/index', {
            sessions: sessions
        });

    });
};


exports.feed = function (req, res, next) {

    var sessionId = req.params.sid;


    Session.findById(sessionId, function(err, session) {
        if(err) {
            return next(err);
        }

        res.render('session/feed', {
            session: session
        });
    });
};



exports.create = function(req, res, next) {
    var session = new Session();
    session.save(function(err) {
        if(err) {
            return next(err);
        }
        return res.redirect('/sessions/' + session.id + '/feed/');
    });
};



exports.addData = function (req, res, next) {
    var sessionId = req.params.sid;

    console.log(req.body);


    Session.findById(sessionId, function(err, session) {
        if(err) {
            return next(err);
        }

        session.visualizations.push({data: req.body.data});
        var viz = session.visualizations[session.visualizations.length - 1];

        req.io.of('/sessions/' + sessionId)
            .emit('viz', viz);

        session.save(function(err) {
            if(err) {
                return next(err);
            }

            return res.json(200);
        });

    });
};