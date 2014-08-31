(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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



},{"./lib/bigSlide":2}],2:[function(require,module,exports){
/*! bigSlide - v0.4.3 - 2014-01-25
* http://ascott1.github.io/bigSlide.js/
* Copyright (c) 2014 Adam D. Scott; Licensed MIT */
(function($) {
  'use strict';

  $.fn.bigSlide = function(options) {

    var settings = $.extend({
      'menu': ('#menu'),
      'push': ('.push'),
      'side': 'left',
      'menuWidth': '16.625em',
      'menuOffscreen': '12.625em',
      'speed': '300'
    }, options);

    var menuLink = this,
        menu = $(settings.menu),
        push = $(settings.push),
        width = settings.menuWidth;

    var positionOffScreen = {
      'position': 'fixed',
      'top': '0',
      'bottom': '0',
      'width': settings.menuWidth,
      'height': '100%'
    };

    var animateSlide = {
      '-webkit-transition': settings.side + ' ' + settings.speed + 'ms ease',
      '-moz-transition': settings.side + ' ' + settings.speed + 'ms ease',
      '-ms-transition': settings.side + ' ' + settings.speed + 'ms ease',
      '-o-transition': settings.side + ' ' + settings.speed + 'ms ease',
      'transition': settings.side + ' ' + settings.speed + 'ms ease'
    };

    menu.css(positionOffScreen);
    menu.css(settings.side, '-' + settings.menuOffscreen);
    push.css(settings.side, '0');
    menu.css(animateSlide);
    push.css(animateSlide);

    menu._state = 'closed';

    menu.open = function() {
      menu._state = 'open';
      menu.css(settings.side, '0');
      push.css(settings.side, width);
    };

    menu.close = function() {
      menu._state = 'closed';
      menu.css(settings.side, '-' + settings.menuOffscreen);
      push.css(settings.side, '0');
    };

    menuLink.on('click.bigSlide', function(e) {
      e.preventDefault();
      if (menu._state === 'closed') {
        menu.open();
      } else {
        menu.close();
      }
    });

    menuLink.on('touchend', function(e){
      menuLink.trigger('click.bigSlide');
      e.preventDefault();
    });

    return menu;

  };

}(jQuery));
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tcGNvbmxlbi9wcm9qZWN0cy9qYW5lbGlhL2xpZ2h0bmluZy9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbXBjb25sZW4vcHJvamVjdHMvamFuZWxpYS9saWdodG5pbmcvdWkvanMvZmFrZV83M2Q5ZjQwLmpzIiwiL1VzZXJzL21wY29ubGVuL3Byb2plY3RzL2phbmVsaWEvbGlnaHRuaW5nL3VpL2pzL2xpYi9iaWdTbGlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyB2YXIgU25hcCA9IHJlcXVpcmUoJy4vbGliL3NuYXAnKTtcbnJlcXVpcmUoJy4vbGliL2JpZ1NsaWRlJyk7XG4kKCcubWVudS1saW5rJykuYmlnU2xpZGUoKTtcblxuLy8gdmFyIHNuYXBwZXIgPSBuZXcgU25hcCh7XG4vLyAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50Jylcbi8vIH0pO1xuXG4vLyB2YXIgY291bnRyaWVzID0gcmVxdWlyZSgnLi9kYXRhL2NvdW50cmllcycpO1xuLy8gdmFyIFNpZGViYXIgPSByZXF1aXJlKCcuL3ZpZXdzL3NpZGViYXInKTtcbi8vIHZhciBDb250ZW50ID0gcmVxdWlyZSgnLi92aWV3cy9jb250ZW50Jyk7XG4vLyB2YXIgTW9iaWxlID0gcmVxdWlyZSgnLi92aWV3cy9tb2JpbGUnKTtcbi8vIHZhciBlbWl0dGVyID0gcmVxdWlyZSgnLi9lbWl0dGVyJyk7XG4vLyB2YXIgc29jaWFsID0gcmVxdWlyZSgnLi9zb2NpYWwnKTtcblxuLy8gLy8gdmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLy8gdmFyIE1PQklMRV9CUkVBS1BPSU5UID0gNzYwO1xuLy8gdmFyIGNvbnRlbnQgPSBudWxsO1xuLy8gdmFyIG1vYmlsZSA9IG51bGw7XG4vLyB2YXIgc2lkZWJhciA9IG51bGw7XG4vLyB2YXIgJHNpZGViYXJFbCA9ICQoJy5zaWRlYmFyJyk7XG5cbi8vIHZhciBkcmF3ID0gZnVuY3Rpb24oKSB7XG4vLyAgICAgZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblxuLy8gICAgIGlmKHNpZGViYXIpIHtcbi8vICAgICAgICAgc2lkZWJhci5kZXN0cm95KCk7XG4vLyAgICAgfVxuLy8gICAgIGlmKG1vYmlsZSkge1xuLy8gICAgICAgICBtb2JpbGUuZGVzdHJveSgpO1xuLy8gICAgIH1cblxuLy8gICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gTU9CSUxFX0JSRUFLUE9JTlQpIHtcblxuLy8gICAgICAgICBzaWRlYmFyID0gbmV3IFNpZGViYXIoJHNpZGViYXJFbCk7XG4gICAgICAgXG4vLyAgICAgICAgIHZhciBjb3VudHJ5ID0gKGNvbnRlbnQpID8gY29udGVudC5jb3VudHJ5IDogY291bnRyaWVzWzBdO1xuLy8gICAgICAgICBjb250ZW50ID0gbmV3IENvbnRlbnQoJCgnLmRlc2t0b3AtY29udGVudC1jb250YWluZXInKSk7XG4vLyAgICAgICAgIGVtaXR0ZXIuZW1pdCgnY291bnRyeTpzZWxlY3RlZCcsIGNvdW50cnkpOyAgICAgICAgXG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgbW9iaWxlID0gbmV3IE1vYmlsZSgkKCcubW9iaWxlIC5jb250YWluZXInKSk7XG4vLyAgICAgfVxuICAgIFxuLy8gICAgIGVtaXR0ZXIub24oJ3NoYXJlOnR3aXR0ZXInLCBmdW5jdGlvbihjb3VudHJ5KSB7XG4vLyAgICAgICAgIHNvY2lhbC5zaGFyZU9uVHdpdHRlcihjb3VudHJ5KTtcbi8vICAgICB9KTtcblxuLy8gICAgIGVtaXR0ZXIub24oJ3NoYXJlOmZhY2Vib29rJywgZnVuY3Rpb24oY291bnRyeSkge1xuLy8gICAgICAgICBzb2NpYWwuc2hhcmVPbkZhY2Vib29rKGNvdW50cnkpO1xuLy8gICAgIH0pO1xuXG4vLyB9O1xuXG4vLyB3aW5kb3cub25yZXNpemUgPSBkcmF3O1xuLy8gZHJhdygpO1xuXG4vL1xuLy8gYXBwLmpzIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgdGhlIGVudGlyZSBjbGllbnQtc2lkZVxuLy8gYXBwbGljYXRpb24uIEFueSBuZWNlc3NhcnkgdG9wIGxldmVsIGxpYnJhcmllcyBzaG91bGQgYmVcbi8vIHJlcXVpcmVkIGhlcmUgKGUuZy4gcHltLmpzKSwgYW5kIGl0IHNob3VsZCBhbHNvIGJlXG4vLyByZXNwb25zaWJsZSBmb3IgaW5zdGFudGlhdGluZyBjb3JyZWN0IHZpZXdjb250cm9sbGVycy5cbi8vXG5cblxuIiwiLyohIGJpZ1NsaWRlIC0gdjAuNC4zIC0gMjAxNC0wMS0yNVxuKiBodHRwOi8vYXNjb3R0MS5naXRodWIuaW8vYmlnU2xpZGUuanMvXG4qIENvcHlyaWdodCAoYykgMjAxNCBBZGFtIEQuIFNjb3R0OyBMaWNlbnNlZCBNSVQgKi9cbihmdW5jdGlvbigkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAkLmZuLmJpZ1NsaWRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe1xuICAgICAgJ21lbnUnOiAoJyNtZW51JyksXG4gICAgICAncHVzaCc6ICgnLnB1c2gnKSxcbiAgICAgICdzaWRlJzogJ2xlZnQnLFxuICAgICAgJ21lbnVXaWR0aCc6ICcxNi42MjVlbScsXG4gICAgICAnbWVudU9mZnNjcmVlbic6ICcxMi42MjVlbScsXG4gICAgICAnc3BlZWQnOiAnMzAwJ1xuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgdmFyIG1lbnVMaW5rID0gdGhpcyxcbiAgICAgICAgbWVudSA9ICQoc2V0dGluZ3MubWVudSksXG4gICAgICAgIHB1c2ggPSAkKHNldHRpbmdzLnB1c2gpLFxuICAgICAgICB3aWR0aCA9IHNldHRpbmdzLm1lbnVXaWR0aDtcblxuICAgIHZhciBwb3NpdGlvbk9mZlNjcmVlbiA9IHtcbiAgICAgICdwb3NpdGlvbic6ICdmaXhlZCcsXG4gICAgICAndG9wJzogJzAnLFxuICAgICAgJ2JvdHRvbSc6ICcwJyxcbiAgICAgICd3aWR0aCc6IHNldHRpbmdzLm1lbnVXaWR0aCxcbiAgICAgICdoZWlnaHQnOiAnMTAwJSdcbiAgICB9O1xuXG4gICAgdmFyIGFuaW1hdGVTbGlkZSA9IHtcbiAgICAgICctd2Via2l0LXRyYW5zaXRpb24nOiBzZXR0aW5ncy5zaWRlICsgJyAnICsgc2V0dGluZ3Muc3BlZWQgKyAnbXMgZWFzZScsXG4gICAgICAnLW1vei10cmFuc2l0aW9uJzogc2V0dGluZ3Muc2lkZSArICcgJyArIHNldHRpbmdzLnNwZWVkICsgJ21zIGVhc2UnLFxuICAgICAgJy1tcy10cmFuc2l0aW9uJzogc2V0dGluZ3Muc2lkZSArICcgJyArIHNldHRpbmdzLnNwZWVkICsgJ21zIGVhc2UnLFxuICAgICAgJy1vLXRyYW5zaXRpb24nOiBzZXR0aW5ncy5zaWRlICsgJyAnICsgc2V0dGluZ3Muc3BlZWQgKyAnbXMgZWFzZScsXG4gICAgICAndHJhbnNpdGlvbic6IHNldHRpbmdzLnNpZGUgKyAnICcgKyBzZXR0aW5ncy5zcGVlZCArICdtcyBlYXNlJ1xuICAgIH07XG5cbiAgICBtZW51LmNzcyhwb3NpdGlvbk9mZlNjcmVlbik7XG4gICAgbWVudS5jc3Moc2V0dGluZ3Muc2lkZSwgJy0nICsgc2V0dGluZ3MubWVudU9mZnNjcmVlbik7XG4gICAgcHVzaC5jc3Moc2V0dGluZ3Muc2lkZSwgJzAnKTtcbiAgICBtZW51LmNzcyhhbmltYXRlU2xpZGUpO1xuICAgIHB1c2guY3NzKGFuaW1hdGVTbGlkZSk7XG5cbiAgICBtZW51Ll9zdGF0ZSA9ICdjbG9zZWQnO1xuXG4gICAgbWVudS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgICBtZW51Ll9zdGF0ZSA9ICdvcGVuJztcbiAgICAgIG1lbnUuY3NzKHNldHRpbmdzLnNpZGUsICcwJyk7XG4gICAgICBwdXNoLmNzcyhzZXR0aW5ncy5zaWRlLCB3aWR0aCk7XG4gICAgfTtcblxuICAgIG1lbnUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIG1lbnUuX3N0YXRlID0gJ2Nsb3NlZCc7XG4gICAgICBtZW51LmNzcyhzZXR0aW5ncy5zaWRlLCAnLScgKyBzZXR0aW5ncy5tZW51T2Zmc2NyZWVuKTtcbiAgICAgIHB1c2guY3NzKHNldHRpbmdzLnNpZGUsICcwJyk7XG4gICAgfTtcblxuICAgIG1lbnVMaW5rLm9uKCdjbGljay5iaWdTbGlkZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChtZW51Ll9zdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgbWVudS5vcGVuKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW51LmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBtZW51TGluay5vbigndG91Y2hlbmQnLCBmdW5jdGlvbihlKXtcbiAgICAgIG1lbnVMaW5rLnRyaWdnZXIoJ2NsaWNrLmJpZ1NsaWRlJyk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbWVudTtcblxuICB9O1xuXG59KGpRdWVyeSkpOyJdfQ==
