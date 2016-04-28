
window.define = undefined;

var vizs = {};


setTimeout(function() {
    $('.feed-item[data-initialized=false]').each(function() {

        var type = $(this).data('type');
        var data = $(this).data('data');
        var images = $(this).data('images');
        var options = $(this).data('options');
        var Viz =  require(type);

        var vid = $(this).attr('id');
        vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + $(this).attr('id'), data, images, options);
        $(this).data('initialized', true);
        $(this).attr('data-initialized', true);
    });

    $('.feed-container').animate({opacity: 1});

}, 0);



var socket;
var io = window.io || false

if(io) {
    var namespace = utils.getNamespaceForSession(sid);
    debug('connecting to ' + namespace);
    socket = io.connect(namespace);
} else {
    socket = {
        on: function(){}
    }
}
