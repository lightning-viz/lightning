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

    getDefaultProps: function() {
        return {
            initialImportPreview: 'import',
            initialName: '',
            initialPath: ''
        }
    },

    getInitialState: function() {
        return {
            importPreview: this.props.initialImportPreview,            
            name: this.props.initialName,
            path: this.props.initialPath
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

    handleSelectImportPreview: function(importPreview) {
        this.setState({
            importPreview: importPreview
        });
    },

    handleSubmit: function() {
        if(isEmpty(this.state.path) || isEmpty(this.state.name)) {
            return;
        }

        var url = '/visualization-types/load/' + this.state.importPreview + '/local/';
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
                    Preview or Import?
                    <RadioGroup selectedValue={this.state.importPreview} onChange={this.handleSelectImportPreview}>
                        {this.renderImportPreviewRadioGroup}
                    </RadioGroup>
                </div>
                <div>
                    Folder Path: 
                    <input type={'text'} onChange={this.handleChangePath} value={this.state.path} />
                </div>
                <div>
                    Visualization Name:
                    <input type={'text'} onChange={this.handleChangeName} value={this.state.name} />
                </div>
                <div className={'button'} onClick={this.handleSubmit}>
                    Submit
                </div>

            </div>
        );
    },
});

module.exports = Local;
