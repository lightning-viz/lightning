var AmpersandModel = require('ampersand-model');

var Dashboard = AmpersandModel.extend({
    props: {
        id: 'string',
        layout: 'object'
    },

    url: function() {
        return '/dashboards/' + this.id;
    }
});

module.exports = Dashboard;