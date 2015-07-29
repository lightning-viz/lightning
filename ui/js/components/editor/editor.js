                
var React = require('react');
var _ = require('lodash');
var Highlight = require('react-highlight');
var ContentEditable = require('./content-editable');

var styles = {
};


var Editor = React.createClass({

    getDefaultProps: function() {
        return {
            initialValue: ''
        };
    },

    getInitialState: function() {
        return {
            value: this.props.initialValue,
            isEditing: false,
            onChange: _.debounce(this.props.onChange, 500)
        };
    },

    handleChange: function(evt){
        var val = $(evt.target.value).text();
        this.setState({value: val});
        this.state.onChange(val);
    },

    handleClick: function() {
        this.setState({
            isEditing: true
        });
    },

    handleBlur: function() {
        this.setState({
            isEditing: false
        });
    },

    renderInnerComponent: function() {
        if(this.state.isEditing) {
            var html = $('#inner-editor pre').parent().html();
            return <ContentEditable html={html} onChange={this.handleChange}/>;
        }
        return (
            <Highlight className={'json'}>
                {this.state.value}
            </Highlight>
        );
    },

    render: function() {
        return (
            <div onClick={this.handleClick} onBlur={this.handleBlur} id={'inner-editor'} >
                {this.renderInnerComponent()}
            </div>                
        );
    },
});

module.exports = Editor;


