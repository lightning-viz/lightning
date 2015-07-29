                
var React = require('react');
var _ = require('lodash');


var Editor = React.createClass({

    getInitialState: function() {
        return {
            viz: null
        };
    },

    createViz: function() {
        var Viz = require(this.props.name);
        this.setState({
            viz: new Viz('#live-visualization-in-editor', this.props.data.toJS())
        });
    },

    componentDidMount: function() {
        // initialize the viz
        this.createViz();
    },

    componentDidUpdate: function(prevProps, prevState) {
        if(prevState.viz) {
            if(prevProps.data !== this.props.data) {
                var vizEl = $('#live-visualization-in-editor');
                vizEl.css('min-height', vizEl.height()).html('');
                this.createViz();
            }
        }
    },

    render: function() {
        return (
            <div id="live-visualization-in-editor" style={{outline: 'none'}}>
            </div>
        );
    },
});

module.exports = Editor;


