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


var NPM = React.createClass({

    getDefaultProps: function() {
        return {
            initialLocation: 'registry',
            initialImportPreview: 'import',
            initialName: ''
        };
    },

    getInitialState: function() {
        return {
            location: this.props.initialLocation,
            importPreview: this.props.initialImportPreview,
            name: this.props.initialName
        };
    },

    serialize: function(obj) {
        var str = [];
        for(var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    },

    handleSelectLocation: function(location) {
        this.setState({
            location: location
        });
    },

    handleSelectImportPreview: function(importPreview) {
        this.setState({
            importPreview: importPreview
        });
    },

    handleNameChange: function(event) {
        this.setState({
            name: event.target.value
        });  
    },

    handleSubmit: function() {
        if(isEmpty(this.state.name)) {
            return;
        }

        var url = '/visualization-types/load/' + this.state.importPreview + '/npm/' + this.state.location;
        url += '?' + this.serialize({
            name: this.state.name
        });

        window.location.href = url;
    },

    renderLocationRadioGroup: function(Radio) {
        var radios = [{
            name: 'registry',
            label: 'Registry'
        }, {
            name: 'local',
            label: 'Local Module'
        }];

        var styleRadio = function(radio, i) {
            var rLen = Object.keys(radios).length;
            return (
                <label 
                    className={'button-group-label ' + (this.state.location === radio.name ? 'selected' : '')} 
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
                    Select Location: 
                    <RadioGroup selectedValue={this.state.location} onChange={this.handleSelectLocation}>
                        {this.renderLocationRadioGroup}
                    </RadioGroup>
                </div>
                <div>
                    Preview or Import?
                    <RadioGroup selectedValue={this.state.importPreview} onChange={this.handleSelectImportPreview}>
                        {this.renderImportPreviewRadioGroup}
                    </RadioGroup>
                </div>
                <div>
                    Module Name: 
                    <input type={'text'} onChange={this.handleNameChange} value={this.state.name} />
                </div>
                <div className={'button'} onClick={this.handleSubmit}>
                    Submit
                </div>

            </div>
        );
    },
});

module.exports = NPM;
