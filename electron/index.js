var menubar = require('menubar');
var ipc = require('ipc');
var shell = require('shell')

var mb = menubar({
    dir: __dirname,
    width: 310,
    height: 82
});

mb.on('ready', function ready () {
  require('../server');
})

ipc.on('browser', function browser (ev) {
	shell.openExternal('http://localhost:3000')
})

ipc.on('terminate', function terminate (ev) {
    canQuit = true
    mb.app.terminate()
})