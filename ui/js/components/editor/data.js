                
var React = require('react');
var _ = require('lodash');
var Highlight = require('react-highlight');

var styles = {
};


var Editor = React.createClass({

    getDefaultProps: function() {
        return {
            initialSelectedData: {},
            datasets: [],
        }
    },

    getInitialState: function() {
        return {
            selectedData: this.props.initialSelectedData
        };
    },

    handleSelectDataset: function(i) {
        var selectedData = this.props.datasets[i].data;
        this.props.onDataChange(selectedData);
        this.setState({
            selectedData: selectedData
        });
    },

    renderDataset: function(dataset, i) {
        return (
            <button className={'data-button'} onClick={this.handleSelectDataset.bind(this, i)} key={i}>
                {dataset.name}
            </button>
        );
    },

    renderDatasets: function() {
        return _.map(this.props.datasets, this.renderDataset, this);
    },

    componentDidUpdate: function(prevProps, prevState) {
    },

    formatData: function(data) {
        return '{\n' + _.map(data, function(val, key) {
            return '\t\"' + key + "\": " + JSON.stringify(val).split(',').join(', ') + ',';
        }).join('\n') + '\n}';
    },

    render: function() {
        return (
            <div>
                <div className='data-container'>
                    {this.renderDatasets()}
                </div>
                <div contentEditable={true}>
                    <Highlight className='json'>
                        {this.formatData(this.state.selectedData)}
                    </Highlight>
                </div>
            </div>
        );
    },
});

module.exports = Editor;


