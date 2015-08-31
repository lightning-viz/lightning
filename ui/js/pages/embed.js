var jQueryURL = '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js';


var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));
sid = (window.lightning || {}).sid || sid;

var vizs = {};


var utils = require('../utils');

var socket;
io = window.io || false

if(io) {
    var namespace = utils.getNamespaceForSession(sid);
    console.log('connecting to ' + namespace);
    socket = io.connect(namespace);
} else {
    socket = {
        on: function(){}
    }
}


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


function loadJS(src, callback) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onreadystatechange = s.onload = function() {
        var state = s.readyState;
        if (!callback.done && (!state || /loaded|complete/.test(state))) {
            callback.done = true;
            callback();
        }
    };
    document.getElementsByTagName('head')[0].appendChild(s);
}


function init() {

    loadJS(window.lightning.host + 'js/dynamic/viz/?visualizations[]=' + window.lightning.requiredVizTypes.join('&visualizations[]='), function() { 
        
        $('.feed-item[data-initialized=false]').each(function() {

            var type = $(this).data('type');
            var data = $(this).data('data');
            var images = $(this).data('images');
            var options = $(this).data('options');

            var $this = $(this);


            utils.requireOrFetchViz({name: type}, function(err, Viz) {
                if(err) {
                    return console.log(err);
                }

                var vid = $this.attr('id');
                vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + $this.attr('id'), data, images, options);
                $this.data('initialized', true);
                $this.attr('data-initialized', true);
            });
        });

        $('.feed-container').animate({opacity: 1});
    });


    // window.require = window._require;
    // window.define = window._define;
}

if(!window.$) {
    loadJS(jQueryURL, init);
} else {
    init();
}
