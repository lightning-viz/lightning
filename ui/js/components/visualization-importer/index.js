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

    render: function() {

        var Source = Sources[this.state.source];
        return (
            <div className='row importer'>
                <div className='eight columns'>
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
