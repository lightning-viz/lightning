
/*!
 * Module dependencies.
 */

var _ = require('lodash');
var mongoose = require('mongoose');
var Session = mongoose.model('Notebook');
var Visualization = mongoose.model('Visualization');



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

exports.read = function (req, res, next) {

    var sessionId = req.params.sid;
    var vizId = req.params.vid;

    Session.findById(sessionId, function(err, session) {
        if(err) {
            return next(err);
        }

        var viz = _.find(session.visualizations, function (v) {
            return v.id === vizId;
        });

        res.render('session/visualization', {
            session: session,
            viz: viz
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

        session.visualizations.push({data: req.body.data, type: req.body.type});
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