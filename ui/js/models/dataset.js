var AmpersandModel = require('ampersand-model');

var Dataset = AmpersandModel.extend({
    props: {
        data: 'object'
    }
});

module.exports = Dataset;