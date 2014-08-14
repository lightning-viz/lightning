var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));


var request = require('superagent');

require('../viz/line');
require('../viz/pca');
require('../viz/scatter');
require('../viz/image');
require('../viz/roi');

require('../lib/bigSlide');
$('.menu-link').bigSlide();


console.log('connecting to ' + '/sessions/' + sid);
var socket = io.connect('/sessions/' + sid);

var vizs = {};

socket.on('viz', function (viz) {

    $('.feed-container .empty').remove();


    console.log(viz);

    var Viz = require('../viz/' + viz.type);

    $('.feed-container').prepend('<div class="feed-item"></div><div class="permalink"><a href="/sessions/' + sid + '/visualizations/' + viz._id + '">permalink</a></div><hr>');
    vizs[viz._id] = new Viz('.feed-container .feed-item', viz.data, viz.images);
});


socket.on('update', function(message) {

    console.log('got update');
    console.log(message);

    var vizId = message.vizId;
    var data = message.data;

    vizs[vizId].updateData(data);
});


$('.feed-item').each(function() {

    var type = $(this).data('type');
    var images = $(this).data('images');

    var Viz = require('../viz/' + type);

    var vid = $(this).attr('id');


    request.get('/sessions/' + sid + '/visualizations/' + vid.slice(vid.indexOf('-') + 1) + '/data/', function(res) {
        console.log(res.body.data);
        vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + vid, res.body.data, images);
    });

});
