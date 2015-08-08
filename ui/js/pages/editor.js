require('../lib/bigSlide');
$('.menu-link').bigSlide();


$('[data-confirm]').click(function(e) {
    if(!confirm($(this).data('confirm'))) {
        e.preventDefault();
    }
});

var React = require('react');

var Editor = require('../components/editor');
React.render(<Editor /> , document.getElementById('editor-component'));
