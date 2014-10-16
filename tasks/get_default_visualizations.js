
var request = require('request');
var _ = require('lodash');
var path = require('path');
var fs = require('fs-extra');

var port = process.env.PORT || '3000';
var host = 'http://localhost' + ':' + port;


var visualizationTypes = [
    {
        name: 'line',
        sampleData: [1, 2, 5, 6, 7, 8, 2, 3]
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
    }, {
        name: 'stacked-line'
    }, {
        name: 'matrix'
    }, {
        name: 'map'
    }
];

console.log('updating visualization types');
var jsPath = path.resolve(__dirname + '/../ui/js/viz/');
var markupPath = path.resolve(__dirname + '/../ui/templates/viz/');
var stylePath = path.resolve(__dirname + '/../ui/stylesheets/viz/');

_.each(visualizationTypes, function(type) {

    var jsFile = jsPath + '/' + type.name + '.js';
    var styleFile = stylePath + '/' + type.name + '.scss';
    var markupFile = markupPath + '/' + type.name + '.jade';

    var options = {
        uri: host + '/visualizations/types',
        method: 'POST',
        json: _.extend(type, {
            javascript: (fs.existsSync(jsFile)) ? fs.readFileSync(jsFile).toString('utf8') : '',
            styles: (fs.existsSync(styleFile)) ? fs.readFileSync(styleFile).toString('utf8') : '',
            markup: (fs.existsSync(markupFile)) ? fs.readFileSync(markupFile).toString('utf8') : '',
        })
    };

    request(options, function (error, response) {
        if (!error && response.statusCode == 200) {
            console.log('Successfully added type ' + type.name);
        }
    });
});

