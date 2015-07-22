var menubar = require('menubar')

var mb = menubar({
    dir: __dirname,
    width: 290,
    height: 82
})

mb.on('ready', function ready () {
  console.log('app is ready')
  // your app code here
  require('./server');
})
