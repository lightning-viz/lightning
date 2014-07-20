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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXRoaXNvbmlhbi9wcm9qZWN0cy9saWdodG5pbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21hdGhpc29uaWFuL3Byb2plY3RzL2xpZ2h0bmluZy91aS9qcy9mYWtlXzU4ODU0MDcuanMiLCIvVXNlcnMvbWF0aGlzb25pYW4vcHJvamVjdHMvbGlnaHRuaW5nL3VpL2pzL2xpYi9zbmFwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTbmFwID0gcmVxdWlyZSgnLi9saWIvc25hcCcpO1xuXG52YXIgc25hcHBlciA9IG5ldyBTbmFwKHtcbiAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQnKVxufSk7XG5cbi8vIHZhciBjb3VudHJpZXMgPSByZXF1aXJlKCcuL2RhdGEvY291bnRyaWVzJyk7XG4vLyB2YXIgU2lkZWJhciA9IHJlcXVpcmUoJy4vdmlld3Mvc2lkZWJhcicpO1xuLy8gdmFyIENvbnRlbnQgPSByZXF1aXJlKCcuL3ZpZXdzL2NvbnRlbnQnKTtcbi8vIHZhciBNb2JpbGUgPSByZXF1aXJlKCcuL3ZpZXdzL21vYmlsZScpO1xuLy8gdmFyIGVtaXR0ZXIgPSByZXF1aXJlKCcuL2VtaXR0ZXInKTtcbi8vIHZhciBzb2NpYWwgPSByZXF1aXJlKCcuL3NvY2lhbCcpO1xuXG4vLyAvLyB2YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vLyB2YXIgTU9CSUxFX0JSRUFLUE9JTlQgPSA3NjA7XG4vLyB2YXIgY29udGVudCA9IG51bGw7XG4vLyB2YXIgbW9iaWxlID0gbnVsbDtcbi8vIHZhciBzaWRlYmFyID0gbnVsbDtcbi8vIHZhciAkc2lkZWJhckVsID0gJCgnLnNpZGViYXInKTtcblxuLy8gdmFyIGRyYXcgPSBmdW5jdGlvbigpIHtcbi8vICAgICBlbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuXG4vLyAgICAgaWYoc2lkZWJhcikge1xuLy8gICAgICAgICBzaWRlYmFyLmRlc3Ryb3koKTtcbi8vICAgICB9XG4vLyAgICAgaWYobW9iaWxlKSB7XG4vLyAgICAgICAgIG1vYmlsZS5kZXN0cm95KCk7XG4vLyAgICAgfVxuXG4vLyAgICAgaWYoJCh3aW5kb3cpLndpZHRoKCkgPiBNT0JJTEVfQlJFQUtQT0lOVCkge1xuXG4vLyAgICAgICAgIHNpZGViYXIgPSBuZXcgU2lkZWJhcigkc2lkZWJhckVsKTtcbiAgICAgICBcbi8vICAgICAgICAgdmFyIGNvdW50cnkgPSAoY29udGVudCkgPyBjb250ZW50LmNvdW50cnkgOiBjb3VudHJpZXNbMF07XG4vLyAgICAgICAgIGNvbnRlbnQgPSBuZXcgQ29udGVudCgkKCcuZGVza3RvcC1jb250ZW50LWNvbnRhaW5lcicpKTtcbi8vICAgICAgICAgZW1pdHRlci5lbWl0KCdjb3VudHJ5OnNlbGVjdGVkJywgY291bnRyeSk7ICAgICAgICBcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgICBtb2JpbGUgPSBuZXcgTW9iaWxlKCQoJy5tb2JpbGUgLmNvbnRhaW5lcicpKTtcbi8vICAgICB9XG4gICAgXG4vLyAgICAgZW1pdHRlci5vbignc2hhcmU6dHdpdHRlcicsIGZ1bmN0aW9uKGNvdW50cnkpIHtcbi8vICAgICAgICAgc29jaWFsLnNoYXJlT25Ud2l0dGVyKGNvdW50cnkpO1xuLy8gICAgIH0pO1xuXG4vLyAgICAgZW1pdHRlci5vbignc2hhcmU6ZmFjZWJvb2snLCBmdW5jdGlvbihjb3VudHJ5KSB7XG4vLyAgICAgICAgIHNvY2lhbC5zaGFyZU9uRmFjZWJvb2soY291bnRyeSk7XG4vLyAgICAgfSk7XG5cbi8vIH07XG5cbi8vIHdpbmRvdy5vbnJlc2l6ZSA9IGRyYXc7XG4vLyBkcmF3KCk7XG5cbi8vXG4vLyBhcHAuanMgaXMgdGhlIGVudHJ5IHBvaW50IGZvciB0aGUgZW50aXJlIGNsaWVudC1zaWRlXG4vLyBhcHBsaWNhdGlvbi4gQW55IG5lY2Vzc2FyeSB0b3AgbGV2ZWwgbGlicmFyaWVzIHNob3VsZCBiZVxuLy8gcmVxdWlyZWQgaGVyZSAoZS5nLiBweW0uanMpLCBhbmQgaXQgc2hvdWxkIGFsc28gYmVcbi8vIHJlc3BvbnNpYmxlIGZvciBpbnN0YW50aWF0aW5nIGNvcnJlY3Qgdmlld2NvbnRyb2xsZXJzLlxuLy9cblxuXG4iLCIvKlxuICogU25hcC5qc1xuICpcbiAqIENvcHlyaWdodCAyMDEzLCBKYWNvYiBLZWxsZXkgLSBodHRwOi8vamFraWVzdGZ1LmNvbS9cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5jZVxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICpcbiAqIEdpdGh1YjogIGh0dHA6Ly9naXRodWIuY29tL2pha2llc3RmdS9TbmFwLmpzL1xuICogVmVyc2lvbjogMS45LjNcbiAqL1xuLypqc2xpbnQgYnJvd3NlcjogdHJ1ZSovXG4vKmdsb2JhbCBkZWZpbmUsIG1vZHVsZSwgZW5kZXIqL1xuKGZ1bmN0aW9uKHdpbiwgZG9jKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHZhciBTbmFwID0gU25hcCB8fCBmdW5jdGlvbih1c2VyT3B0cykge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBlbGVtZW50OiBudWxsLFxuICAgICAgICAgICAgZHJhZ2dlcjogbnVsbCxcbiAgICAgICAgICAgIGRpc2FibGU6ICdub25lJyxcbiAgICAgICAgICAgIGFkZEJvZHlDbGFzc2VzOiB0cnVlLFxuICAgICAgICAgICAgaHlwZXJleHRlbnNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgcmVzaXN0YW5jZTogMC41LFxuICAgICAgICAgICAgZmxpY2tUaHJlc2hvbGQ6IDUwLFxuICAgICAgICAgICAgdHJhbnNpdGlvblNwZWVkOiAwLjMsXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlJyxcbiAgICAgICAgICAgIG1heFBvc2l0aW9uOiAyNjYsXG4gICAgICAgICAgICBtaW5Qb3NpdGlvbjogLTI2NixcbiAgICAgICAgICAgIHRhcFRvQ2xvc2U6IHRydWUsXG4gICAgICAgICAgICB0b3VjaFRvRHJhZzogdHJ1ZSxcbiAgICAgICAgICAgIHNsaWRlSW50ZW50OiA0MCwgLy8gZGVncmVlc1xuICAgICAgICAgICAgbWluRHJhZ0Rpc3RhbmNlOiA1XG4gICAgICAgIH0sXG4gICAgICAgIGNhY2hlID0ge1xuICAgICAgICAgICAgc2ltcGxlU3RhdGVzOiB7XG4gICAgICAgICAgICAgICAgb3BlbmluZzogbnVsbCxcbiAgICAgICAgICAgICAgICB0b3dhcmRzOiBudWxsLFxuICAgICAgICAgICAgICAgIGh5cGVyRXh0ZW5kaW5nOiBudWxsLFxuICAgICAgICAgICAgICAgIGhhbGZ3YXk6IG51bGwsXG4gICAgICAgICAgICAgICAgZmxpY2s6IG51bGwsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgYWJzb2x1dGU6IDAsXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlOiAwLFxuICAgICAgICAgICAgICAgICAgICBzaW5jZURpcmVjdGlvbkNoYW5nZTogMCxcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnRMaXN0ID0ge30sXG4gICAgICAgIHV0aWxzID0ge1xuICAgICAgICAgICAgaGFzVG91Y2g6ICgnb250b3VjaHN0YXJ0JyBpbiBkb2MuZG9jdW1lbnRFbGVtZW50IHx8IHdpbi5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZCksXG4gICAgICAgICAgICBldmVudFR5cGU6IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBldmVudFR5cGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG93bjogKHV0aWxzLmhhc1RvdWNoID8gJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZTogKHV0aWxzLmhhc1RvdWNoID8gJ3RvdWNobW92ZScgOiAnbW91c2Vtb3ZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICB1cDogKHV0aWxzLmhhc1RvdWNoID8gJ3RvdWNoZW5kJyA6ICdtb3VzZXVwJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQ6ICh1dGlscy5oYXNUb3VjaCA/ICd0b3VjaGNhbmNlbCcgOiAnbW91c2VvdXQnKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBldmVudFR5cGVzW2FjdGlvbl07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFnZTogZnVuY3Rpb24odCwgZSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh1dGlscy5oYXNUb3VjaCAmJiBlLnRvdWNoZXMubGVuZ3RoICYmIGUudG91Y2hlc1swXSkgPyBlLnRvdWNoZXNbMF1bJ3BhZ2UnK3RdIDogZVsncGFnZScrdF07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2xhc3M6IHtcbiAgICAgICAgICAgICAgICBoYXM6IGZ1bmN0aW9uKGVsLCBuYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChlbC5jbGFzc05hbWUpLmluZGV4T2YobmFtZSkgIT09IC0xO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWRkOiBmdW5jdGlvbihlbCwgbmFtZSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKCF1dGlscy5rbGFzcy5oYXMoZWwsIG5hbWUpICYmIHNldHRpbmdzLmFkZEJvZHlDbGFzc2VzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTmFtZSArPSBcIiBcIituYW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGVsLCBuYW1lKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoc2V0dGluZ3MuYWRkQm9keUNsYXNzZXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NOYW1lID0gKGVsLmNsYXNzTmFtZSkucmVwbGFjZShuYW1lLCBcIlwiKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGlzcGF0Y2hFdmVudDogZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXZlbnRMaXN0W3R5cGVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldmVudExpc3RbdHlwZV0uY2FsbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2ZW5kb3I6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IGRvYy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICBwcmVmaXhlcyA9ICd3ZWJraXQgTW96IE8gbXMnLnNwbGl0KCcgJyksXG4gICAgICAgICAgICAgICAgICAgIGk7XG4gICAgICAgICAgICAgICAgZm9yIChpIGluIHByZWZpeGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdG1wLnN0eWxlW3ByZWZpeGVzW2ldICsgJ1RyYW5zaXRpb24nXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmVmaXhlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cmFuc2l0aW9uQ2FsbGJhY2s6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChjYWNoZS52ZW5kb3I9PT0nTW96JyB8fCBjYWNoZS52ZW5kb3I9PT0nbXMnKSA/ICd0cmFuc2l0aW9uZW5kJyA6IGNhY2hlLnZlbmRvcisnVHJhbnNpdGlvbkVuZCc7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2FuVHJhbnNmb3JtOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc2V0dGluZ3MuZWxlbWVudC5zdHlsZVtjYWNoZS52ZW5kb3IrJ1RyYW5zZm9ybSddICE9PSAndW5kZWZpbmVkJztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWVwRXh0ZW5kOiBmdW5jdGlvbihkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3BlcnR5O1xuICAgICAgICAgICAgICAgIGZvciAocHJvcGVydHkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2VbcHJvcGVydHldICYmIHNvdXJjZVtwcm9wZXJ0eV0uY29uc3RydWN0b3IgJiYgc291cmNlW3Byb3BlcnR5XS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbltwcm9wZXJ0eV0gPSBkZXN0aW5hdGlvbltwcm9wZXJ0eV0gfHwge307XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5kZWVwRXh0ZW5kKGRlc3RpbmF0aW9uW3Byb3BlcnR5XSwgc291cmNlW3Byb3BlcnR5XSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbltwcm9wZXJ0eV0gPSBzb3VyY2VbcHJvcGVydHldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBkZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhbmdsZU9mRHJhZzogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgICAgICAgIHZhciBkZWdyZWVzLCB0aGV0YTtcbiAgICAgICAgICAgICAgICAvLyBDYWxjIFRoZXRhXG4gICAgICAgICAgICAgICAgdGhldGEgPSBNYXRoLmF0YW4yKC0oY2FjaGUuc3RhcnREcmFnWSAtIHkpLCAoY2FjaGUuc3RhcnREcmFnWCAtIHgpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhldGEgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoZXRhICs9IDIgKiBNYXRoLlBJO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDYWxjIERlZ3JlZXNcbiAgICAgICAgICAgICAgICBkZWdyZWVzID0gTWF0aC5mbG9vcih0aGV0YSAqICgxODAgLyBNYXRoLlBJKSAtIDE4MCk7XG4gICAgICAgICAgICAgICAgaWYgKGRlZ3JlZXMgPCAwICYmIGRlZ3JlZXMgPiAtMTgwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZ3JlZXMgPSAzNjAgLSBNYXRoLmFicyhkZWdyZWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKGRlZ3JlZXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50OiBmdW5jdGlvbiBhZGRFdmVudChlbGVtZW50LCBldmVudE5hbWUsIGZ1bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmMsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50LmF0dGFjaEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudE5hbWUsIGZ1bmMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW1vdmVFdmVudDogZnVuY3Rpb24gYWRkRXZlbnQoZWxlbWVudCwgZXZlbnROYW1lLCBmdW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmdW5jLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZGV0YWNoRXZlbnQoXCJvblwiICsgZXZlbnROYW1lLCBmdW5jKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJldmVudDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmVudFVudGlsOiBmdW5jdGlvbihlbCwgYXR0cikge1xuICAgICAgICAgICAgICAgIHZhciBpc1N0ciA9IHR5cGVvZiBhdHRyID09PSAnc3RyaW5nJztcbiAgICAgICAgICAgICAgICB3aGlsZSAoZWwucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdHIgJiYgZWwuZ2V0QXR0cmlidXRlICYmIGVsLmdldEF0dHJpYnV0ZShhdHRyKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZighaXNTdHIgJiYgZWwgPT09IGF0dHIpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFjdGlvbiA9IHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZToge1xuICAgICAgICAgICAgICAgIGdldDoge1xuICAgICAgICAgICAgICAgICAgICBtYXRyaXg6IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCAhdXRpbHMuY2FuVHJhbnNmb3JtKCkgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoc2V0dGluZ3MuZWxlbWVudC5zdHlsZS5sZWZ0LCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXRyaXggPSB3aW4uZ2V0Q29tcHV0ZWRTdHlsZShzZXR0aW5ncy5lbGVtZW50KVtjYWNoZS52ZW5kb3IrJ1RyYW5zZm9ybSddLm1hdGNoKC9cXCgoLiopXFwpLyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGllT2Zmc2V0ID0gODtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWF0cml4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeCA9IG1hdHJpeFsxXS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihtYXRyaXgubGVuZ3RoPT09MTYpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrPWllT2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChtYXRyaXhbaW5kZXhdLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlYXNlQ2FsbGJhY2s6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmVsZW1lbnQuc3R5bGVbY2FjaGUudmVuZG9yKydUcmFuc2l0aW9uJ10gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUudHJhbnNsYXRpb24gPSBhY3Rpb24udHJhbnNsYXRlLmdldC5tYXRyaXgoNCk7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLmVhc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhY2hlLmFuaW1hdGluZ0ludGVydmFsKTtcblxuICAgICAgICAgICAgICAgICAgICBpZihjYWNoZS5lYXNpbmdUbz09PTApe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMua2xhc3MucmVtb3ZlKGRvYy5ib2R5LCAnc25hcGpzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5rbGFzcy5yZW1vdmUoZG9jLmJvZHksICdzbmFwanMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCgnYW5pbWF0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLnJlbW92ZUV2ZW50KHNldHRpbmdzLmVsZW1lbnQsIHV0aWxzLnRyYW5zaXRpb25DYWxsYmFjaygpLCBhY3Rpb24udHJhbnNsYXRlLmVhc2VDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlYXNlVG86IGZ1bmN0aW9uKG4pIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiggIXV0aWxzLmNhblRyYW5zZm9ybSgpICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS50cmFuc2xhdGlvbiA9IG47XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24udHJhbnNsYXRlLngobik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5lYXNpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuZWFzaW5nVG8gPSBuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5lbGVtZW50LnN0eWxlW2NhY2hlLnZlbmRvcisnVHJhbnNpdGlvbiddID0gJ2FsbCAnICsgc2V0dGluZ3MudHJhbnNpdGlvblNwZWVkICsgJ3MgJyArIHNldHRpbmdzLmVhc2luZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuYW5pbWF0aW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdhbmltYXRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5ldmVudHMuYWRkRXZlbnQoc2V0dGluZ3MuZWxlbWVudCwgdXRpbHMudHJhbnNpdGlvbkNhbGxiYWNrKCksIGFjdGlvbi50cmFuc2xhdGUuZWFzZUNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUueChuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihuPT09MCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5lbGVtZW50LnN0eWxlW2NhY2hlLnZlbmRvcisnVHJhbnNmb3JtJ10gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeDogZnVuY3Rpb24obikge1xuICAgICAgICAgICAgICAgICAgICBpZiggKHNldHRpbmdzLmRpc2FibGU9PT0nbGVmdCcgJiYgbj4wKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKHNldHRpbmdzLmRpc2FibGU9PT0ncmlnaHQnICYmIG48MClcbiAgICAgICAgICAgICAgICAgICAgKXsgcmV0dXJuOyB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggIXNldHRpbmdzLmh5cGVyZXh0ZW5zaWJsZSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIG49PT1zZXR0aW5ncy5tYXhQb3NpdGlvbiB8fCBuPnNldHRpbmdzLm1heFBvc2l0aW9uICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbj1zZXR0aW5ncy5tYXhQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggbj09PXNldHRpbmdzLm1pblBvc2l0aW9uIHx8IG48c2V0dGluZ3MubWluUG9zaXRpb24gKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuPXNldHRpbmdzLm1pblBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBuID0gcGFyc2VJbnQobiwgMTApO1xuICAgICAgICAgICAgICAgICAgICBpZihpc05hTihuKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmKCB1dGlscy5jYW5UcmFuc2Zvcm0oKSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoZVRyYW5zbGF0ZSA9ICd0cmFuc2xhdGUzZCgnICsgbiArICdweCwgMCwwKSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5lbGVtZW50LnN0eWxlW2NhY2hlLnZlbmRvcisnVHJhbnNmb3JtJ10gPSB0aGVUcmFuc2xhdGU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5lbGVtZW50LnN0eWxlLndpZHRoID0gKHdpbi5pbm5lcldpZHRoIHx8IGRvYy5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpKydweCc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmVsZW1lbnQuc3R5bGUubGVmdCA9IG4rJ3B4JztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmVsZW1lbnQuc3R5bGUucmlnaHQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkcmFnOiB7XG4gICAgICAgICAgICAgICAgbGlzdGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUudHJhbnNsYXRpb24gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjYWNoZS5lYXNpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLmFkZEV2ZW50KHNldHRpbmdzLmVsZW1lbnQsIHV0aWxzLmV2ZW50VHlwZSgnZG93bicpLCBhY3Rpb24uZHJhZy5zdGFydERyYWcpO1xuICAgICAgICAgICAgICAgICAgICB1dGlscy5ldmVudHMuYWRkRXZlbnQoc2V0dGluZ3MuZWxlbWVudCwgdXRpbHMuZXZlbnRUeXBlKCdtb3ZlJyksIGFjdGlvbi5kcmFnLmRyYWdnaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLmFkZEV2ZW50KHNldHRpbmdzLmVsZW1lbnQsIHV0aWxzLmV2ZW50VHlwZSgndXAnKSwgYWN0aW9uLmRyYWcuZW5kRHJhZyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdG9wTGlzdGVuaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLnJlbW92ZUV2ZW50KHNldHRpbmdzLmVsZW1lbnQsIHV0aWxzLmV2ZW50VHlwZSgnZG93bicpLCBhY3Rpb24uZHJhZy5zdGFydERyYWcpO1xuICAgICAgICAgICAgICAgICAgICB1dGlscy5ldmVudHMucmVtb3ZlRXZlbnQoc2V0dGluZ3MuZWxlbWVudCwgdXRpbHMuZXZlbnRUeXBlKCdtb3ZlJyksIGFjdGlvbi5kcmFnLmRyYWdnaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLnJlbW92ZUV2ZW50KHNldHRpbmdzLmVsZW1lbnQsIHV0aWxzLmV2ZW50VHlwZSgndXAnKSwgYWN0aW9uLmRyYWcuZW5kRHJhZyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdGFydERyYWc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gZHJhZyBvbiBpZ25vcmVkIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCA/IGUudGFyZ2V0IDogZS5zcmNFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgaWdub3JlUGFyZW50ID0gdXRpbHMucGFyZW50VW50aWwodGFyZ2V0LCAnZGF0YS1zbmFwLWlnbm9yZScpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlnbm9yZVBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCgnaWdub3JlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZihzZXR0aW5ncy5kcmFnZ2VyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcmFnUGFyZW50ID0gdXRpbHMucGFyZW50VW50aWwodGFyZ2V0LCBzZXR0aW5ncy5kcmFnZ2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSB1c2UgZHJhZ2dlciBpZiB3ZSdyZSBpbiBhIGNsb3NlZCBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoICFkcmFnUGFyZW50ICYmIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjYWNoZS50cmFuc2xhdGlvbiAhPT0gc2V0dGluZ3MubWluUG9zaXRpb24gJiYgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUudHJhbnNsYXRpb24gIT09IHNldHRpbmdzLm1heFBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQoJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmVsZW1lbnQuc3R5bGVbY2FjaGUudmVuZG9yKydUcmFuc2l0aW9uJ10gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLmhhc0ludGVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLmludGVudENoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuc3RhcnREcmFnWCA9IHV0aWxzLnBhZ2UoJ1gnLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuc3RhcnREcmFnWSA9IHV0aWxzLnBhZ2UoJ1knLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuZHJhZ1dhdGNoZXJzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBob2xkOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICcnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLnNpbXBsZVN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5pbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3dhcmRzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgaHlwZXJFeHRlbmRpbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWxmd2F5OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxpY2s6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFic29sdXRlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbmNlRGlyZWN0aW9uQ2hhbmdlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRyYWdnaW5nOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZS5pc0RyYWdnaW5nICYmIHNldHRpbmdzLnRvdWNoVG9EcmFnKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGVQYWdlWCA9IHV0aWxzLnBhZ2UoJ1gnLCBlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVQYWdlWSA9IHV0aWxzLnBhZ2UoJ1knLCBlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVkID0gY2FjaGUudHJhbnNsYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJzb2x1dGVUcmFuc2xhdGlvbiA9IGFjdGlvbi50cmFuc2xhdGUuZ2V0Lm1hdHJpeCg0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZURyYWdYID0gdGhlUGFnZVggLSBjYWNoZS5zdGFydERyYWdYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5pbmdMZWZ0ID0gYWJzb2x1dGVUcmFuc2xhdGlvbiA+IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlVG8gPSB3aGlsZURyYWdYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmY7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNob3duIG5vIGludGVudCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgICAgICAgICBpZigoY2FjaGUuaW50ZW50Q2hlY2tlZCAmJiAhY2FjaGUuaGFzSW50ZW50KSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzZXR0aW5ncy5hZGRCb2R5Q2xhc3Nlcyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoKGFic29sdXRlVHJhbnNsYXRpb24pPjApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5rbGFzcy5hZGQoZG9jLmJvZHksICdzbmFwanMtbGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5rbGFzcy5yZW1vdmUoZG9jLmJvZHksICdzbmFwanMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoKGFic29sdXRlVHJhbnNsYXRpb24pPDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5rbGFzcy5hZGQoZG9jLmJvZHksICdzbmFwanMtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMua2xhc3MucmVtb3ZlKGRvYy5ib2R5LCAnc25hcGpzLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZS5oYXNJbnRlbnQgPT09IGZhbHNlIHx8IGNhY2hlLmhhc0ludGVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWcgPSB1dGlscy5hbmdsZU9mRHJhZyh0aGVQYWdlWCwgdGhlUGFnZVkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblJpZ2h0UmFuZ2UgPSAoZGVnID49IDAgJiYgZGVnIDw9IHNldHRpbmdzLnNsaWRlSW50ZW50KSB8fCAoZGVnIDw9IDM2MCAmJiBkZWcgPiAoMzYwIC0gc2V0dGluZ3Muc2xpZGVJbnRlbnQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5MZWZ0UmFuZ2UgPSAoZGVnID49IDE4MCAmJiBkZWcgPD0gKDE4MCArIHNldHRpbmdzLnNsaWRlSW50ZW50KSkgfHwgKGRlZyA8PSAxODAgJiYgZGVnID49ICgxODAgLSBzZXR0aW5ncy5zbGlkZUludGVudCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaW5MZWZ0UmFuZ2UgJiYgIWluUmlnaHRSYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5oYXNJbnRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5oYXNJbnRlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5pbnRlbnRDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChzZXR0aW5ncy5taW5EcmFnRGlzdGFuY2U+PU1hdGguYWJzKHRoZVBhZ2VYLWNhY2hlLnN0YXJ0RHJhZ1gpKSB8fCAvLyBIYXMgdXNlciBtZXQgbWluaW11bSBkcmFnIGRpc3RhbmNlP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjYWNoZS5oYXNJbnRlbnQgPT09IGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5ldmVudHMucHJldmVudChlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQoJ2RyYWcnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuZHJhZ1dhdGNoZXJzLmN1cnJlbnQgPSB0aGVQYWdlWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERldGVybWluZSB3aGljaCBkaXJlY3Rpb24gd2UgYXJlIGdvaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGUuZHJhZ1dhdGNoZXJzLmxhc3QgPiB0aGVQYWdlWCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZS5kcmFnV2F0Y2hlcnMuc3RhdGUgIT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5kcmFnV2F0Y2hlcnMuc3RhdGUgPSAnbGVmdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmRyYWdXYXRjaGVycy5ob2xkID0gdGhlUGFnZVg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmRyYWdXYXRjaGVycy5sYXN0ID0gdGhlUGFnZVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNhY2hlLmRyYWdXYXRjaGVycy5sYXN0IDwgdGhlUGFnZVgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGUuZHJhZ1dhdGNoZXJzLnN0YXRlICE9PSAncmlnaHQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmRyYWdXYXRjaGVycy5zdGF0ZSA9ICdyaWdodCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmRyYWdXYXRjaGVycy5ob2xkID0gdGhlUGFnZVg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLmRyYWdXYXRjaGVycy5sYXN0ID0gdGhlUGFnZVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3BlbmluZ0xlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQdWxsaW5nIHRvbyBmYXIgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLm1heFBvc2l0aW9uIDwgYWJzb2x1dGVUcmFuc2xhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gKGFic29sdXRlVHJhbnNsYXRpb24gLSBzZXR0aW5ncy5tYXhQb3NpdGlvbikgKiBzZXR0aW5ncy5yZXNpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVUbyA9IHdoaWxlRHJhZ1ggLSBkaWZmO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5zaW1wbGVTdGF0ZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5pbmc6ICdsZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG93YXJkczogY2FjaGUuZHJhZ1dhdGNoZXJzLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoeXBlckV4dGVuZGluZzogc2V0dGluZ3MubWF4UG9zaXRpb24gPCBhYnNvbHV0ZVRyYW5zbGF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWxmd2F5OiBhYnNvbHV0ZVRyYW5zbGF0aW9uID4gKHNldHRpbmdzLm1heFBvc2l0aW9uIC8gMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsaWNrOiBNYXRoLmFicyhjYWNoZS5kcmFnV2F0Y2hlcnMuY3VycmVudCAtIGNhY2hlLmRyYWdXYXRjaGVycy5ob2xkKSA+IHNldHRpbmdzLmZsaWNrVGhyZXNob2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJzb2x1dGU6IGFic29sdXRlVHJhbnNsYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZTogd2hpbGVEcmFnWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbmNlRGlyZWN0aW9uQ2hhbmdlOiAoY2FjaGUuZHJhZ1dhdGNoZXJzLmN1cnJlbnQgLSBjYWNoZS5kcmFnV2F0Y2hlcnMuaG9sZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiAoYWJzb2x1dGVUcmFuc2xhdGlvbi9zZXR0aW5ncy5tYXhQb3NpdGlvbikqMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQdWxsaW5nIHRvbyBmYXIgdG8gdGhlIGxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MubWluUG9zaXRpb24gPiBhYnNvbHV0ZVRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSAoYWJzb2x1dGVUcmFuc2xhdGlvbiAtIHNldHRpbmdzLm1pblBvc2l0aW9uKSAqIHNldHRpbmdzLnJlc2lzdGFuY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVRvID0gd2hpbGVEcmFnWCAtIGRpZmY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLnNpbXBsZVN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbmluZzogJ3JpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG93YXJkczogY2FjaGUuZHJhZ1dhdGNoZXJzLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoeXBlckV4dGVuZGluZzogc2V0dGluZ3MubWluUG9zaXRpb24gPiBhYnNvbHV0ZVRyYW5zbGF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYWxmd2F5OiBhYnNvbHV0ZVRyYW5zbGF0aW9uIDwgKHNldHRpbmdzLm1pblBvc2l0aW9uIC8gMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsaWNrOiBNYXRoLmFicyhjYWNoZS5kcmFnV2F0Y2hlcnMuY3VycmVudCAtIGNhY2hlLmRyYWdXYXRjaGVycy5ob2xkKSA+IHNldHRpbmdzLmZsaWNrVGhyZXNob2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJzb2x1dGU6IGFic29sdXRlVHJhbnNsYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZTogd2hpbGVEcmFnWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbmNlRGlyZWN0aW9uQ2hhbmdlOiAoY2FjaGUuZHJhZ1dhdGNoZXJzLmN1cnJlbnQgLSBjYWNoZS5kcmFnV2F0Y2hlcnMuaG9sZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiAoYWJzb2x1dGVUcmFuc2xhdGlvbi9zZXR0aW5ncy5taW5Qb3NpdGlvbikqMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS54KHRyYW5zbGF0ZVRvICsgdHJhbnNsYXRlZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVuZERyYWc6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlLmlzRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQoJ2VuZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZWQgPSBhY3Rpb24udHJhbnNsYXRlLmdldC5tYXRyaXgoNCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRhcCBDbG9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlLmRyYWdXYXRjaGVycy5jdXJyZW50ID09PSAwICYmIHRyYW5zbGF0ZWQgIT09IDAgJiYgc2V0dGluZ3MudGFwVG9DbG9zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQoJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXZlbnRzLnByZXZlbnQoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLnN0YXJ0RHJhZ1ggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV2ZWFsaW5nIExlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZS5zaW1wbGVTdGF0ZXMub3BlbmluZyA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSGFsZndheSwgRmxpY2tpbmcsIG9yIFRvbyBGYXIgT3V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChjYWNoZS5zaW1wbGVTdGF0ZXMuaGFsZndheSB8fCBjYWNoZS5zaW1wbGVTdGF0ZXMuaHlwZXJFeHRlbmRpbmcgfHwgY2FjaGUuc2ltcGxlU3RhdGVzLmZsaWNrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGUuc2ltcGxlU3RhdGVzLmZsaWNrICYmIGNhY2hlLnNpbXBsZVN0YXRlcy50b3dhcmRzID09PSAnbGVmdCcpIHsgLy8gRmxpY2tpbmcgQ2xvc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24udHJhbnNsYXRlLmVhc2VUbygwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjYWNoZS5zaW1wbGVTdGF0ZXMuZmxpY2sgJiYgY2FjaGUuc2ltcGxlU3RhdGVzLnRvd2FyZHMgPT09ICdyaWdodCcpIHx8IC8vIEZsaWNraW5nIE9wZW4gT1JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjYWNoZS5zaW1wbGVTdGF0ZXMuaGFsZndheSB8fCBjYWNoZS5zaW1wbGVTdGF0ZXMuaHlwZXJFeHRlbmRpbmcpIC8vIEF0IGxlYXN0IGhhbGZ3YXkgb3BlbiBPUiBoeXBlcmV4dGVuZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUuZWFzZVRvKHNldHRpbmdzLm1heFBvc2l0aW9uKTsgLy8gT3BlbiBMZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24udHJhbnNsYXRlLmVhc2VUbygwKTsgLy8gQ2xvc2UgTGVmdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZXZlYWxpbmcgUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FjaGUuc2ltcGxlU3RhdGVzLm9wZW5pbmcgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIYWxmd2F5LCBGbGlja2luZywgb3IgVG9vIEZhciBPdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGNhY2hlLnNpbXBsZVN0YXRlcy5oYWxmd2F5IHx8IGNhY2hlLnNpbXBsZVN0YXRlcy5oeXBlckV4dGVuZGluZyB8fCBjYWNoZS5zaW1wbGVTdGF0ZXMuZmxpY2spKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWNoZS5zaW1wbGVTdGF0ZXMuZmxpY2sgJiYgY2FjaGUuc2ltcGxlU3RhdGVzLnRvd2FyZHMgPT09ICdyaWdodCcpIHsgLy8gRmxpY2tpbmcgQ2xvc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24udHJhbnNsYXRlLmVhc2VUbygwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjYWNoZS5zaW1wbGVTdGF0ZXMuZmxpY2sgJiYgY2FjaGUuc2ltcGxlU3RhdGVzLnRvd2FyZHMgPT09ICdsZWZ0JykgfHwgLy8gRmxpY2tpbmcgT3BlbiBPUlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNhY2hlLnNpbXBsZVN0YXRlcy5oYWxmd2F5IHx8IGNhY2hlLnNpbXBsZVN0YXRlcy5oeXBlckV4dGVuZGluZykgLy8gQXQgbGVhc3QgaGFsZndheSBvcGVuIE9SIGh5cGVyZXh0ZW5kaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oc2V0dGluZ3MubWluUG9zaXRpb24pOyAvLyBPcGVuIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb24udHJhbnNsYXRlLmVhc2VUbygwKTsgLy8gQ2xvc2UgUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5pc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5zdGFydERyYWdYID0gdXRpbHMucGFnZSgnWCcsIGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbml0ID0gZnVuY3Rpb24ob3B0cykge1xuICAgICAgICAgICAgaWYgKG9wdHMuZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHV0aWxzLmRlZXBFeHRlbmQoc2V0dGluZ3MsIG9wdHMpO1xuICAgICAgICAgICAgICAgIGNhY2hlLnZlbmRvciA9IHV0aWxzLnZlbmRvcigpO1xuICAgICAgICAgICAgICAgIGFjdGlvbi5kcmFnLmxpc3RlbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvKlxuICAgICAgICAgKiBQdWJsaWNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub3BlbiA9IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQoJ29wZW4nKTtcbiAgICAgICAgICAgIHV0aWxzLmtsYXNzLnJlbW92ZShkb2MuYm9keSwgJ3NuYXBqcy1leHBhbmQtbGVmdCcpO1xuICAgICAgICAgICAgdXRpbHMua2xhc3MucmVtb3ZlKGRvYy5ib2R5LCAnc25hcGpzLWV4cGFuZC1yaWdodCcpO1xuXG4gICAgICAgICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICAgICAgY2FjaGUuc2ltcGxlU3RhdGVzLm9wZW5pbmcgPSAnbGVmdCc7XG4gICAgICAgICAgICAgICAgY2FjaGUuc2ltcGxlU3RhdGVzLnRvd2FyZHMgPSAncmlnaHQnO1xuICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLmFkZChkb2MuYm9keSwgJ3NuYXBqcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgdXRpbHMua2xhc3MucmVtb3ZlKGRvYy5ib2R5LCAnc25hcGpzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oc2V0dGluZ3MubWF4UG9zaXRpb24pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgICAgICAgY2FjaGUuc2ltcGxlU3RhdGVzLm9wZW5pbmcgPSAncmlnaHQnO1xuICAgICAgICAgICAgICAgIGNhY2hlLnNpbXBsZVN0YXRlcy50b3dhcmRzID0gJ2xlZnQnO1xuICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLnJlbW92ZShkb2MuYm9keSwgJ3NuYXBqcy1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgdXRpbHMua2xhc3MuYWRkKGRvYy5ib2R5LCAnc25hcGpzLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oc2V0dGluZ3MubWluUG9zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdjbG9zZScpO1xuICAgICAgICAgICAgYWN0aW9uLnRyYW5zbGF0ZS5lYXNlVG8oMCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZXhwYW5kID0gZnVuY3Rpb24oc2lkZSl7XG4gICAgICAgICAgICB2YXIgdG8gPSB3aW4uaW5uZXJXaWR0aCB8fCBkb2MuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgICAgICAgICBpZihzaWRlPT09J2xlZnQnKXtcbiAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdleHBhbmRMZWZ0Jyk7XG4gICAgICAgICAgICAgICAgdXRpbHMua2xhc3MuYWRkKGRvYy5ib2R5LCAnc25hcGpzLWV4cGFuZC1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgdXRpbHMua2xhc3MucmVtb3ZlKGRvYy5ib2R5LCAnc25hcGpzLWV4cGFuZC1yaWdodCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdleHBhbmRSaWdodCcpO1xuICAgICAgICAgICAgICAgIHV0aWxzLmtsYXNzLmFkZChkb2MuYm9keSwgJ3NuYXBqcy1leHBhbmQtcmlnaHQnKTtcbiAgICAgICAgICAgICAgICB1dGlscy5rbGFzcy5yZW1vdmUoZG9jLmJvZHksICdzbmFwanMtZXhwYW5kLWxlZnQnKTtcbiAgICAgICAgICAgICAgICB0byAqPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjdGlvbi50cmFuc2xhdGUuZWFzZVRvKHRvKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uID0gZnVuY3Rpb24oZXZ0LCBmbikge1xuICAgICAgICAgICAgZXZlbnRMaXN0W2V2dF0gPSBmbjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9mZiA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50TGlzdFtldnRdKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0W2V2dF0gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCgnZW5hYmxlJyk7XG4gICAgICAgICAgICBhY3Rpb24uZHJhZy5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KCdkaXNhYmxlJyk7XG4gICAgICAgICAgICBhY3Rpb24uZHJhZy5zdG9wTGlzdGVuaW5nKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IGZ1bmN0aW9uKG9wdHMpe1xuICAgICAgICAgICAgdXRpbHMuZGVlcEV4dGVuZChzZXR0aW5ncywgb3B0cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXRlLFxuICAgICAgICAgICAgICAgIGZyb21MZWZ0ID0gYWN0aW9uLnRyYW5zbGF0ZS5nZXQubWF0cml4KDQpO1xuICAgICAgICAgICAgaWYgKGZyb21MZWZ0ID09PSBzZXR0aW5ncy5tYXhQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHN0YXRlID0gJ2xlZnQnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmcm9tTGVmdCA9PT0gc2V0dGluZ3MubWluUG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9ICdyaWdodCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXRlID0gJ2Nsb3NlZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgICAgICBpbmZvOiBjYWNoZS5zaW1wbGVTdGF0ZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIGluaXQodXNlck9wdHMpO1xuICAgIH07XG4gICAgaWYgKCh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBTbmFwO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuZGVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLlNuYXAgPSBTbmFwO1xuICAgIH1cbiAgICBpZiAoKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIikgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoXCJzbmFwXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBTbmFwO1xuICAgICAgICB9KTtcbiAgICB9XG59KS5jYWxsKHRoaXMsIHdpbmRvdywgZG9jdW1lbnQpOyJdfQ==
