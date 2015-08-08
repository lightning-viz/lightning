'use strict';

var React = require('react');
var _ = require('lodash');
var RadioGroup = require('react-radio-group');
var Sources = require('./sources');


var styles = {
    radioLabel: {
        display: 'inline-block',  
    },

    radioInput: {
        display: 'none'
    }
};

var Importer = React.createClass({

    getDefaultProps: function() {
        return {
            initialSource: 'npm',
        };
    },

    getInitialState: function() {
        return {
            source: this.props.initialSource
        }
    },

    handleSelectSource: function(source) {
        this.setState({
            source: source
        });
    },

    renderRadioGroup: function(Radio) {
        var radios = [{
            name: 'npm',
            label: 'NPM'
        }, {
            name: 'gitRepo',
            label: 'Git Repo'
        }, {
            name: 'localFolder',
            label: 'Local Folder'
        }];

        var styleRadio = function(radio, i) {
            var rLen = Object.keys(radios).length;
            return (
                <label 
                    className={'button-group-label ' + (this.state.source === radio.name ? 'selected' : '')} 
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

        var Source = Sources[this.state.source];
        return (
            <div className='row importer'>
                <div className='eight columns'>
                    Select Source: 
                    <RadioGroup selectedValue={this.state.source} onChange={this.handleSelectSource}>
                        {this.renderRadioGroup}
                    </RadioGroup>
                    <Source
                        initialUrl={this.props.url}
                        initialPath={this.props.path}
                        initialName={this.props.name}
                        initialLocation={this.props.location}
                        initialImportPreview={this.props.importPreview}
                         />
                </div>
            </div>
        );
    },
});

module.exports = Importer;
