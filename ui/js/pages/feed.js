var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));
var feedItemHTML = require('../../templates/feed-item.jade');


require('../viz/line');
require('../viz/pca');
require('../viz/scatter');
require('../viz/volume');
require('../viz/image');
require('../viz/roi');
require('../viz/gallery');

require('../lib/bigSlide');
$('.menu-link').bigSlide();


console.log('connecting to ' + '/sessions/' + sid);
var socket = io.connect('/sessions/' + sid);

var vizs = {};

socket.on('viz', function (viz) {

    $('.feed-container .empty').remove();

    var Viz = require('../viz/' + viz.type);

    $('.feed-container').prepend(feedItemHTML({
        sid: sid,
        vid: viz.id
    }));
    vizs[viz.id] = new Viz('.feed-container .feed-item', viz.data, viz.images);
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
    var data = $(this).data('data');
    var images = $(this).data('images');

    var Viz = require('../viz/' + type);

    var vid = $(this).attr('id');
    vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + $(this).attr('id'), data, images);
});
