'use strict';
var React = require('react');
var _ = require('lodash');
var Immutable = require('immutable');
var Highlight = require('react-highlight');

var Tabs = require('react-simpletabs');
var DataComponent = require('./data');
var OptionsComponent = require('./options');
var VizComponent = require('./viz');

var capitalize = function(s) {
    return s && s[0].toUpperCase() + s.slice(1);
};

var styles = {
};

var parseData = function(d) {
    if(_.isArray(d)) {
        d = Immutable.List(d);
    } else if(_.isObject(d)) {
        d = Immutable.Map(d);
    }
    return d;
}

var Editor = React.createClass({

    getDefaultProps: function() {
        return {
            datasets: window.lightning.editor.datasets || [],
            images: window.lightning.editor.sampleImages || [],
            moduleName: window.lightning.editor.moduleName || '',
            initialOptions: window.lightning.editor.options || {},
            codeExamples: window.lightning.editor.codeExamples || {},
        };
    },

    getInitialState: function() {
        return {
            data: parseData(this.props.datasets.length ? this.props.datasets[0].data : []),
            options: parseData(this.props.initialOptions),
            selectedTab: 1
        };
    },

    handleDataChange: function(data) {
        this.setState({
            data: parseData(data)
        });
    },
    
    handleOptionsChange: function(options) {
        this.setState({
            options: parseData(options)
        });
    },

    tabSelected: function(i) {
        this.setState({
            selectedTab: i
        });
    },

    // renderCodeExample: function(example, language) {
    //     return (
    //         <Tabs.Panel title={language}>
                
    //         </Tabs.Panel>
    //     );
    // },

    // renderCodeExamples: function() {
    //     if(_.keys(this.props.codeExamples).length) {
    //         return _.map(this.props.codeExamples, this.renderCodeExample, this);
    //     }
    //     return '';
    // },

    getTabComponents: function() {
        var components = {
            'Data': <DataComponent datasets={this.props.datasets} initialSelectedData={this.state.data} onChange={this.handleDataChange} />,
            'Options': <OptionsComponent initialOptions={this.state.options} onChange={this.handleOptionsChange} />,
        };

        _.each(this.props.codeExamples, function(example, language) {
            components[capitalize(language) + ' Example'] = <Highlight className={language}>{example}</Highlight>
        });

        return components;
    },

    renderTabComponents: function() {
        var components = this.getTabComponents();
        var tabComponents = [];
        _.each(components, function(val, title) {
            tabComponents.push(<Tabs.Panel title={title} key={title}>{val}</Tabs.Panel>)
        });
        return tabComponents;
    },

    render: function() {
        return (
            <div>
                <div className={'editor-outer-section wrap push'}>
                    <div className={'row editor-inner-section'}>
                        <div className={'editor-viz-container'}>
                            <VizComponent data={this.state.data} options={this.state.options} moduleName={this.props.moduleName} images={this.props.images} />
                        </div>
                    </div>
                </div>
                <div className={'editor-outer-section wrap push data-component'}>
                    <div className={'row editor-inner-section'}>
                        <div className={'editor-code-container'}>
                            <div className={'visualization-type'}>
                                <Tabs onAfterChange={this.tabSelected} tabActive={this.state.selectedTab} className={'tab-container'}>
                                    {this.renderTabComponents()}
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});

module.exports = Editor;
