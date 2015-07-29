var React = require('react');
var _ = require('lodash');
// var RadioGroup = require('react-radio-group');
// var Sources = require('./sources');

var DataComponent = require('./data');
var VizComponent = require('./viz');

var styles = {
};

var Editor = React.createClass({

    getDefaultProps: function() {
        return {
            datasets: window.lightning.editor.datasets || [],
            name: window.lightning.editor.name || ''
        };
    },

    getInitialState: function() {
        return {
            data: this.props.datasets.length ? this.props.datasets[0].data : null
        };
    },

    handleDataChange: function(data) {
        this.setState({
            data: data
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
