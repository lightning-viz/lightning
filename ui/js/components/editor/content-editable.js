// taken from https://github.com/lovasoa/react-contenteditable
// due to the npm version not compiling
var React = require('react');

var ContentEditable = React.createClass({
    render: function(){
        return <div id="contenteditable"
            onInput={this.emitChange} 
            onBlur={this.emitChange}
            contentEditable
            dangerouslySetInnerHTML={{__html: this.props.html}}></div>;
    },

    shouldComponentUpdate: function(nextProps){
        return nextProps.html !== this.getDOMNode().innerHTML;
    },

    componentDidUpdate: function() {
        console.log('this.props.valueProp');
        console.log(this.props.valueProp);
        if ( this.props.html !== this.getDOMNode().innerHTML ) {
           this.getDOMNode().innerHTML = this.props.html;
        }
    },

    emitChange: function(evt){
        var html = this.getDOMNode().innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            evt.target = { value: html };
            this.props.onChange(evt);
        }
        this.lastHtml = html;
    }
});

module.exports = ContentEditable;
