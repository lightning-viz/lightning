'use strict';                
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
        };
    },

    getInitialState: function() {
        return {
            selectedData: this.props.initialSelectedData,
            selectedIndex: 0
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
        this.props.onChange(selectedData);
    },

    handleSelectDataset: function(i) {
        var selectedData = this.props.datasets[i].data;
        this.props.onChange(selectedData);
        this.setState({
            selectedIndex: i,
            selectedData: selectedData
        });
    },

    renderDataset: function(dataset, i) {
        return (
            <div key={i} style={{display: 'inline-block'}}>
                <button className={'data-button ' + (i === this.state.selectedIndex ? 'active' : '')} onClick={this.handleSelectDataset.bind(this, i)} >
                    {dataset.name}
                </button>
            </div>
        );
    },

    renderDatasets: function() {
        if(this.props.datasets.length > 1) {
            return _.map(this.props.datasets, this.renderDataset, this);
        }
        return null;
    },

    formatData: function(data) {
        var d = data;
        if(data instanceof Immutable.Map) {
            d = data.toObject();
        } else if (data instanceof Immutable.List) {
            d = data.toArray();
        }
        return '{\n' + _.map(d, function(val, key) {
            return '    \"' + key + "\": " + JSON.stringify(val).split(',').join(', ');
        }).join(',\n') + '\n}';
    },

    render: function() {
        return (
            <div style={{width: '100%', margin: '0 auto'}}>
                <div>
                    <Editor className='json' value={this.formatData(this.state.selectedData)} onChange={this.handleEdit} />
                </div>
                <div style={{width: '100%'}}>
                    {this.renderDatasets()}
                </div>
            </div>
        );
    },
});

module.exports = Data;


