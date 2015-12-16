#!/usr/bin/env node

var forever = require('forever');
var path = require('path');

var script = path.resolve(__dirname + '/../server.js');
forever.start(script, {});
