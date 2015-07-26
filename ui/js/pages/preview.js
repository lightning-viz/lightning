var React = require('react');

var Editor = require('../components/editor');
React.render(<Editor /> , document.getElementById('editor-component'));

var VisualizationImporter = require('../components/visualization-importer');

var defaults = window.lightning.editor;
React.render(<VisualizationImporter initialSource={defaults.source} importPreview={"import"} path={defaults.path} url={defaults.url} name={defaults.name} location={defaults.location}  /> , document.getElementById('visualization-importer'));

require('../lib/modal');
