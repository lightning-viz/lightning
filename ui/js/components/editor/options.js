'use strict';                
var React = require('react');
var _ = require('lodash');
var Highlight = require('react-highlight');
var Editor = require('./editor');
var Immutable = require('immutable');

var styles = {
};


var Options = React.createClass({

    getDefaultProps: function() {
        return {
            initialOptions: {}
        };
    },

    getInitialState: function() {
        console.log('getInitialState');
        console.log(this.props.initialOptions);
        return {
            options: this.props.initialOptions
        };
    },

    handleEdit: function(val) {
        var selectedData;
        try {
            selectedData = JSON.parse(val);
        } catch(e) {
            return;
        }
        this.setState({
            options: selectedData
        });
        this.props.onChange(selectedData);
    },

    formatData: function(data) {
        var d = data;
        if(data instanceof Immutable.Map) {
            d = data.toObject();
        } else if (data instanceof Immutable.List) {
            d = data.toArray();
        }
        return '{\n' + _.map(d, function(val, key) {
            return '    \"' + key + '\": ' + JSON.stringify(val).split(',').join(', ');
        }).join(',\n') + '\n}';
    },

    render: function() {
        return (
            <div style={{width: '100%'}}>
                <Editor className='json' value={this.formatData(this.state.options)} onChange={this.handleEdit} />
            </div>
        );
    },
});

module.exports = Options;


