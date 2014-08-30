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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tcGNvbmxlbi9wcm9qZWN0cy9qYW5lbGlhL2xpZ2h0bmluZy9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbXBjb25sZW4vcHJvamVjdHMvamFuZWxpYS9saWdodG5pbmcvdWkvanMvZmFrZV85OTkzZWNlYy5qcyIsIi9Vc2Vycy9tcGNvbmxlbi9wcm9qZWN0cy9qYW5lbGlhL2xpZ2h0bmluZy91aS9qcy9saWIvYmlnU2xpZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuLy8gdmFyIFNuYXAgPSByZXF1aXJlKCcuL2xpYi9zbmFwJyk7XG5yZXF1aXJlKCcuL2xpYi9iaWdTbGlkZScpO1xuJCgnLm1lbnUtbGluaycpLmJpZ1NsaWRlKCk7XG5cbi8vIHZhciBzbmFwcGVyID0gbmV3IFNuYXAoe1xuLy8gICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpXG4vLyB9KTtcblxuLy8gdmFyIGNvdW50cmllcyA9IHJlcXVpcmUoJy4vZGF0YS9jb3VudHJpZXMnKTtcbi8vIHZhciBTaWRlYmFyID0gcmVxdWlyZSgnLi92aWV3cy9zaWRlYmFyJyk7XG4vLyB2YXIgQ29udGVudCA9IHJlcXVpcmUoJy4vdmlld3MvY29udGVudCcpO1xuLy8gdmFyIE1vYmlsZSA9IHJlcXVpcmUoJy4vdmlld3MvbW9iaWxlJyk7XG4vLyB2YXIgZW1pdHRlciA9IHJlcXVpcmUoJy4vZW1pdHRlcicpO1xuLy8gdmFyIHNvY2lhbCA9IHJlcXVpcmUoJy4vc29jaWFsJyk7XG5cbi8vIC8vIHZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbi8vIHZhciBNT0JJTEVfQlJFQUtQT0lOVCA9IDc2MDtcbi8vIHZhciBjb250ZW50ID0gbnVsbDtcbi8vIHZhciBtb2JpbGUgPSBudWxsO1xuLy8gdmFyIHNpZGViYXIgPSBudWxsO1xuLy8gdmFyICRzaWRlYmFyRWwgPSAkKCcuc2lkZWJhcicpO1xuXG4vLyB2YXIgZHJhdyA9IGZ1bmN0aW9uKCkge1xuLy8gICAgIGVtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG5cbi8vICAgICBpZihzaWRlYmFyKSB7XG4vLyAgICAgICAgIHNpZGViYXIuZGVzdHJveSgpO1xuLy8gICAgIH1cbi8vICAgICBpZihtb2JpbGUpIHtcbi8vICAgICAgICAgbW9iaWxlLmRlc3Ryb3koKTtcbi8vICAgICB9XG5cbi8vICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA+IE1PQklMRV9CUkVBS1BPSU5UKSB7XG5cbi8vICAgICAgICAgc2lkZWJhciA9IG5ldyBTaWRlYmFyKCRzaWRlYmFyRWwpO1xuICAgICAgIFxuLy8gICAgICAgICB2YXIgY291bnRyeSA9IChjb250ZW50KSA/IGNvbnRlbnQuY291bnRyeSA6IGNvdW50cmllc1swXTtcbi8vICAgICAgICAgY29udGVudCA9IG5ldyBDb250ZW50KCQoJy5kZXNrdG9wLWNvbnRlbnQtY29udGFpbmVyJykpO1xuLy8gICAgICAgICBlbWl0dGVyLmVtaXQoJ2NvdW50cnk6c2VsZWN0ZWQnLCBjb3VudHJ5KTsgICAgICAgIFxuLy8gICAgIH0gZWxzZSB7XG4vLyAgICAgICAgIG1vYmlsZSA9IG5ldyBNb2JpbGUoJCgnLm1vYmlsZSAuY29udGFpbmVyJykpO1xuLy8gICAgIH1cbiAgICBcbi8vICAgICBlbWl0dGVyLm9uKCdzaGFyZTp0d2l0dGVyJywgZnVuY3Rpb24oY291bnRyeSkge1xuLy8gICAgICAgICBzb2NpYWwuc2hhcmVPblR3aXR0ZXIoY291bnRyeSk7XG4vLyAgICAgfSk7XG5cbi8vICAgICBlbWl0dGVyLm9uKCdzaGFyZTpmYWNlYm9vaycsIGZ1bmN0aW9uKGNvdW50cnkpIHtcbi8vICAgICAgICAgc29jaWFsLnNoYXJlT25GYWNlYm9vayhjb3VudHJ5KTtcbi8vICAgICB9KTtcblxuLy8gfTtcblxuLy8gd2luZG93Lm9ucmVzaXplID0gZHJhdztcbi8vIGRyYXcoKTtcblxuLy9cbi8vIGFwcC5qcyBpcyB0aGUgZW50cnkgcG9pbnQgZm9yIHRoZSBlbnRpcmUgY2xpZW50LXNpZGVcbi8vIGFwcGxpY2F0aW9uLiBBbnkgbmVjZXNzYXJ5IHRvcCBsZXZlbCBsaWJyYXJpZXMgc2hvdWxkIGJlXG4vLyByZXF1aXJlZCBoZXJlIChlLmcuIHB5bS5qcyksIGFuZCBpdCBzaG91bGQgYWxzbyBiZVxuLy8gcmVzcG9uc2libGUgZm9yIGluc3RhbnRpYXRpbmcgY29ycmVjdCB2aWV3Y29udHJvbGxlcnMuXG4vL1xuXG5cbiIsIi8qISBiaWdTbGlkZSAtIHYwLjQuMyAtIDIwMTQtMDEtMjVcbiogaHR0cDovL2FzY290dDEuZ2l0aHViLmlvL2JpZ1NsaWRlLmpzL1xuKiBDb3B5cmlnaHQgKGMpIDIwMTQgQWRhbSBELiBTY290dDsgTGljZW5zZWQgTUlUICovXG4oZnVuY3Rpb24oJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgJC5mbi5iaWdTbGlkZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciBzZXR0aW5ncyA9ICQuZXh0ZW5kKHtcbiAgICAgICdtZW51JzogKCcjbWVudScpLFxuICAgICAgJ3B1c2gnOiAoJy5wdXNoJyksXG4gICAgICAnc2lkZSc6ICdsZWZ0JyxcbiAgICAgICdtZW51V2lkdGgnOiAnMTYuNjI1ZW0nLFxuICAgICAgJ21lbnVPZmZzY3JlZW4nOiAnMTIuNjI1ZW0nLFxuICAgICAgJ3NwZWVkJzogJzMwMCdcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHZhciBtZW51TGluayA9IHRoaXMsXG4gICAgICAgIG1lbnUgPSAkKHNldHRpbmdzLm1lbnUpLFxuICAgICAgICBwdXNoID0gJChzZXR0aW5ncy5wdXNoKSxcbiAgICAgICAgd2lkdGggPSBzZXR0aW5ncy5tZW51V2lkdGg7XG5cbiAgICB2YXIgcG9zaXRpb25PZmZTY3JlZW4gPSB7XG4gICAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxuICAgICAgJ3RvcCc6ICcwJyxcbiAgICAgICdib3R0b20nOiAnMCcsXG4gICAgICAnd2lkdGgnOiBzZXR0aW5ncy5tZW51V2lkdGgsXG4gICAgICAnaGVpZ2h0JzogJzEwMCUnXG4gICAgfTtcblxuICAgIHZhciBhbmltYXRlU2xpZGUgPSB7XG4gICAgICAnLXdlYmtpdC10cmFuc2l0aW9uJzogc2V0dGluZ3Muc2lkZSArICcgJyArIHNldHRpbmdzLnNwZWVkICsgJ21zIGVhc2UnLFxuICAgICAgJy1tb3otdHJhbnNpdGlvbic6IHNldHRpbmdzLnNpZGUgKyAnICcgKyBzZXR0aW5ncy5zcGVlZCArICdtcyBlYXNlJyxcbiAgICAgICctbXMtdHJhbnNpdGlvbic6IHNldHRpbmdzLnNpZGUgKyAnICcgKyBzZXR0aW5ncy5zcGVlZCArICdtcyBlYXNlJyxcbiAgICAgICctby10cmFuc2l0aW9uJzogc2V0dGluZ3Muc2lkZSArICcgJyArIHNldHRpbmdzLnNwZWVkICsgJ21zIGVhc2UnLFxuICAgICAgJ3RyYW5zaXRpb24nOiBzZXR0aW5ncy5zaWRlICsgJyAnICsgc2V0dGluZ3Muc3BlZWQgKyAnbXMgZWFzZSdcbiAgICB9O1xuXG4gICAgbWVudS5jc3MocG9zaXRpb25PZmZTY3JlZW4pO1xuICAgIG1lbnUuY3NzKHNldHRpbmdzLnNpZGUsICctJyArIHNldHRpbmdzLm1lbnVPZmZzY3JlZW4pO1xuICAgIHB1c2guY3NzKHNldHRpbmdzLnNpZGUsICcwJyk7XG4gICAgbWVudS5jc3MoYW5pbWF0ZVNsaWRlKTtcbiAgICBwdXNoLmNzcyhhbmltYXRlU2xpZGUpO1xuXG4gICAgbWVudS5fc3RhdGUgPSAnY2xvc2VkJztcblxuICAgIG1lbnUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgbWVudS5fc3RhdGUgPSAnb3Blbic7XG4gICAgICBtZW51LmNzcyhzZXR0aW5ncy5zaWRlLCAnMCcpO1xuICAgICAgcHVzaC5jc3Moc2V0dGluZ3Muc2lkZSwgd2lkdGgpO1xuICAgIH07XG5cbiAgICBtZW51LmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICBtZW51Ll9zdGF0ZSA9ICdjbG9zZWQnO1xuICAgICAgbWVudS5jc3Moc2V0dGluZ3Muc2lkZSwgJy0nICsgc2V0dGluZ3MubWVudU9mZnNjcmVlbik7XG4gICAgICBwdXNoLmNzcyhzZXR0aW5ncy5zaWRlLCAnMCcpO1xuICAgIH07XG5cbiAgICBtZW51TGluay5vbignY2xpY2suYmlnU2xpZGUnLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAobWVudS5fc3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgIG1lbnUub3BlbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVudS5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbWVudUxpbmsub24oJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSl7XG4gICAgICBtZW51TGluay50cmlnZ2VyKCdjbGljay5iaWdTbGlkZScpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1lbnU7XG5cbiAgfTtcblxufShqUXVlcnkpKTsiXX0=
