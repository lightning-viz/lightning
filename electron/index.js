var menubar = require('menubar');
var ipc = require('ipc');

var mb = menubar({
    dir: __dirname,
    width: 290,
    height: 82
});

mb.on('ready', function ready () {
  // your app code here
  require('../server');
});

ipc.on('terminate', function terminate (ev) {
    canQuit = true
    mb.app.terminate()
})
