'use strict';
var React = require('react');
var _ = require('lodash');


var Viz = React.createClass({

    getInitialState: function() {
        return {
            viz: null
        };
    },

    createViz: function() {
        var Viz = require(this.props.moduleName);
        this.setState({
            viz: new Viz('#live-visualization-in-editor', this.props.data.toJS(), this.props.images, this.props.options.toJS())
        });
    },

    componentDidMount: function() {
        // initialize the viz
        this.createViz();
    },

    componentDidUpdate: function(prevProps, prevState) {
        console.log('componentDidUpdate');
        if(prevState.viz) {
            if(prevProps.data !== this.props.data || prevProps.options !== this.props.options) {
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

module.exports = Viz;


