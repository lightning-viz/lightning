
window.define = undefined;

require('../lib/modal');

var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));
sid = (window.lightning || {}).sid || sid;
var feedItemHTML = require('../../templates/feed-item.jade');

var request = require('superagent');
var marked = require('marked');

var utils = require('../utils');


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

    console.log('got viz');
    utils.requireOrFetchViz(viz.type, function(err, Viz) {
        if(err) {
            return console.log(err);
        }

        console.log(Viz);
        $('.feed-container').prepend(feedItemHTML({
            sid: sid,
            vid: viz.id
        }));

        vizs[viz.id] = new Viz('.feed-container .feed-item', viz.data, viz.images, viz.opts);

        $('.edit-description').unbind().click(editDesctiption);
    });

});


socket.on('append', function(message) {

    var vizId = message.vizId;
    var data = message.data;

    if(vizs[vizId].appendData) {
        vizs[vizId].appendData(data);
    }
});

socket.on('update', function(message) {

    var vizId = message.vizId;
    var data = message.data;

    if(vizs[vizId].updateData) {
        vizs[vizId].updateData(data);    
    }
});


setTimeout(function() {


    $('.feed-item[data-initialized=false]').each(function() {

        console.log($(this));

        var type = $(this).data('type');
        var data = $(this).data('data');
        var images = $(this).data('images');
        var options = $(this).data('options');

        var Viz =  require('viz/' + type);

        var vid = $(this).attr('id');
        vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + $(this).attr('id'), data, images, options);
        $(this).data('initialized', true);
        $(this).attr('data-initialized', true);
    });

    $('.feed-container').animate({opacity: 1});


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

}, 0);


var editDesctiption = function(e) {

    e.preventDefault();

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
};

$('.edit-description').click(editDesctiption);

$('#data-input-form').submit(function(e) {
    e.preventDefault();

    var url = $(this).attr('action');
    console.log(url);

    var params = {};
    var inputs = $(this).serializeArray();
    $.each(inputs, function (i, input) {
        params[input.name] = input.value;
    });

    params.data = JSON.parse(params.data);

    console.log(params);


    request.post(url, params, function(error, res){
        if(error) {
            return console.log(error);
        } else {
            console.log('success');
            $.modal.close();
        }
    });
})

