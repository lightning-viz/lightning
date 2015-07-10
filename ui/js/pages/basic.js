require('../lib/bigSlide');
$('.menu-link').bigSlide();

var hljs = require('highlight.js');
hljs.initHighlightingOnLoad();


$('[data-confirm]').click(function(e) {
    if(!confirm($(this).data('confirm'))) {
        e.preventDefault();
    }
});


var $vizPreview = $('.viz-preview');
$vizPreview.css('height', $vizPreview.width());

require('../lib/dropit');
$('[data-dropit]').dropit();
