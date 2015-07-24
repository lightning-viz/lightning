                
var React = require('react');
var _ = require('lodash');
var hljs = require('highlight.js');


var styles = {
};


var Editor = React.createClass({

    getInitialState: function() {
        return {
            selectedData: this.props.datasets.length ? this.props.datasets[0] : null
        };
    },

    handleSelectDataset: function(i) {
        this.setState({
            selectedData: this.props.datasets[i]
        });
    },

    renderDataset: function(dataset, i) {
        return (
            <button className={'data-button'} onClick={this.handleSelectDataset.bind(this, i)} key={i}>
                {dataset.name}
            </button>
        );
    },

    renderDatasets: function() {
        return _.map(this.props.datasets, this.renderDataset, this);
    },

    componentDidUpdate: function() {
        console.log('highlighting')
        setTimeout(hljs.initHighlighting, 450);
    },

    render: function() {
        return (
            <div>
                <div className='data-container'>
                    {this.renderDatasets()}
                </div>
                <div>
                    <pre>
                        <code className={''}>
                            {JSON.stringify(this.state.selectedData, null, 2)}
                        </code>
                    </pre>
                </div>
            </div>
        );
    },
});

module.exports = Editor;


