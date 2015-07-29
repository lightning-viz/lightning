                
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
            <div>
                <button className={'data-button'} onClick={this.handleSelectDataset.bind(this, i)} key={i}>
                    {dataset.name}
                </button>
            </div>
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
            <div style={{width: '65%', margin: '0 auto'}}>
                <div className='data-container' style={{width: '20%', float: 'left'}}>
                    {this.renderDatasets()}
                </div>
                <div style={{width: '78%', float: 'left', marginLeft: '2%'}}>
                    <Highlight className='json'>
                        {this.formatData(this.state.selectedData)}
                    </Highlight>
                </div>
            </div>
        );
    },
});

module.exports = Editor;


