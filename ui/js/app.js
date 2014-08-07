'use strict';

// var Snap = require('./lib/snap');
require('./lib/bigSlide');
$('.menu-link').bigSlide();

// var snapper = new Snap({
//   element: document.getElementById('content')
// });

// var countries = require('./data/countries');
// var Sidebar = require('./views/sidebar');
// var Content = require('./views/content');
// var Mobile = require('./views/mobile');
// var emitter = require('./emitter');
// var social = require('./social');

// // var _ = require('lodash');

// var MOBILE_BREAKPOINT = 760;
// var content = null;
// var mobile = null;
// var sidebar = null;
// var $sidebarEl = $('.sidebar');

// var draw = function() {
//     emitter.removeAllListeners();

//     if(sidebar) {
//         sidebar.destroy();
//     }
//     if(mobile) {
//         mobile.destroy();
//     }

//     if($(window).width() > MOBILE_BREAKPOINT) {

//         sidebar = new Sidebar($sidebarEl);
       
//         var country = (content) ? content.country : countries[0];
//         content = new Content($('.desktop-content-container'));
//         emitter.emit('country:selected', country);        
//     } else {
//         mobile = new Mobile($('.mobile .container'));
//     }
    
//     emitter.on('share:twitter', function(country) {
//         social.shareOnTwitter(country);
//     });

//     emitter.on('share:facebook', function(country) {
//         social.shareOnFacebook(country);
//     });

// };

// window.onresize = draw;
// draw();

//
// app.js is the entry point for the entire client-side
// application. Any necessary top level libraries should be
// required here (e.g. pym.js), and it should also be
// responsible for instantiating correct viewcontrollers.
//


