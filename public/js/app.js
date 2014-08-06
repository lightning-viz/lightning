(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Snap = require('./lib/snap');

var snapper = new Snap({
  element: document.getElementById('content')
});

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



},{"./lib/snap":2}],2:[function(require,module,exports){
/*
 * Snap.js
 *
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/jakiestfu/Snap.js/
 * Version: 1.9.3
 */
/*jslint browser: true*/
/*global define, module, ender*/
(function(win, doc) {
    'use strict';
    var Snap = Snap || function(userOpts) {
        var settings = {
            element: null,
            dragger: null,
            disable: 'none',
            addBodyClasses: true,
            hyperextensible: true,
            resistance: 0.5,
            flickThreshold: 50,
            transitionSpeed: 0.3,
            easing: 'ease',
            maxPosition: 266,
            minPosition: -266,
            tapToClose: true,
            touchToDrag: true,
            slideIntent: 40, // degrees
            minDragDistance: 5
        },
        cache = {
            simpleStates: {
                opening: null,
                towards: null,
                hyperExtending: null,
                halfway: null,
                flick: null,
                translation: {
                    absolute: 0,
                    relative: 0,
                    sinceDirectionChange: 0,
                    percentage: 0
                }
            }
        },
        eventList = {},
        utils = {
            hasTouch: ('ontouchstart' in doc.documentElement || win.navigator.msPointerEnabled),
            eventType: function(action) {
                var eventTypes = {
                        down: (utils.hasTouch ? 'touchstart' : 'mousedown'),
                        move: (utils.hasTouch ? 'touchmove' : 'mousemove'),
                        up: (utils.hasTouch ? 'touchend' : 'mouseup'),
                        out: (utils.hasTouch ? 'touchcancel' : 'mouseout')
                    };
                return eventTypes[action];
            },
            page: function(t, e){
                return (utils.hasTouch && e.touches.length && e.touches[0]) ? e.touches[0]['page'+t] : e['page'+t];
            },
            klass: {
                has: function(el, name){
                    return (el.className).indexOf(name) !== -1;
                },
                add: function(el, name){
                    if(!utils.klass.has(el, name) && settings.addBodyClasses){
                        el.className += " "+name;
                    }
                },
                remove: function(el, name){
                    if(settings.addBodyClasses){
                        el.className = (el.className).replace(name, "").replace(/^\s+|\s+$/g, '');
                    }
                }
            },
            dispatchEvent: function(type) {
                if (typeof eventList[type] === 'function') {
                    return eventList[type].call();
                }
            },
            vendor: function(){
                var tmp = doc.createElement("div"),
                    prefixes = 'webkit Moz O ms'.split(' '),
                    i;
                for (i in prefixes) {
                    if (typeof tmp.style[prefixes[i] + 'Transition'] !== 'undefined') {
                        return prefixes[i];
                    }
                }
            },
            transitionCallback: function(){
                return (cache.vendor==='Moz' || cache.vendor==='ms') ? 'transitionend' : cache.vendor+'TransitionEnd';
            },
            canTransform: function(){
                return typeof settings.element.style[cache.vendor+'Transform'] !== 'undefined';
            },
            deepExtend: function(destination, source) {
                var property;
                for (property in source) {
                    if (source[property] && source[property].constructor && source[property].constructor === Object) {
                        destination[property] = destination[property] || {};
                        utils.deepExtend(destination[property], source[property]);
                    } else {
                        destination[property] = source[property];
                    }
                }
                return destination;
            },
            angleOfDrag: function(x, y) {
                var degrees, theta;
                // Calc Theta
                theta = Math.atan2(-(cache.startDragY - y), (cache.startDragX - x));
                if (theta < 0) {
                    theta += 2 * Math.PI;
                }
                // Calc Degrees
                degrees = Math.floor(theta * (180 / Math.PI) - 180);
                if (degrees < 0 && degrees > -180) {
                    degrees = 360 - Math.abs(degrees);
                }
                return Math.abs(degrees);
            },
            events: {
                addEvent: function addEvent(element, eventName, func) {
                    if (element.addEventListener) {
                        return element.addEventListener(eventName, func, false);
                    } else if (element.attachEvent) {
                        return element.attachEvent("on" + eventName, func);
                    }
                },
                removeEvent: function addEvent(element, eventName, func) {
                    if (element.addEventListener) {
                        return element.removeEventListener(eventName, func, false);
                    } else if (element.attachEvent) {
                        return element.detachEvent("on" + eventName, func);
                    }
                },
                prevent: function(e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                }
            },
            parentUntil: function(el, attr) {
                var isStr = typeof attr === 'string';
                while (el.parentNode) {
                    if (isStr && el.getAttribute && el.getAttribute(attr)){
                        return el;
                    } else if(!isStr && el === attr){
                        return el;
                    }
                    el = el.parentNode;
                }
                return null;
            }
        },
        action = {
            translate: {
                get: {
                    matrix: function(index) {

                        if( !utils.canTransform() ){
                            return parseInt(settings.element.style.left, 10);
                        } else {
                            var matrix = win.getComputedStyle(settings.element)[cache.vendor+'Transform'].match(/\((.*)\)/),
                                ieOffset = 8;
                            if (matrix) {
                                matrix = matrix[1].split(',');
                                if(matrix.length===16){
                                    index+=ieOffset;
                                }
                                return parseInt(matrix[index], 10);
                            }
                            return 0;
                        }
                    }
                },
                easeCallback: function(){
                    settings.element.style[cache.vendor+'Transition'] = '';
                    cache.translation = action.translate.get.matrix(4);
                    cache.easing = false;
                    clearInterval(cache.animatingInterval);

                    if(cache.easingTo===0){
                        utils.klass.remove(doc.body, 'snapjs-right');
                        utils.klass.remove(doc.body, 'snapjs-left');
                    }

                    utils.dispatchEvent('animated');
                    utils.events.removeEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
                },
                easeTo: function(n) {

                    if( !utils.canTransform() ){
                        cache.translation = n;
                        action.translate.x(n);
                    } else {
                        cache.easing = true;
                        cache.easingTo = n;

                        settings.element.style[cache.vendor+'Transition'] = 'all ' + settings.transitionSpeed + 's ' + settings.easing;

                        cache.animatingInterval = setInterval(function() {
                            utils.dispatchEvent('animating');
                        }, 1);
                        
                        utils.events.addEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
                        action.translate.x(n);
                    }
                    if(n===0){
                           settings.element.style[cache.vendor+'Transform'] = '';
                       }
                },
                x: function(n) {
                    if( (settings.disable==='left' && n>0) ||
                        (settings.disable==='right' && n<0)
                    ){ return; }
                    
                    if( !settings.hyperextensible ){
                        if( n===settings.maxPosition || n>settings.maxPosition ){
                            n=settings.maxPosition;
                        } else if( n===settings.minPosition || n<settings.minPosition ){
                            n=settings.minPosition;
                        }
                    }
                    
                    n = parseInt(n, 10);
                    if(isNaN(n)){
                        n = 0;
                    }

                    if( utils.canTransform() ){
                        var theTranslate = 'translate3d(' + n + 'px, 0,0)';
                        settings.element.style[cache.vendor+'Transform'] = theTranslate;
                    } else {
                        settings.element.style.width = (win.innerWidth || doc.documentElement.clientWidth)+'px';

                        settings.element.style.left = n+'px';
                        settings.element.style.right = '';
                    }
                }
            },
            drag: {
                listen: function() {
                    cache.translation = 0;
                    cache.easing = false;
                    utils.events.addEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
                    utils.events.addEvent(settings.element, utils.eventType('move'), action.drag.dragging);
                    utils.events.addEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
                },
                stopListening: function() {
                    utils.events.removeEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
                    utils.events.removeEvent(settings.element, utils.eventType('move'), action.drag.dragging);
                    utils.events.removeEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
                },
                startDrag: function(e) {
                    // No drag on ignored elements
                    var target = e.target ? e.target : e.srcElement,
                        ignoreParent = utils.parentUntil(target, 'data-snap-ignore');
                    
                    if (ignoreParent) {
                        utils.dispatchEvent('ignore');
                        return;
                    }
                    
                    
                    if(settings.dragger){
                        var dragParent = utils.parentUntil(target, settings.dragger);
                        
                        // Only use dragger if we're in a closed state
                        if( !dragParent && 
                            (cache.translation !== settings.minPosition && 
                            cache.translation !== settings.maxPosition
                        )){
                            return;
                        }
                    }
                    
                    utils.dispatchEvent('start');
                    settings.element.style[cache.vendor+'Transition'] = '';
                    cache.isDragging = true;
                    cache.hasIntent = null;
                    cache.intentChecked = false;
                    cache.startDragX = utils.page('X', e);
                    cache.startDragY = utils.page('Y', e);
                    cache.dragWatchers = {
                        current: 0,
                        last: 0,
                        hold: 0,
                        state: ''
                    };
                    cache.simpleStates = {
                        opening: null,
                        towards: null,
                        hyperExtending: null,
                        halfway: null,
                        flick: null,
                        translation: {
                            absolute: 0,
                            relative: 0,
                            sinceDirectionChange: 0,
                            percentage: 0
                        }
                    };
                },
                dragging: function(e) {
                    if (cache.isDragging && settings.touchToDrag) {

                        var thePageX = utils.page('X', e),
                            thePageY = utils.page('Y', e),
                            translated = cache.translation,
                            absoluteTranslation = action.translate.get.matrix(4),
                            whileDragX = thePageX - cache.startDragX,
                            openingLeft = absoluteTranslation > 0,
                            translateTo = whileDragX,
                            diff;

                        // Shown no intent already
                        if((cache.intentChecked && !cache.hasIntent)){
                            return;
                        }

                        if(settings.addBodyClasses){
                            if((absoluteTranslation)>0){
                                utils.klass.add(doc.body, 'snapjs-left');
                                utils.klass.remove(doc.body, 'snapjs-right');
                            } else if((absoluteTranslation)<0){
                                utils.klass.add(doc.body, 'snapjs-right');
                                utils.klass.remove(doc.body, 'snapjs-left');
                            }
                        }

                        if (cache.hasIntent === false || cache.hasIntent === null) {
                            var deg = utils.angleOfDrag(thePageX, thePageY),
                                inRightRange = (deg >= 0 && deg <= settings.slideIntent) || (deg <= 360 && deg > (360 - settings.slideIntent)),
                                inLeftRange = (deg >= 180 && deg <= (180 + settings.slideIntent)) || (deg <= 180 && deg >= (180 - settings.slideIntent));
                            if (!inLeftRange && !inRightRange) {
                                cache.hasIntent = false;
                            } else {
                                cache.hasIntent = true;
                            }
                            cache.intentChecked = true;
                        }

                        if (
                            (settings.minDragDistance>=Math.abs(thePageX-cache.startDragX)) || // Has user met minimum drag distance?
                            (cache.hasIntent === false)
                        ) {
                            return;
                        }

                        utils.events.prevent(e);
                        utils.dispatchEvent('drag');

                        cache.dragWatchers.current = thePageX;
                        // Determine which direction we are going
                        if (cache.dragWatchers.last > thePageX) {
                            if (cache.dragWatchers.state !== 'left') {
                                cache.dragWatchers.state = 'left';
                                cache.dragWatchers.hold = thePageX;
                            }
                            cache.dragWatchers.last = thePageX;
                        } else if (cache.dragWatchers.last < thePageX) {
                            if (cache.dragWatchers.state !== 'right') {
                                cache.dragWatchers.state = 'right';
                                cache.dragWatchers.hold = thePageX;
                            }
                            cache.dragWatchers.last = thePageX;
                        }
                        if (openingLeft) {
                            // Pulling too far to the right
                            if (settings.maxPosition < absoluteTranslation) {
                                diff = (absoluteTranslation - settings.maxPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                            cache.simpleStates = {
                                opening: 'left',
                                towards: cache.dragWatchers.state,
                                hyperExtending: settings.maxPosition < absoluteTranslation,
                                halfway: absoluteTranslation > (settings.maxPosition / 2),
                                flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                                translation: {
                                    absolute: absoluteTranslation,
                                    relative: whileDragX,
                                    sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                                    percentage: (absoluteTranslation/settings.maxPosition)*100
                                }
                            };
                        } else {
                            // Pulling too far to the left
                            if (settings.minPosition > absoluteTranslation) {
                                diff = (absoluteTranslation - settings.minPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                            cache.simpleStates = {
                                opening: 'right',
                                towards: cache.dragWatchers.state,
                                hyperExtending: settings.minPosition > absoluteTranslation,
                                halfway: absoluteTranslation < (settings.minPosition / 2),
                                flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                                translation: {
                                    absolute: absoluteTranslation,
                                    relative: whileDragX,
                                    sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                                    percentage: (absoluteTranslation/settings.minPosition)*100
                                }
                            };
                        }
                        action.translate.x(translateTo + translated);
                    }
                },
                endDrag: function(e) {
                    if (cache.isDragging) {
                        utils.dispatchEvent('end');
                        var translated = action.translate.get.matrix(4);

                        // Tap Close
                        if (cache.dragWatchers.current === 0 && translated !== 0 && settings.tapToClose) {
                            utils.dispatchEvent('close');
                            utils.events.prevent(e);
                            action.translate.easeTo(0);
                            cache.isDragging = false;
                            cache.startDragX = 0;
                            return;
                        }

                        // Revealing Left
                        if (cache.simpleStates.opening === 'left') {
                            // Halfway, Flicking, or Too Far Out
                            if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                                if (cache.simpleStates.flick && cache.simpleStates.towards === 'left') { // Flicking Closed
                                    action.translate.easeTo(0);
                                } else if (
                                    (cache.simpleStates.flick && cache.simpleStates.towards === 'right') || // Flicking Open OR
                                    (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                                ) {
                                    action.translate.easeTo(settings.maxPosition); // Open Left
                                }
                            } else {
                                action.translate.easeTo(0); // Close Left
                            }
                            // Revealing Right
                        } else if (cache.simpleStates.opening === 'right') {
                            // Halfway, Flicking, or Too Far Out
                            if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                                if (cache.simpleStates.flick && cache.simpleStates.towards === 'right') { // Flicking Closed
                                    action.translate.easeTo(0);
                                } else if (
                                    (cache.simpleStates.flick && cache.simpleStates.towards === 'left') || // Flicking Open OR
                                    (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                                ) {
                                    action.translate.easeTo(settings.minPosition); // Open Right
                                }
                            } else {
                                action.translate.easeTo(0); // Close Right
                            }
                        }
                        cache.isDragging = false;
                        cache.startDragX = utils.page('X', e);
                    }
                }
            }
        },
        init = function(opts) {
            if (opts.element) {
                utils.deepExtend(settings, opts);
                cache.vendor = utils.vendor();
                action.drag.listen();
            }
        };
        /*
         * Public
         */
        this.open = function(side) {
            utils.dispatchEvent('open');
            utils.klass.remove(doc.body, 'snapjs-expand-left');
            utils.klass.remove(doc.body, 'snapjs-expand-right');

            if (side === 'left') {
                cache.simpleStates.opening = 'left';
                cache.simpleStates.towards = 'right';
                utils.klass.add(doc.body, 'snapjs-left');
                utils.klass.remove(doc.body, 'snapjs-right');
                action.translate.easeTo(settings.maxPosition);
            } else if (side === 'right') {
                cache.simpleStates.opening = 'right';
                cache.simpleStates.towards = 'left';
                utils.klass.remove(doc.body, 'snapjs-left');
                utils.klass.add(doc.body, 'snapjs-right');
                action.translate.easeTo(settings.minPosition);
            }
        };
        this.close = function() {
            utils.dispatchEvent('close');
            action.translate.easeTo(0);
        };
        this.expand = function(side){
            var to = win.innerWidth || doc.documentElement.clientWidth;

            if(side==='left'){
                utils.dispatchEvent('expandLeft');
                utils.klass.add(doc.body, 'snapjs-expand-left');
                utils.klass.remove(doc.body, 'snapjs-expand-right');
            } else {
                utils.dispatchEvent('expandRight');
                utils.klass.add(doc.body, 'snapjs-expand-right');
                utils.klass.remove(doc.body, 'snapjs-expand-left');
                to *= -1;
            }
            action.translate.easeTo(to);
        };

        this.on = function(evt, fn) {
            eventList[evt] = fn;
            return this;
        };
        this.off = function(evt) {
            if (eventList[evt]) {
                eventList[evt] = false;
            }
        };

        this.enable = function() {
            utils.dispatchEvent('enable');
            action.drag.listen();
        };
        this.disable = function() {
            utils.dispatchEvent('disable');
            action.drag.stopListening();
        };

        this.settings = function(opts){
            utils.deepExtend(settings, opts);
        };

        this.state = function() {
            var state,
                fromLeft = action.translate.get.matrix(4);
            if (fromLeft === settings.maxPosition) {
                state = 'left';
            } else if (fromLeft === settings.minPosition) {
                state = 'right';
            } else {
                state = 'closed';
            }
            return {
                state: state,
                info: cache.simpleStates
            };
        };
        init(userOpts);
    };
    if ((typeof module !== 'undefined') && module.exports) {
        module.exports = Snap;
    }
    if (typeof ender === 'undefined') {
        this.Snap = Snap;
    }
    if ((typeof define === "function") && define.amd) {
        define("snap", [], function() {
            return Snap;
        });
    }
}).call(this, window, document);
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXRoaXNvbmlhbi9wcm9qZWN0cy9saWdodG5pbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21hdGhpc29uaWFuL3Byb2plY3RzL2xpZ2h0bmluZy91aS9qcy9mYWtlXzdlNzNlMzczLmpzIiwiL1VzZXJzL21hdGhpc29uaWFuL3Byb2plY3RzL2xpZ2h0bmluZy91aS9qcy9saWIvc25hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU25hcCA9IHJlcXVpcmUoJy4vbGliL3NuYXAnKTtcblxudmFyIHNuYXBwZXIgPSBuZXcgU25hcCh7XG4gIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50Jylcbn0pO1xuXG4vLyB2YXIgY291bnRyaWVzID0gcmVxdWlyZSgnLi9kYXRhL2NvdW50cmllcycpO1xuLy8gdmFyIFNpZGViYXIgPSByZXF1aXJlKCcuL3ZpZXdzL3NpZGViYXInKTtcbi8vIHZhciBDb250ZW50ID0gcmVxdWlyZSgnLi92aWV3cy9jb250ZW50Jyk7XG4vLyB2YXIgTW9iaWxlID0gcmVxdWlyZSgnLi92aWV3cy9tb2JpbGUnKTtcbi8vIHZhciBlbWl0dGVyID0gcmVxdWlyZSgnLi9lbWl0dGVyJyk7XG4vLyB2YXIgc29jaWFsID0gcmVxdWlyZSgnLi9zb2NpYWwnKTtcblxuLy8gLy8gdmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLy8gdmFyIE1PQklMRV9CUkVBS1BPSU5UID0gNzYwO1xuLy8gdmFyIGNvbnRlbnQgPSBudWxsO1xuLy8gdmFyIG1vYmlsZSA9IG51bGw7XG4vLyB2YXIgc2lkZWJhciA9IG51bGw7XG4vLyB2YXIgJHNpZGViYXJFbCA9ICQoJy5zaWRlYmFyJyk7XG5cbi8vIHZhciBkcmF3ID0gZnVuY3Rpb24oKSB7XG4vLyAgICAgZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblxuLy8gICAgIGlmKHNpZGViYXIpIHtcbi8vICAgICAgICAgc2lkZWJhci5kZXN0cm95KCk7XG4vLyAgICAgfVxuLy8gICAgIGlmKG1vYmlsZSkge1xuLy8gICAgICAgICBtb2JpbGUuZGVzdHJveSgpO1xuLy8gICAgIH1cblxuLy8gICAgIGlmKCQod2luZG93KS53aWR0aCgpID4gTU9CSUxFX0JSRUFLUE9JTlQpIHtcblxuLy8gICAgICAgICBzaWRlYmFyID0gbmV3IFNpZGViYXIoJHNpZGViYXJFbCk7XG4gICAgICAgXG4vLyAgICAgICAgIHZhciBjb3VudHJ5ID0gKGNvbnRlbnQpID8gY29udGVudC5jb3VudHJ5IDogY291bnRyaWVzWzBdO1xuLy8gICAgICAgICBjb250ZW50ID0gbmV3IENvbnRlbnQoJCgnLmRlc2t0b3AtY29udGVudC1jb250YWluZXInKSk7XG4vLyAgICAgICAgIGVtaXR0ZXIuZW1pdCgnY291bnRyeTpzZWxlY3RlZCcsIGNvdW50cnkpOyAgICAgICAgXG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgbW9iaWxlID0gbmV3IE1vYmlsZSgkKCcubW9iaWxlIC5jb250YWluZXInKSk7XG4vLyAgICAgfVxuICAgIFxuLy8gICAgIGVtaXR0ZXIub24oJ3NoYXJlOnR3aXR0ZXInLCBmdW5jdGlvbihjb3VudHJ5KSB7XG4vLyAgICAgICAgIHNvY2lhbC5zaGFyZU9uVHdpdHRlcihjb3VudHJ5KTtcbi8vICAgICB9KTtcblxuLy8gICAgIGVtaXR0ZXIub24oJ3NoYXJlOmZhY2Vib29rJywgZnVuY3Rpb24oY291bnRyeSkge1xuLy8gICAgICAgICBzb2NpYWwuc2hhcmVPbkZhY2Vib29rKGNvdW50cnkpO1xuLy8gICAgIH0pO1xuXG4vLyB9O1xuXG4vLyB3aW5kb3cub25yZXNpemUgPSBkcmF3O1xuLy8gZHJhdygpO1xuXG4vL1xuLy8gYXBwLmpzIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgdGhlIGVudGlyZSBjbGllbnQtc2lkZVxuLy8gYXBwbGljYXRpb24uIEFueSBuZWNlc3NhcnkgdG9wIGxldmVsIGxpYnJhcmllcyBzaG91bGQgYmVcbi8vIHJlcXVpcmVkIGhlcmUgKGUuZy4gcHltLmpzKSwgYW5kIGl0IHNob3VsZCBhbHNvIGJlXG4vLyByZXNwb25zaWJsZSBmb3IgaW5zdGFudGlhdGluZyBjb3JyZWN0IHZpZXdjb250cm9sbGVycy5cbi8vXG5cblxuIiwiLypcbiAqIFNuYXAuanNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMywgSmFjb2IgS2VsbGV5IC0gaHR0cDovL2pha2llc3RmdS5jb20vXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2VuY2VcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqXG4gKiBHaXRodWI6ICBodHRwOi8vZ2l0aHViLmNvbS9qYWtpZXN0ZnUvU25hcC5qcy9cbiAqIFZlcnNpb246IDEuOS4zXG4gKi9cbi8qanNsaW50IGJyb3dzZXI6IHRydWUqL1xuLypnbG9iYWwgZGVmaW5lLCBtb2R1bGUsIGVuZGVyKi9cbihmdW5jdGlvbih3aW4sIGRvYykge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICB2YXIgU25hcCA9IFNuYXAgfHwgZnVuY3Rpb24odXNlck9wdHMpIHtcbiAgICAgICAgdmFyIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgZWxlbWVudDogbnVsbCxcbiAgICAgICAgICAgIGRyYWdnZXI6IG51bGwsXG4gICAgICAgICAgICBkaXNhYmxlOiAnbm9uZScsXG4gICAgICAgICAgICBhZGRCb2R5Q2xhc3NlczogdHJ1ZSxcbiAgICAgICAgICAgIGh5cGVyZXh0ZW5zaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHJlc2lzdGFuY2U6IDAuNSxcbiAgICAgICAgICAgIGZsaWNrVGhyZXNob2xkOiA1MCxcbiAgICAgICAgICAgIHRyYW5zaXRpb25TcGVlZDogMC4zLFxuICAgICAgICAgICAgZWFzaW5nOiAnZWFzZScsXG4gICAgICAgICAgICBtYXhQb3NpdGlvbjogMjY2LFxuICAgICAgICAgICAgbWluUG9zaXRpb246IC0yNjYsXG4gICAgICAgICAgICB0YXBUb0Nsb3NlOiB0cnVlLFxuICAgICAgICAgICAgdG91Y2hUb0RyYWc6IHRydWUsXG4gICAgICAgICAgICBzbGlkZUludGVudDogNDAsIC8vIGRlZ3JlZXNcbiAgICAgICAgICAgIG1pbkRyYWdEaXN0YW5jZTogNVxuICAgICAgICB9LFxuICAgICAgICBjYWNoZSA9IHtcbiAgICAgICAgICAgIHNpbXBsZVN0YXRlczoge1xuICAgICAgICAgICAgICAgIG9wZW5pbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgdG93YXJkczogbnVsbCxcbiAgICAgICAgICAgICAgICBoeXBlckV4dGVuZGluZzogbnVsbCxcbiAgICAgICAgICAgICAgICBoYWxmd2F5OiBudWxsLFxuICAgICAgICAgICAgICAgIGZsaWNrOiBudWxsLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGFic29sdXRlOiAwLFxuICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgc2luY2VEaXJlY3Rpb25DaGFuZ2U6IDAsXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IDBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50TGlzdCA9IHt9LFxuICAgICAgICB1dGlscyA9IHtcbiAgICAgICAgICAgIGhhc1RvdWNoOiAoJ29udG91Y2hzdGFydCcgaW4gZG9jLmRvY3VtZW50RWxlbWVudCB8fCB3aW4ubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQpLFxuICAgICAgICAgICAgZXZlbnRUeXBlOiBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRUeXBlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvd246ICh1dGlscy5oYXNUb3VjaCA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmU6ICh1dGlscy5oYXNUb3VjaCA/ICd0b3VjaG1vdmUnIDogJ21vdXNlbW92ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXA6ICh1dGlscy5oYXNUb3VjaCA/ICd0b3VjaGVuZCcgOiAnbW91c2V1cCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0OiAodXRpbHMuaGFzVG91Y2ggPyAndG91Y2hjYW5jZWwnIDogJ21vdXNlb3V0JylcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnRUeXBlc1thY3Rpb25dO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhZ2U6IGZ1bmN0aW9uKHQsIGUpe1xuICAgICAgICAgICAgICAgIHJldHVybiAodXRpbHMuaGFzVG91Y2ggJiYgZS50b3VjaGVzLmxlbmd0aCAmJiBlLnRvdWNoZXNbMF0pID8gZS50b3VjaGVzWzBdWydwYWdlJyt0XSA6IGVbJ3BhZ2UnK3RdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtsYXNzOiB7XG4gICAgICAgICAgICAgICAgaGFzOiBmdW5jdGlvbihlbCwgbmFtZSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoZWwuY2xhc3NOYW1lKS5pbmRleE9mKG5hbWUpICE9PSAtMTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFkZDogZnVuY3Rpb24oZWwsIG5hbWUpe1xuICAgICAgICAgICAgICAgICAgICBpZighdXRpbHMua2xhc3MuaGFzKGVsLCBuYW1lKSAmJiBzZXR0aW5ncy5hZGRCb2R5Q2xhc3Nlcyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc05hbWUgKz0gXCIgXCIrbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihlbCwgbmFtZSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKHNldHRpbmdzLmFkZEJvZHlDbGFzc2VzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTmFtZSA9IChlbC5jbGFzc05hbWUpLnJlcGxhY2UobmFtZSwgXCJcIikucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50TGlzdFt0eXBlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnRMaXN0W3R5cGVdLmNhbGwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdmVuZG9yOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBkb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgcHJlZml4ZXMgPSAnd2Via2l0IE1veiBPIG1zJy5zcGxpdCgnICcpLFxuICAgICAgICAgICAgICAgICAgICBpO1xuICAgICAgICAgICAgICAgIGZvciAoaSBpbiBwcmVmaXhlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRtcC5zdHlsZVtwcmVmaXhlc1tpXSArICdUcmFuc2l0aW9uJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJhbnNpdGlvbkNhbGxiYWNrOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJldHVybiAoY2FjaGUudmVuZG9yPT09J01veicgfHwgY2FjaGUudmVuZG9yPT09J21zJykgPyAndHJhbnNpdGlvbmVuZCcgOiBjYWNoZS52ZW5kb3IrJ1RyYW5zaXRpb25FbmQnO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhblRyYW5zZm9ybTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHNldHRpbmdzLmVsZW1lbnQuc3R5bGVbY2FjaGUudmVuZG9yKydUcmFuc2Zvcm0nXSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVlcEV4dGVuZDogZnVuY3Rpb24oZGVzdGluYXRpb24sIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wZXJ0eTtcbiAgICAgICAgICAgICAgICBmb3IgKHByb3BlcnR5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlW3Byb3BlcnR5XSAmJiBzb3VyY2VbcHJvcGVydHldLmNvbnN0cnVjdG9yICYmIHNvdXJjZVtwcm9wZXJ0eV0uY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb25bcHJvcGVydHldID0gZGVzdGluYXRpb25bcHJvcGVydHldIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMuZGVlcEV4dGVuZChkZXN0aW5hdGlvbltwcm9wZXJ0eV0sIHNvdXJjZVtwcm9wZXJ0eV0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb25bcHJvcGVydHldID0gc291cmNlW3Byb3BlcnR5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5nbGVPZkRyYWc6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVncmVlcywgdGhldGE7XG4gICAgICAgICAgICAgICAgLy8gQ2FsYyBUaGV0YVxuICAgICAgICAgICAgICAgIHRoZXRhID0gTWF0aC5hdGFuMigtKGNhY2hlLnN0YXJ0RHJhZ1kgLSB5KSwgKGNhY2hlLnN0YXJ0RHJhZ1ggLSB4KSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoZXRhIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGV0YSArPSAyICogTWF0aC5QSTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ2FsYyBEZWdyZWVzXG4gICAgICAgICAgICAgICAgZGVncmVlcyA9IE1hdGguZmxvb3IodGhldGEgKiAoMTgwIC8gTWF0aC5QSSkgLSAxODApO1xuICAgICAgICAgICAgICAgIGlmIChkZWdyZWVzIDwgMCAmJiBkZWdyZWVzID4gLTE4MCkge1xuICAgICAgICAgICAgICAgICAgICBkZWdyZWVzID0gMzYwIC0gTWF0aC5hYnMoZGVncmVlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyhkZWdyZWVzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICAgICBhZGRFdmVudDogZnVuY3Rpb24gYWRkRXZlbnQoZWxlbWVudCwgZXZlbnROYW1lLCBmdW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmdW5jLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBmdW5jKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnQ6IGZ1bmN0aW9uIGFkZEV2ZW50KGVsZW1lbnQsIGV2ZW50TmFtZSwgZnVuYykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZnVuYywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmRldGFjaEV2ZW50KFwib25cIiArIGV2ZW50TmFtZSwgZnVuYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHByZXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJlbnRVbnRpbDogZnVuY3Rpb24oZWwsIGF0dHIpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXNTdHIgPSB0eXBlb2YgYXR0ciA9PT0gJ3N0cmluZyc7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RyICYmIGVsLmdldEF0dHJpYnV0ZSAmJiBlbC5nZXRBdHRyaWJ1dGUoYXR0cikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIWlzU3RyICYmIGVsID09PSBhdHRyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBhY3Rpb24gPSB7XG4gICAgICAgICAgICB0cmFuc2xhdGU6IHtcbiAgICAgICAgICAgICAgICBnZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4OiBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggIXV0aWxzLmNhblRyYW5zZm9ybSgpICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHNldHRpbmdzLmVsZW1lbnQuc3R5bGUubGVmdCwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWF0cml4ID0gd2luLmdldENvbXB1dGVkU3R5bGUoc2V0dGluZ3MuZWxlbWVudClbY2FjaGUudmVuZG9yKydUcmFuc2Zvcm0nXS5tYXRjaCgvXFwoKC4qKVxcKS8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZU9mZnNldCA9IDg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdHJpeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXggPSBtYXRyaXhbMV0uc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYobWF0cml4Lmxlbmd0aD09PTE2KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kz1pZU9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQobWF0cml4W2luZGV4XSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZWFzZUNhbGxiYWNrOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5lbGVtZW50LnN0eWxlW2NhY2hlLnZlbmRvcisnVHJhbnNpdGlvbiddID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLnRyYW5zbGF0aW9uID0gYWN0aW9uLnRyYW5zbGF0ZS5nZXQubWF0cml4KDQpO1xuICAgICAgICAgICAgICAgICAgICBjYWNoZS5lYXNpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjYWNoZS5hbmltYXRpbmdJbnRlcnZhbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoY2FjaGUuZWFzaW5nVG89PT0wKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLnJlbW92ZShkb2MuYm9keSwgJ3NuYXBqcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMua2xhc3MucmVtb3ZlKGRvYy5ib2R5LCAnc25hcGpzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQoJ2FuaW1hdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzLmV2ZW50cy5yZW1vdmVFdmVudChzZXR0aW5ncy5lbGVtZW50LCB1dGlscy50cmFuc2l0aW9uQ2FsbGJhY2soKSwgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZWFzZVRvOiBmdW5jdGlvbihuKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoICF1dGlscy5jYW5UcmFuc2Zvcm0oKSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUudHJhbnNsYXRpb24gPSBuO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS54KG4pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuZWFzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmVhc2luZ1RvID0gbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuZWxlbWVudC5zdHlsZVtjYWNoZS52ZW5kb3IrJ1RyYW5zaXRpb24nXSA9ICdhbGwgJyArIHNldHRpbmdzLnRyYW5zaXRpb25TcGVlZCArICdzICcgKyBzZXR0aW5ncy5lYXNpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmFuaW1hdGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCgnYW5pbWF0aW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLmFkZEV2ZW50KHNldHRpbmdzLmVsZW1lbnQsIHV0aWxzLnRyYW5zaXRpb25DYWxsYmFjaygpLCBhY3Rpb24udHJhbnNsYXRlLmVhc2VDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24udHJhbnNsYXRlLngobik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYobj09PTApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuZWxlbWVudC5zdHlsZVtjYWNoZS52ZW5kb3IrJ1RyYW5zZm9ybSddID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHg6IGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIChzZXR0aW5ncy5kaXNhYmxlPT09J2xlZnQnICYmIG4+MCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChzZXR0aW5ncy5kaXNhYmxlPT09J3JpZ2h0JyAmJiBuPDApXG4gICAgICAgICAgICAgICAgICAgICl7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoICFzZXR0aW5ncy5oeXBlcmV4dGVuc2libGUgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBuPT09c2V0dGluZ3MubWF4UG9zaXRpb24gfHwgbj5zZXR0aW5ncy5tYXhQb3NpdGlvbiApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG49c2V0dGluZ3MubWF4UG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIG49PT1zZXR0aW5ncy5taW5Qb3NpdGlvbiB8fCBuPHNldHRpbmdzLm1pblBvc2l0aW9uICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbj1zZXR0aW5ncy5taW5Qb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbiA9IHBhcnNlSW50KG4sIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoaXNOYU4obikpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiggdXRpbHMuY2FuVHJhbnNmb3JtKCkgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGVUcmFuc2xhdGUgPSAndHJhbnNsYXRlM2QoJyArIG4gKyAncHgsIDAsMCknO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuZWxlbWVudC5zdHlsZVtjYWNoZS52ZW5kb3IrJ1RyYW5zZm9ybSddID0gdGhlVHJhbnNsYXRlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuZWxlbWVudC5zdHlsZS53aWR0aCA9ICh3aW4uaW5uZXJXaWR0aCB8fCBkb2MuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSsncHgnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5lbGVtZW50LnN0eWxlLmxlZnQgPSBuKydweCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5lbGVtZW50LnN0eWxlLnJpZ2h0ID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZHJhZzoge1xuICAgICAgICAgICAgICAgIGxpc3RlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLnRyYW5zbGF0aW9uID0gMDtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuZWFzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzLmV2ZW50cy5hZGRFdmVudChzZXR0aW5ncy5lbGVtZW50LCB1dGlscy5ldmVudFR5cGUoJ2Rvd24nKSwgYWN0aW9uLmRyYWcuc3RhcnREcmFnKTtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLmFkZEV2ZW50KHNldHRpbmdzLmVsZW1lbnQsIHV0aWxzLmV2ZW50VHlwZSgnbW92ZScpLCBhY3Rpb24uZHJhZy5kcmFnZ2luZyk7XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzLmV2ZW50cy5hZGRFdmVudChzZXR0aW5ncy5lbGVtZW50LCB1dGlscy5ldmVudFR5cGUoJ3VwJyksIGFjdGlvbi5kcmFnLmVuZERyYWcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RvcExpc3RlbmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzLmV2ZW50cy5yZW1vdmVFdmVudChzZXR0aW5ncy5lbGVtZW50LCB1dGlscy5ldmVudFR5cGUoJ2Rvd24nKSwgYWN0aW9uLmRyYWcuc3RhcnREcmFnKTtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLnJlbW92ZUV2ZW50KHNldHRpbmdzLmVsZW1lbnQsIHV0aWxzLmV2ZW50VHlwZSgnbW92ZScpLCBhY3Rpb24uZHJhZy5kcmFnZ2luZyk7XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzLmV2ZW50cy5yZW1vdmVFdmVudChzZXR0aW5ncy5lbGVtZW50LCB1dGlscy5ldmVudFR5cGUoJ3VwJyksIGFjdGlvbi5kcmFnLmVuZERyYWcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RhcnREcmFnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGRyYWcgb24gaWdub3JlZCBlbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQgPyBlLnRhcmdldCA6IGUuc3JjRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlnbm9yZVBhcmVudCA9IHV0aWxzLnBhcmVudFVudGlsKHRhcmdldCwgJ2RhdGEtc25hcC1pZ25vcmUnKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChpZ25vcmVQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQoJ2lnbm9yZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoc2V0dGluZ3MuZHJhZ2dlcil7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHJhZ1BhcmVudCA9IHV0aWxzLnBhcmVudFVudGlsKHRhcmdldCwgc2V0dGluZ3MuZHJhZ2dlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgdXNlIGRyYWdnZXIgaWYgd2UncmUgaW4gYSBjbG9zZWQgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCAhZHJhZ1BhcmVudCAmJiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2FjaGUudHJhbnNsYXRpb24gIT09IHNldHRpbmdzLm1pblBvc2l0aW9uICYmIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLnRyYW5zbGF0aW9uICE9PSBzZXR0aW5ncy5tYXhQb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdzdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5lbGVtZW50LnN0eWxlW2NhY2hlLnZlbmRvcisnVHJhbnNpdGlvbiddID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLmlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBjYWNoZS5oYXNJbnRlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBjYWNoZS5pbnRlbnRDaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLnN0YXJ0RHJhZ1ggPSB1dGlscy5wYWdlKCdYJywgZSk7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLnN0YXJ0RHJhZ1kgPSB1dGlscy5wYWdlKCdZJywgZSk7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLmRyYWdXYXRjaGVycyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBjYWNoZS5zaW1wbGVTdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuaW5nOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG93YXJkczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGh5cGVyRXh0ZW5kaW5nOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFsZndheTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsaWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYnNvbHV0ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW5jZURpcmVjdGlvbkNoYW5nZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkcmFnZ2luZzogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGUuaXNEcmFnZ2luZyAmJiBzZXR0aW5ncy50b3VjaFRvRHJhZykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhlUGFnZVggPSB1dGlscy5wYWdlKCdYJywgZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlUGFnZVkgPSB1dGlscy5wYWdlKCdZJywgZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlZCA9IGNhY2hlLnRyYW5zbGF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFic29sdXRlVHJhbnNsYXRpb24gPSBhY3Rpb24udHJhbnNsYXRlLmdldC5tYXRyaXgoNCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGVEcmFnWCA9IHRoZVBhZ2VYIC0gY2FjaGUuc3RhcnREcmFnWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuaW5nTGVmdCA9IGFic29sdXRlVHJhbnNsYXRpb24gPiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVRvID0gd2hpbGVEcmFnWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTaG93biBubyBpbnRlbnQgYWxyZWFkeVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoKGNhY2hlLmludGVudENoZWNrZWQgJiYgIWNhY2hlLmhhc0ludGVudCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2V0dGluZ3MuYWRkQm9keUNsYXNzZXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKChhYnNvbHV0ZVRyYW5zbGF0aW9uKT4wKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMua2xhc3MuYWRkKGRvYy5ib2R5LCAnc25hcGpzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMua2xhc3MucmVtb3ZlKGRvYy5ib2R5LCAnc25hcGpzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKChhYnNvbHV0ZVRyYW5zbGF0aW9uKTwwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMua2xhc3MuYWRkKGRvYy5ib2R5LCAnc25hcGpzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLnJlbW92ZShkb2MuYm9keSwgJ3NuYXBqcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGUuaGFzSW50ZW50ID09PSBmYWxzZSB8fCBjYWNoZS5oYXNJbnRlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVnID0gdXRpbHMuYW5nbGVPZkRyYWcodGhlUGFnZVgsIHRoZVBhZ2VZKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5SaWdodFJhbmdlID0gKGRlZyA+PSAwICYmIGRlZyA8PSBzZXR0aW5ncy5zbGlkZUludGVudCkgfHwgKGRlZyA8PSAzNjAgJiYgZGVnID4gKDM2MCAtIHNldHRpbmdzLnNsaWRlSW50ZW50KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluTGVmdFJhbmdlID0gKGRlZyA+PSAxODAgJiYgZGVnIDw9ICgxODAgKyBzZXR0aW5ncy5zbGlkZUludGVudCkpIHx8IChkZWcgPD0gMTgwICYmIGRlZyA+PSAoMTgwIC0gc2V0dGluZ3Muc2xpZGVJbnRlbnQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWluTGVmdFJhbmdlICYmICFpblJpZ2h0UmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuaGFzSW50ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuaGFzSW50ZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuaW50ZW50Q2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoc2V0dGluZ3MubWluRHJhZ0Rpc3RhbmNlPj1NYXRoLmFicyh0aGVQYWdlWC1jYWNoZS5zdGFydERyYWdYKSkgfHwgLy8gSGFzIHVzZXIgbWV0IG1pbmltdW0gZHJhZyBkaXN0YW5jZT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2FjaGUuaGFzSW50ZW50ID09PSBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLnByZXZlbnQoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdkcmFnJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmRyYWdXYXRjaGVycy5jdXJyZW50ID0gdGhlUGFnZVg7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggZGlyZWN0aW9uIHdlIGFyZSBnb2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlLmRyYWdXYXRjaGVycy5sYXN0ID4gdGhlUGFnZVgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGUuZHJhZ1dhdGNoZXJzLnN0YXRlICE9PSAnbGVmdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuZHJhZ1dhdGNoZXJzLnN0YXRlID0gJ2xlZnQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5kcmFnV2F0Y2hlcnMuaG9sZCA9IHRoZVBhZ2VYO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5kcmFnV2F0Y2hlcnMubGFzdCA9IHRoZVBhZ2VYO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYWNoZS5kcmFnV2F0Y2hlcnMubGFzdCA8IHRoZVBhZ2VYKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlLmRyYWdXYXRjaGVycy5zdGF0ZSAhPT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5kcmFnV2F0Y2hlcnMuc3RhdGUgPSAncmlnaHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5kcmFnV2F0Y2hlcnMuaG9sZCA9IHRoZVBhZ2VYO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5kcmFnV2F0Y2hlcnMubGFzdCA9IHRoZVBhZ2VYO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wZW5pbmdMZWZ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHVsbGluZyB0b28gZmFyIHRvIHRoZSByaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5tYXhQb3NpdGlvbiA8IGFic29sdXRlVHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IChhYnNvbHV0ZVRyYW5zbGF0aW9uIC0gc2V0dGluZ3MubWF4UG9zaXRpb24pICogc2V0dGluZ3MucmVzaXN0YW5jZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlVG8gPSB3aGlsZURyYWdYIC0gZGlmZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuc2ltcGxlU3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuaW5nOiAnbGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvd2FyZHM6IGNhY2hlLmRyYWdXYXRjaGVycy5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHlwZXJFeHRlbmRpbmc6IHNldHRpbmdzLm1heFBvc2l0aW9uIDwgYWJzb2x1dGVUcmFuc2xhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFsZndheTogYWJzb2x1dGVUcmFuc2xhdGlvbiA+IChzZXR0aW5ncy5tYXhQb3NpdGlvbiAvIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGljazogTWF0aC5hYnMoY2FjaGUuZHJhZ1dhdGNoZXJzLmN1cnJlbnQgLSBjYWNoZS5kcmFnV2F0Y2hlcnMuaG9sZCkgPiBzZXR0aW5ncy5mbGlja1RocmVzaG9sZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFic29sdXRlOiBhYnNvbHV0ZVRyYW5zbGF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmU6IHdoaWxlRHJhZ1gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW5jZURpcmVjdGlvbkNoYW5nZTogKGNhY2hlLmRyYWdXYXRjaGVycy5jdXJyZW50IC0gY2FjaGUuZHJhZ1dhdGNoZXJzLmhvbGQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogKGFic29sdXRlVHJhbnNsYXRpb24vc2V0dGluZ3MubWF4UG9zaXRpb24pKjEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHVsbGluZyB0b28gZmFyIHRvIHRoZSBsZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLm1pblBvc2l0aW9uID4gYWJzb2x1dGVUcmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gKGFic29sdXRlVHJhbnNsYXRpb24gLSBzZXR0aW5ncy5taW5Qb3NpdGlvbikgKiBzZXR0aW5ncy5yZXNpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVUbyA9IHdoaWxlRHJhZ1ggLSBkaWZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5zaW1wbGVTdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5pbmc6ICdyaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvd2FyZHM6IGNhY2hlLmRyYWdXYXRjaGVycy5zdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHlwZXJFeHRlbmRpbmc6IHNldHRpbmdzLm1pblBvc2l0aW9uID4gYWJzb2x1dGVUcmFuc2xhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFsZndheTogYWJzb2x1dGVUcmFuc2xhdGlvbiA8IChzZXR0aW5ncy5taW5Qb3NpdGlvbiAvIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGljazogTWF0aC5hYnMoY2FjaGUuZHJhZ1dhdGNoZXJzLmN1cnJlbnQgLSBjYWNoZS5kcmFnV2F0Y2hlcnMuaG9sZCkgPiBzZXR0aW5ncy5mbGlja1RocmVzaG9sZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFic29sdXRlOiBhYnNvbHV0ZVRyYW5zbGF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmU6IHdoaWxlRHJhZ1gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW5jZURpcmVjdGlvbkNoYW5nZTogKGNhY2hlLmRyYWdXYXRjaGVycy5jdXJyZW50IC0gY2FjaGUuZHJhZ1dhdGNoZXJzLmhvbGQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogKGFic29sdXRlVHJhbnNsYXRpb24vc2V0dGluZ3MubWluUG9zaXRpb24pKjEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUueCh0cmFuc2xhdGVUbyArIHRyYW5zbGF0ZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbmREcmFnOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZS5pc0RyYWdnaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2xhdGVkID0gYWN0aW9uLnRyYW5zbGF0ZS5nZXQubWF0cml4KDQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUYXAgQ2xvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZS5kcmFnV2F0Y2hlcnMuY3VycmVudCA9PT0gMCAmJiB0cmFuc2xhdGVkICE9PSAwICYmIHNldHRpbmdzLnRhcFRvQ2xvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdjbG9zZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmV2ZW50cy5wcmV2ZW50KGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUuZWFzZVRvKDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5zdGFydERyYWdYID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJldmVhbGluZyBMZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGUuc2ltcGxlU3RhdGVzLm9wZW5pbmcgPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhhbGZ3YXksIEZsaWNraW5nLCBvciBUb28gRmFyIE91dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoY2FjaGUuc2ltcGxlU3RhdGVzLmhhbGZ3YXkgfHwgY2FjaGUuc2ltcGxlU3RhdGVzLmh5cGVyRXh0ZW5kaW5nIHx8IGNhY2hlLnNpbXBsZVN0YXRlcy5mbGljaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlLnNpbXBsZVN0YXRlcy5mbGljayAmJiBjYWNoZS5zaW1wbGVTdGF0ZXMudG93YXJkcyA9PT0gJ2xlZnQnKSB7IC8vIEZsaWNraW5nIENsb3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2FjaGUuc2ltcGxlU3RhdGVzLmZsaWNrICYmIGNhY2hlLnNpbXBsZVN0YXRlcy50b3dhcmRzID09PSAncmlnaHQnKSB8fCAvLyBGbGlja2luZyBPcGVuIE9SXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2FjaGUuc2ltcGxlU3RhdGVzLmhhbGZ3YXkgfHwgY2FjaGUuc2ltcGxlU3RhdGVzLmh5cGVyRXh0ZW5kaW5nKSAvLyBBdCBsZWFzdCBoYWxmd2F5IG9wZW4gT1IgaHlwZXJleHRlbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24udHJhbnNsYXRlLmVhc2VUbyhzZXR0aW5ncy5tYXhQb3NpdGlvbik7IC8vIE9wZW4gTGVmdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oMCk7IC8vIENsb3NlIExlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV2ZWFsaW5nIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNhY2hlLnNpbXBsZVN0YXRlcy5vcGVuaW5nID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSGFsZndheSwgRmxpY2tpbmcsIG9yIFRvbyBGYXIgT3V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChjYWNoZS5zaW1wbGVTdGF0ZXMuaGFsZndheSB8fCBjYWNoZS5zaW1wbGVTdGF0ZXMuaHlwZXJFeHRlbmRpbmcgfHwgY2FjaGUuc2ltcGxlU3RhdGVzLmZsaWNrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGUuc2ltcGxlU3RhdGVzLmZsaWNrICYmIGNhY2hlLnNpbXBsZVN0YXRlcy50b3dhcmRzID09PSAncmlnaHQnKSB7IC8vIEZsaWNraW5nIENsb3NlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2FjaGUuc2ltcGxlU3RhdGVzLmZsaWNrICYmIGNhY2hlLnNpbXBsZVN0YXRlcy50b3dhcmRzID09PSAnbGVmdCcpIHx8IC8vIEZsaWNraW5nIE9wZW4gT1JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjYWNoZS5zaW1wbGVTdGF0ZXMuaGFsZndheSB8fCBjYWNoZS5zaW1wbGVTdGF0ZXMuaHlwZXJFeHRlbmRpbmcpIC8vIEF0IGxlYXN0IGhhbGZ3YXkgb3BlbiBPUiBoeXBlcmV4dGVuZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUuZWFzZVRvKHNldHRpbmdzLm1pblBvc2l0aW9uKTsgLy8gT3BlbiBSaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oMCk7IC8vIENsb3NlIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuc3RhcnREcmFnWCA9IHV0aWxzLnBhZ2UoJ1gnLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW5pdCA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgICAgICAgICAgIGlmIChvcHRzLmVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB1dGlscy5kZWVwRXh0ZW5kKHNldHRpbmdzLCBvcHRzKTtcbiAgICAgICAgICAgICAgICBjYWNoZS52ZW5kb3IgPSB1dGlscy52ZW5kb3IoKTtcbiAgICAgICAgICAgICAgICBhY3Rpb24uZHJhZy5saXN0ZW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLypcbiAgICAgICAgICogUHVibGljXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9wZW4gPSBmdW5jdGlvbihzaWRlKSB7XG4gICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdvcGVuJyk7XG4gICAgICAgICAgICB1dGlscy5rbGFzcy5yZW1vdmUoZG9jLmJvZHksICdzbmFwanMtZXhwYW5kLWxlZnQnKTtcbiAgICAgICAgICAgIHV0aWxzLmtsYXNzLnJlbW92ZShkb2MuYm9keSwgJ3NuYXBqcy1leHBhbmQtcmlnaHQnKTtcblxuICAgICAgICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgIGNhY2hlLnNpbXBsZVN0YXRlcy5vcGVuaW5nID0gJ2xlZnQnO1xuICAgICAgICAgICAgICAgIGNhY2hlLnNpbXBsZVN0YXRlcy50b3dhcmRzID0gJ3JpZ2h0JztcbiAgICAgICAgICAgICAgICB1dGlscy5rbGFzcy5hZGQoZG9jLmJvZHksICdzbmFwanMtbGVmdCcpO1xuICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLnJlbW92ZShkb2MuYm9keSwgJ3NuYXBqcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUuZWFzZVRvKHNldHRpbmdzLm1heFBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgIGNhY2hlLnNpbXBsZVN0YXRlcy5vcGVuaW5nID0gJ3JpZ2h0JztcbiAgICAgICAgICAgICAgICBjYWNoZS5zaW1wbGVTdGF0ZXMudG93YXJkcyA9ICdsZWZ0JztcbiAgICAgICAgICAgICAgICB1dGlscy5rbGFzcy5yZW1vdmUoZG9jLmJvZHksICdzbmFwanMtbGVmdCcpO1xuICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLmFkZChkb2MuYm9keSwgJ3NuYXBqcy1yaWdodCcpO1xuICAgICAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUuZWFzZVRvKHNldHRpbmdzLm1pblBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCgnY2xvc2UnKTtcbiAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUuZWFzZVRvKDApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmV4cGFuZCA9IGZ1bmN0aW9uKHNpZGUpe1xuICAgICAgICAgICAgdmFyIHRvID0gd2luLmlubmVyV2lkdGggfHwgZG9jLmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgICAgICAgICAgaWYoc2lkZT09PSdsZWZ0Jyl7XG4gICAgICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCgnZXhwYW5kTGVmdCcpO1xuICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLmFkZChkb2MuYm9keSwgJ3NuYXBqcy1leHBhbmQtbGVmdCcpO1xuICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLnJlbW92ZShkb2MuYm9keSwgJ3NuYXBqcy1leHBhbmQtcmlnaHQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCgnZXhwYW5kUmlnaHQnKTtcbiAgICAgICAgICAgICAgICB1dGlscy5rbGFzcy5hZGQoZG9jLmJvZHksICdzbmFwanMtZXhwYW5kLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgdXRpbHMua2xhc3MucmVtb3ZlKGRvYy5ib2R5LCAnc25hcGpzLWV4cGFuZC1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgdG8gKj0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY3Rpb24udHJhbnNsYXRlLmVhc2VUbyh0byk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbiA9IGZ1bmN0aW9uKGV2dCwgZm4pIHtcbiAgICAgICAgICAgIGV2ZW50TGlzdFtldnRdID0gZm47XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vZmYgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudExpc3RbZXZ0XSkge1xuICAgICAgICAgICAgICAgIGV2ZW50TGlzdFtldnRdID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQoJ2VuYWJsZScpO1xuICAgICAgICAgICAgYWN0aW9uLmRyYWcubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCgnZGlzYWJsZScpO1xuICAgICAgICAgICAgYWN0aW9uLmRyYWcuc3RvcExpc3RlbmluZygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSBmdW5jdGlvbihvcHRzKXtcbiAgICAgICAgICAgIHV0aWxzLmRlZXBFeHRlbmQoc2V0dGluZ3MsIG9wdHMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZSxcbiAgICAgICAgICAgICAgICBmcm9tTGVmdCA9IGFjdGlvbi50cmFuc2xhdGUuZ2V0Lm1hdHJpeCg0KTtcbiAgICAgICAgICAgIGlmIChmcm9tTGVmdCA9PT0gc2V0dGluZ3MubWF4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9ICdsZWZ0JztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZnJvbUxlZnQgPT09IHNldHRpbmdzLm1pblBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSAncmlnaHQnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9ICdjbG9zZWQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgICAgICAgaW5mbzogY2FjaGUuc2ltcGxlU3RhdGVzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICBpbml0KHVzZXJPcHRzKTtcbiAgICB9O1xuICAgIGlmICgodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gU25hcDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlbmRlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5TbmFwID0gU25hcDtcbiAgICB9XG4gICAgaWYgKCh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIpICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFwic25hcFwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gU25hcDtcbiAgICAgICAgfSk7XG4gICAgfVxufSkuY2FsbCh0aGlzLCB3aW5kb3csIGRvY3VtZW50KTsiXX0=
