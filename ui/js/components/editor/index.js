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
                <div className={'editor-code-container'}>
                    <div className={'visualization-type'}>
                        <div className={'section-header'}>
                            <h3>Data</h3>
                        </div>
                        <DataComponent datasets={this.props.datasets} selectedData={this.state.data} onDataChange={this.handleDataChange} />
                    </div>
                </div>
                <div className={'editor-viz-container'}>
                    <VizComponent data={this.state.data} name={this.props.name} />
                </div>
            </div>
        );
    },
});

module.exports = Editor;
