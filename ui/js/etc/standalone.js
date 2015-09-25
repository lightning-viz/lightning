
var jQueryURL = '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js';

// require all the default viz's
require('lightning-adjacency');
require('lightning-circle');
require('lightning-force');
require('lightning-gallery');
require('lightning-graph');
require('lightning-graph-bundled');
require('lightning-image');
require('lightning-image-poly');
require('lightning-line');
require('lightning-line-streaming');
require('lightning-map');
require('lightning-matrix');
require('lightning-scatter');
require('lightning-scatter-streaming');
require('lightning-scatter-3');
require('lightning-volume');
require('lightning-vega-lite');

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
    $('.feed-item[data-initialized=false]').each(function() {
        var $this = $(this);
        var type = $this.data('type');
        var data = $this.data('data');
        var images = $this.data('images');
        var options = $this.data('options');
        var vid = $this.attr('id');

        var Viz;
        try {
            require(type);
        } catch(e) {
            Viz = require('lightning-' + type);
        }

        new Viz('#' + vid, data, images, options);
        $this.data('initialized', true);
        $this.attr('data-initialized', true);

        $('.feed-container').animate({opacity: 1});
    });
}

if(!window.$) {
    loadJS(jQueryURL, init);
} else {
    init();
}

window.lightning = window.lightning || {};
window.lightning.initVisualizations = init;

