var d3 = require('d3');
var inherits = require('inherits');
var templateHTML = require('../../templates/viz/roi-image.jade');
var request = require('superagent');


var ROIPlot = function(selector, data, images, opts) {

    var self = this;
    var $el = $(selector).first();
    $el.append(templateHTML());

    var width = $(selector).width();
    var height = 400;

    var img = new Image();
    img.src = images[0] + '_small';


    var x = d3.scale.linear()
        .domain([0, 1650])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, 1250])
        .range([height, 0]);



    var svg = d3.select(selector + ' #roi')
        .append('svg')
        .attr('class', 'line-plot')
        .attr('width', width)
        .attr('height', height)
        .append('svg:g');


    svg.append('svg:image')
        .attr('xlink:href', images[0] + '_small')
        .attr('width', width)
        .attr('height', height);


    // draw dots
    svg.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 6)
        .attr('transform', function(d) {
            return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
        })
        .on('mouseover', function(d) {
            self.emit('hover', d);
        })
        .on('mouseout', function(d, i) {
            console.log('out: ' + i);
        });


    var LineChart = require('../viz/line');
    var line = new LineChart(selector + ' #line-chart', Array.apply(null, new Array(1000)).map(Number.prototype.valueOf,0));


    var r;
    this.on('hover', function(d) {
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

inherits(ROIPlot, require('events').EventEmitter);

module.exports = ROIPlot;
