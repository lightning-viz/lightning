require('../lib/bigSlide');
$('.menu-link').bigSlide();

var React = require('react');

var Editor = require('../components/editor');
React.render(<Editor /> , document.getElementById('editor-component'));
