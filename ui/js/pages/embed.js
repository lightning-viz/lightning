

var jQueryURL = '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js';


var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));

var vizs = {};


var utils = require('../utils');

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

            console.log($(this));

            var type = $(this).data('type');
            var data = $(this).data('data');
            var images = $(this).data('images');
            var options = $(this).data('options');

            var $this = $(this);


            utils.requireOrFetchViz(type, function(err, Viz) {
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
