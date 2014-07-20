'use strict';
//
// This module is used to share a global eventEmmiter 
// object across all the files
//

var events = require('events');
var eventEmitter = new events.EventEmitter();

module.exports = eventEmitter;
