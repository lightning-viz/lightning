
window.define = undefined;


var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));
var feedItemHTML = require('../../templates/feed-item.jade');

var request = require('superagent');
var marked = require('marked');

require('../viz/line');
require('../viz/pca');
require('../viz/scatter');
require('../viz/volume');
require('../viz/image');
require('../viz/roi');
require('../viz/roi-image');
require('../viz/gallery');
require('../viz/force-bundle');
require('../viz/force-directed-network');
require('../viz/stacked-line');
require('../viz/matrix');
require('../viz/map');

require('../lib/bigSlide');
$('.menu-link').bigSlide();

var hljs = require('highlight.js');
hljs.initHighlightingOnLoad();


var socket;
io = window.io || false

if(io) {
    console.log('connecting to ' + '/sessions/' + sid);
    socket = io.connect('/sessions/' + sid);
} else {
    socket = {
        on: function(){}
    }
}

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


$('.feed-item[data-initialized=false]').each(function() {

    console.log($(this));

    var type = $(this).data('type');
    var data = $(this).data('data');
    var images = $(this).data('images');

    var Viz = require('../viz/' + type);

    var vid = $(this).attr('id');
    vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + $(this).attr('id'), data, images);
    $(this).data('initialized', true);
    $(this).attr('data-initialized', true);
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


$('.edit-description').click(function() {
    var $this = $(this);
    var $itemContainer = $this.closest('.feed-item-container');
    var h = Math.max($itemContainer.find('.description').height(), 300);

    var $editor = $itemContainer.find('.description-editor');
    var $description = $itemContainer.find('.description');

    $itemContainer.find('.edit-description a').hide();
    $description.hide();
    $editor.height(h).show();


    $editor.find('textarea').focus().unbind('blur').blur(function() {

        var text = $editor.find('textarea').val();
        $description.html(marked(text)).show();
        $editor.hide();
        $itemContainer.find('.edit-description a').show();

        var url = '/' + $itemContainer.data('model').toLowerCase() + 's' + '/' + $itemContainer.data('model-id');
        var params = {};

        params.description = text;

        request.put(url, params, function(error, res){
            if(error) {
                return console.log(error);
            } else {
                return console.log('success');
                  $('pre code').each(function(i, block) {
                    hljs.highlightBlock(block);
                  });
            }
        });
    });
});

