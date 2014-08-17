'use strict';
/**
 * Module dependencies.
 */

// // var mongoose = require('mongoose');
// var FacebookStrategy = require('passport-facebook').Strategy;
// // var User = mongoose.model('User');
// var graph = require('fbgraph');

// /**
//  * Expose
//  */

// module.exports = new FacebookStrategy({
//         clientID: process.env.FACEBOOK_APP_ID,
//         clientSecret: process.env.FACEBOOK_APP_SECRET,
//         callbackURL: ((process.env.NODE_ENV === 'production') ? 'http://boiling-crag-2021.herokuapp.com' : 'http://localhost:3000') + '/auth/facebook/callback',
//         enableProof: false
//     },
//     function(accessToken, refreshToken, profile, done) {


//         graph.extendAccessToken({
//             'access_token': accessToken,
//             'client_id': process.env.FACEBOOK_APP_ID,
//             'client_secret': process.env.FACEBOOK_APP_SECRET
//         }, function (err, facebookRes) {
//             if(err) {
//                 return done(err);
//             }

//             User.findOrCreate({
//                 accessToken: facebookRes.access_token
//             }, function(err, user) {
//                 return done(err, user);
//             });



//         });
//     }
// );
