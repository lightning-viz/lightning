'use strict';

var React = require('react');
var _ = require('lodash');
var RadioGroup = require('react-radio-group');
var request = require('superagent');


var styles = {
    radioInput: {
        display: 'none'
    }
};

var isEmpty = function(str) {
  return str.replace(/^\s+|\s+$/g, '').length == 0;
}


var Local = React.createClass({

    getInitialState: function() {
        return {
            name: '',
            path: ''
        }
    },

    serialize: function(obj) {
        var str = [];
        for(var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    },

    handleChangePath: function(event) {
        this.setState({
            path: event.target.value
        });  
    },
    handleChangeName: function(event) {
        this.setState({
            name: event.target.value
        });  
    },

    handleSubmit: function() {
        if(isEmpty(this.state.path) || isEmpty(this.state.name)) {
            return;
        }

        var url = '/visualization-types/load/preview/local/';
        url += '?' + this.serialize({
            path: this.state.path,
            name: this.state.name
        });

        window.location.href = url;
    },

    renderImportPreviewRadioGroup: function(Radio) {
        var radios = [{
            name: 'import',
            label: 'Import'
        }, {
            name: 'preview',
            label: 'Preview'
        }];

        var styleRadio = function(radio, i) {
            var rLen = Object.keys(radios).length;
            return (
                <label 
                    className={'button-group-label ' + (this.state.importPreview === radio.name ? 'selected' : '')} 
                    style={{width: i === rLen ? null : (100 * (1 / rLen)) + '%'}}
                    key={i}>
                    <Radio value={radio.name} style={styles.radioInput} />{radio.label}
                </label>
            );

        };

        return (
            <div className={'button-group'}>
                {radios.map(styleRadio.bind(this))}
            </div>
        );
    },

    render: function() {

        return (
            <div>
                <div>
                    Folder Path: 
                    <input type={'text'} onChange={this.handleChangePath} />
                </div>
                <div>
                    Visualization Name:
                    <input type={'text'} onChange={this.handleChangeName} />
                </div>
                <div className={'button'} onClick={this.handleSubmit}>
                    Submit
                </div>

            </div>
        );
    },
});

module.exports = Local;
