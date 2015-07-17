var React = require('react');

var $vizPreview = $('.viz-preview');
$vizPreview.css('height', $vizPreview.width());

var VisualizationImporter = require('../components/visualization-importer');
React.render(<VisualizationImporter /> , document.getElementById('visualization-importer'));

require('../lib/modal');
