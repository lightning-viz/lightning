
var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));

var vizs = {};

var pym = require('pym.js');
var pymChild = new pym.Child();



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

loadJS(window.lightning.host + 'js/dynamic/viz/?visualizations[]=' + window.lightning.requiredVizTypes.join('&visualizations[]='), function() { 
    
    $('.feed-item[data-initialized=false]').each(function() {

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

            var viz = new Viz('#' + $this.attr('id'), data, images, options);

            vizs[vid.slice(vid.indexOf('-') + 1)] = viz;

            if(viz.on) {
                
                viz.on('image:loaded', function() {
                    pymChild.sendHeight();
                });

                viz.on('size:updated', function() {
                    pymChild.sendHeight(); 
                })
            }


            $this.data('initialized', true);
            $this.attr('data-initialized', true);

            pymChild.sendHeight();
            
        });
    });

    $('.feed-container').animate({opacity: 1});


});

