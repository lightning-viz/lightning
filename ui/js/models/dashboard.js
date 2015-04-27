var AmpersandModel = require('ampersand-model');
var AmpersandCollection = require('ampersand-collection');
var Dataset = require('./dataset');


var Datasets = AmpersandCollection.extend({
    model: Dataset
});

var Dashboard = AmpersandModel.extend({
    props: {
        id: 'string',
        layout: 'object',
        datasets: {
            type: Datasets,
            default: function () { return new Datasets; }
        }
    },

    url: function() {
        return '/dashboards/' + this.id;
    }
});

module.exports = Dashboard;