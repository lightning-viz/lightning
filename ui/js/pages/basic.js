require('../lib/bigSlide');
$('.menu-link').bigSlide();

var hljs = require('highlight.js');
hljs.initHighlightingOnLoad();

var loading = require('../views/loading');


$('.loading').each(function() {
    var self = $(this);
    setTimeout(function() {
        loading(self[0]);
    });
    
});