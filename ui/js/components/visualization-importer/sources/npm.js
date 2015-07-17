'use strict';

var React = require('react');
var _ = require('lodash');
var RadioGroup = require('react-radio-group');


var styles = {
    radioInput: {
        display: 'none'
    }
};

var NPM = React.createClass({

    getInitialState: function() {
        return {
            location: 'registry'
        }
    },

    handleSelectLocation: function(location) {
        this.setState({
            location: location
        });
    },

    renderRadioGroup: function(Radio) {
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

    render: function() {

        return (
            <div>
                <div>
                    Select Location: 
                    <RadioGroup selectedValue={this.state.location} onChange={this.handleSelectLocation}>
                        {this.renderRadioGroup}
                    </RadioGroup>
                </div>
                <div>
                    Module Name: 
                    <input type={'text'} />
                </div>

            </div>
        );
    },
});

module.exports = NPM;
