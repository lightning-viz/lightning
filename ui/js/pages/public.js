
window.define = undefined;
window.lightningDebug = require('debug');

var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length);
sid = sid.slice(0, sid.indexOf('/'));
sid = (window.lightning || {}).sid || sid;

var utils = require('../utils');
var debug = require('debug')('lightning:ui:pages:feed');

var socket;
var io = window.io || false;

if(io) {
    var namespace = utils.getNamespaceForSession(sid);
    debug('connecting to ' + namespace);
    socket = io.connect(namespace);
} else {
    socket = {
        on: function(){}
    };
}

var vizs = {};

socket.on('append', function(message) {
    debug('append');
    var vizId = message.vizId;
    var data = message.data;

    if(vizs[vizId].appendData) {
        vizs[vizId].appendData(data);
    }
});

socket.on('update', function(message) {
    debug('update');
    var vizId = message.vizId;
    var data = message.data;

    if(vizs[vizId].updateData) {
        vizs[vizId].updateData(data);    
    }
});


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
