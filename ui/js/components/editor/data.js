                
var React = require('react');
var _ = require('lodash');
var hljs = require('highlight.js');


var styles = {
};


var Editor = React.createClass({

    handleSelectDataset: function(i) {
        this.props.onDataChange(this.props.datasets[i].data);
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

    componentDidUpdate: function(prevProps, prevState) {
        // hljs.initHighlighting();
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
                            {JSON.stringify(this.props.selectedData, null, 2)}
                        </code>
                    </pre>
                </div>
            </div>
        );
    },
});

module.exports = Editor;


