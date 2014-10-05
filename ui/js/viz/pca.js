


var PCAViz = function(selector, data, images, options) {

    var $el = $(selector);

    $el.append('<div id="line-chart"></div><div id="scatter-plot"></div>');


    console.log(data);

    var LineChart = require('../viz/line');
    var line = new LineChart($el.find('#line-chart').selector, data[0].timeseries);


    var ScatterPlot = require('../viz/scatter');
    var scatter = new ScatterPlot($el.find('#scatter-plot').selector, data[0].points);


    scatter.on('hover', function(d) {
        line.updateData(d.timeseries);
    });


};




module.exports = PCAViz;