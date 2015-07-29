var React = require('react');
var _ = require('lodash');
var Immutable = require('immutable');
// var RadioGroup = require('react-radio-group');
// var Sources = require('./sources');

var DataComponent = require('./data');
var VizComponent = require('./viz');
require('../../lib/bigSlide');

var styles = {
};

var parseData = function(d) {
    if(_.isArray(d)) {
        d = Immutable.List(d);
    } else if(_.isObject(d)) {
        d = Immutable.Map(d);
    }
    return d;
}

var Editor = React.createClass({

    getDefaultProps: function() {
        return {
            datasets: window.lightning.editor.datasets || [],
            name: window.lightning.editor.name || ''
        };
    },

    getInitialState: function() {
        return {
            data: parseData(this.props.datasets.length ? this.props.datasets[0].data : [])
        };
    },

    componentDidMount: function() {
        $('.menu-link').bigSlide();
    },

    handleDataChange: function(data) {
        this.setState({
            data: parseData(data)
        });
    },
    render: function() {
        return (
            <div>
                <div className={'editor-outer-section wrap push'}>
                    <div className={'row editor-inner-section'}>
                        <div className={'editor-viz-container'}>
                            <VizComponent data={this.state.data} name={this.props.name} />
                        </div>
                    </div>
                </div>
                <div className={'editor-outer-section wrap push data-component'}>
                    <div className={'row editor-inner-section'}>
                        <div className={'editor-code-container'}>
                            <div className={'visualization-type'}>
                                <DataComponent datasets={this.props.datasets} initialSelectedData={this.state.data} onDataChange={this.handleDataChange} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});

module.exports = Editor;
