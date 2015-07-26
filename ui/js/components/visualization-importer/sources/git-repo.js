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


var Git = React.createClass({

    getDefaultProps: function() {
        return {
            initialImportPreview: 'import',
            initialName: '',
            initialUrl: ''
        }
    },

    getInitialState: function() {
        return {
            importPreview: this.props.initialImportPreview,
            name: this.props.initialName,
            url: this.props.initialUrl
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

    handleSelectImportPreview: function(importPreview) {
        this.setState({
            importPreview: importPreview
        });
    },

    handleChangeURL: function(event) {
        this.setState({
            url: event.target.value
        });  
    },
    handleChangeName: function(event) {
        this.setState({
            name: event.target.value
        });  
    },

    handleSubmit: function() {
        if(isEmpty(this.state.url) || isEmpty(this.state.name)) {
            return;
        }

        var url = '/visualization-types/load/' + this.state.importPreview + '/git/';
        url += '?' + this.serialize({
            url: this.state.url,
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
                    Repo URL: 
                    <input type={'text'} onChange={this.handleChangeURL} value={this.state.url} />
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

module.exports = Git;
