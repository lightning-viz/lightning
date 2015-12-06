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

var locations = {
  remote: {
    label: 'Remote',
    inputLabel: 'Module Name',
    inputHelp: 'Use <em>username/reponame</em> to import module from github',
    key: 'name'
  },
  local: {
    label: 'Local',
    inputLabel: 'Folder Path',
    inputHelp: 'e.g. /Users/username/my-visualization',
    key: 'path'
  },

}


var NPM = React.createClass({

    getDefaultProps: function() {
        return {
            initialLocation: 'remote',
            initialImportPreview: 'import',
            initialTextVal: ''
        };
    },

    getInitialState: function() {
        return {
            location: this.props.initialLocation,
            importPreview: this.props.initialImportPreview,
            textVal: this.props.initialTextVal
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

    handleTextValChange: function(event) {
        this.setState({
            textVal: event.target.value
        });
    },

    handleSubmit: function() {
        if(isEmpty(this.state.textVal)) {
            return;
        }

        var url = '/visualization-types/load/' + this.state.importPreview + '/' + this.state.location;

        var serializeObj = {};
        serializeObj[locations[this.state.location].key] = this.state.textVal;
        url += '?' + this.serialize(serializeObj);

        window.location.href = url;
    },

    renderLocationRadioGroup: function(Radio) {
        var radios = [{
            name: 'remote',
            label: 'Remote'
        }, {
            name: 'local',
            label: 'Local'
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
                    {locations[this.state.location].inputLabel}:
                    <br/>
                    <label><small dangerouslySetInnerHTML={{__html: locations[this.state.location].inputHelp}}></small></label>
                    <input type={'text'} onChange={this.handleTextValChange} value={this.state.textVal} />
                </div>
                <div className={'button'} onClick={this.handleSubmit}>
                    Submit
                </div>

            </div>
        );
    },
});

module.exports = NPM;
