var _ = require('lodash');
var templateHTML = require('../../templates/viz/roi.jade');
var request = require('superagent');



var ROIViz = function(selector, data) {

    var $el = $(selector).first();
    $el.append(templateHTML());

    if(data.points) {
        data = data.points;
    }


    var ScatterPlot = require('../viz/scatter');
    var scatter = new ScatterPlot(selector + ' #scatter-plot', data);
    var LineChart = require('../viz/line');
    var line = new LineChart(selector + ' #line-chart', Array.apply(null, new Array(1000)).map(Number.prototype.valueOf,0));



    var r;
    scatter.on('hover', function(d) {

        // get the url to fetch more data from
        // TODO: make this more robust, this is hacky

        var url = $el.next('.permalink').find('a').attr('href');

        if(r) {
            r.abort();
        }

        r = request.get(url + '/data/timeseries/' + d.i, function(res) {
            if((res.body.data || []).length) {
                line.updateData(res.body.data);
            }
        });
    });


};




module.exports = ROIViz;