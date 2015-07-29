                
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
            viz: new Viz('#live-visualization-in-editor', _.clone(this.props.data))
        });

        // setTimeout(function() {
        //     var $container = $('#live-visualization-in-editor').addClass('fixed');
        //     if($(window).height() < 900) {
        //         $container.css('max-height', $(window).height() * 0.95).css('overflow-y', 'scroll');
        //     }
        // }, 500);

    },

    componentDidUpdate: function(prevProps, prevState) {
        var viz = this.state.viz;
        viz && viz.updateData && viz.updateData(_.clone(prevProps.data));
    },

    render: function() {
        return (
            <div id="live-visualization-in-editor" style={{outline: 'none'}}>
            </div>
        );
    },
});

module.exports = Editor;


