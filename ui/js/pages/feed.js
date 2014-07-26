var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length, document.URL.lastIndexOf('/feed'));

require('../viz/line');
require('../viz/pca');
require('../viz/scatter');

var socket = io.connect('/sessions/' + sid);

socket.on('viz', function (viz) {

    $('.feed-container .empty').remove();


    console.log(viz);

    var Viz = require('../viz/' + viz.type);

    $('.feed-container').prepend('<div class="feed-item"></div><div class="permalink"><a href="/sessions/' + sid + '/visualizations/' + viz._id + '">permalink</a></div><hr>');
    new Viz('.feed-container .feed-item', viz.data);
});


$('.feed-item').each(function() {

    var type = $(this).data('type');
    var data = $(this).data('data');

    var Viz = require('../viz/' + type);
    new Viz('#' + $(this).attr('id'), data);
});
