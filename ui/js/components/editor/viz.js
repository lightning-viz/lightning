                
var React = require('react');
var _ = require('lodash');


var Editor = React.createClass({

    getInitialState: function() {
        return {
            viz: null
        };
    },

    componentDidMount: function() {
        // initialize the viz
        var Viz = require(this.props.name);
        this.setState({
            viz: new Viz('#live-visualization-in-editor', this.props.data)
        });
    },

    componentDidUpdate: function(prevProps, prevState) {
        prevState.viz && 
        prevState.viz.updateData && 
        prevState.viz.updateData(prevProps.data);
    },

    render: function() {
        return (
            <div id="live-visualization-in-editor">
            </div>
        );
    },
});

module.exports = Editor;


