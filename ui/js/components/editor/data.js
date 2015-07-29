                
var React = require('react');
var _ = require('lodash');
var Highlight = require('react-highlight');
var Editor = require('./editor');
var Immutable = require('immutable');

var styles = {
};


var Data = React.createClass({

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

    handleEdit: function(val) {
        try {
            var selectedData = JSON.parse(val);
        } catch(e) {
            console.log(e);
            return;
        }
        this.setState({
            selectedData: selectedData
        });
        this.props.onDataChange(selectedData);
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
            <div key={i}>
                <button className={'data-button'} onClick={this.handleSelectDataset.bind(this, i)} >
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
        var d;
        if(data instanceof Immutable.Map) {
            d = data.toObject();
        } else if (data instanceof Immutable.List) {
            d = data.toArray();
        }
        return '{\n' + _.map(d, function(val, key) {
            return '\t\"' + key + "\": " + JSON.stringify(val).split(',').join(', ');
        }).join(',\n') + '\n}';
    },

    render: function() {
        return (
            <div style={{width: '65%', margin: '0 auto'}}>
                <div className='data-container' style={{width: '20%', float: 'left'}}>
                    {this.renderDatasets()}
                </div>
                <div style={{width: '78%', float: 'left', marginLeft: '2%'}}>
                    <Editor className='json' initialValue={this.formatData(this.state.selectedData)} onChange={this.handleEdit} />
                </div>
            </div>
        );
    },
});

module.exports = Data;


