var menubar = require('menubar');
var server;

var mb = menubar({
    dir: __dirname,
    width: 290,
    height: 82
});

mb.on('ready', function ready () {
  // your app code here
  server = require('../server');
});




var stopServer = function() {
    server.close();
}

var startServer = function() {
    console.log('attempting to start server');
}