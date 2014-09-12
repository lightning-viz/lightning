
var request = require('request');
var _ = require('lodash');


var port = process.env.PORT || '3000';
var host = 'http://localhost' + ':' + port;


var visualizationTypes = [
    {
        name: 'line'   
    }, {
        name: 'scatter'   
    }, {
        name: 'roi',
        initialDataField: 'points'
    }, {
        name: 'roi-image',
        initialDataField: 'points'   
    }, {
        name: 'image'
    }, {
        name: 'gallery'
    }, {
        name: 'volume'
    }, {
        name: 'force-bundle'
    }, {
        name: 'force-directed-network'
    }
];

console.log('updating visualization types');

_.each(visualizationTypes, function(type) {
    var options = {
      uri: host + '/visualizations/types',
      method: 'POST',
      json: type
    };

    request(options, function (error, response) {
        if (!error && response.statusCode == 200) {
            console.log('Successfully added type ' + type.name);
        }
    });
});

