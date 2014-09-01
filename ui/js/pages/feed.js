var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));
var feedItemHTML = require('../../templates/feed-item.jade');

var request = require('superagent');


// require('../viz/line');
// require('../viz/pca');
// require('scatter');
// require('../viz/volume');
// require('../viz/image');
// require('roi');
// require('../viz/roi-image');
// require('../viz/gallery');

require('../viz/force-bundle');

require('../lib/bigSlide');
$('.menu-link').bigSlide();


console.log('connecting to ' + '/sessions/' + sid);
var socket = io.connect('/sessions/' + sid);

var vizs = {};

socket.on('viz', function (viz) {

    $('.feed-container .empty').remove();

    // var Viz = require('../viz/' + viz.type);
    var Viz = require(viz.type);

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

    // var Viz = require('../viz/' + type);
    // var Viz = require(type);
    var Viz = require('../viz/force-bundle');

    var vid = $(this).attr('id');
    vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + $(this).attr('id'), data, images);
});


$('[data-editable]').each(function() {
    
    var $this = $(this);

    // append a hidden input after
    var $input = $('<input type="text" class="editable ' + $this.prop('tagName').toLowerCase() + '" />');
    $this.after($input);

    // allow editable
    $this.click(function() {
        var text = $this.text();
        $this.hide();
        $input.val(text);
        $input.show().focus();

        $input.unbind('blur').blur(function() {
            var url = '/' + $this.data('model').toLowerCase() + 's' + '/' + $this.data('model-id');
            var params = {};
            params[$this.data('key')] = $input.val();

            $this.text($input.val());
            $this.show();
            $input.hide();

            request.put(url, params, function(error, res){
                if(error) {
                    return console.log(error);
                } else {
                    return console.log('success');
                }
            });
        });
    });
});

