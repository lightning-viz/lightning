var d3 = require('d3');
var _ = require('lodash');
var utils = require('../utils');

var margin = {
    top: 40,
    right: 10,
    bottom: 20,
    left: 10
};



var StackedLineGraph = function(selector, data, images, opts) {

    var colors = utils.getColors(data.length);

    
    var yDomain = d3.extent(data[0], function(d) {
            return d;
        });

    // do everything for the minimap
    var minimapWidth = 150;
    var minimapLineHeight = 15;
    var minimapLinePadding = 5;

    var minimapX = d3.scale.linear()
                    .domain([-1, data[0].length + 1])
                    .range([0, minimapWidth]);

    var minimapY = d3.scale.linear()
                    .domain([yDomain[0] - 1, yDomain[1] + 1])
                    .range([minimapLineHeight, 0]);

    var minimapLine = d3.svg.line()
                        .x(function(d, i) {
                            return minimapX(i);
                        })
                        .y(function(d, i) {
                            return minimapY(d);
                        });


    var chartWidth = $(selector).width() - minimapWidth;
    var chartLineHeight = 100;
    var chartLinePadding = 20;


    var max = 0;

    var chartData = _.map(data, function(line, i) {
        return _.map(line, function(point) {
            var p = point + (((data.length-1) - i) * (chartLineHeight + chartLinePadding));
            if(p > max) {
                max = p;
            }
            return p;
        });
    });


    var chartX = d3.scale.linear()
                    .domain([-1, data[0].length + 1])
                    .range([0, chartWidth]);

    var chartY = d3.scale.linear()
                    .domain([yDomain[0] - 1, max + 1])
                    .range([data.length * (chartLineHeight + chartLinePadding), 0]);

    var chartLine = d3.svg.line()
                        .x(function(d, i) {
                            return chartX(i);
                        })
                        .y(function(d, i) {
                            return chartY(d);
                        });



    var zoom = d3.behavior.zoom()
        .x(chartX)
        .y(chartY)
        .on('zoom', zoomed);


    var minimapSvg = d3.select(selector).append('svg')
        .attr('class', 'stacked-line-plot')
        .attr('width', minimapWidth)
        .attr('height', (minimapLineHeight+minimapLinePadding) * data.length);

    var chartSvg = d3.select(selector).append('svg')
        .attr('class', 'stacked-line-plot')
        .attr('width', chartWidth)
        .attr('height', (chartLineHeight+chartLinePadding) * data.length)
        .call(zoom);


    var minimap = minimapSvg.append('g')
        .attr('class', 'minimap');

    var chart = chartSvg.append('g')
        .attr('class', 'chart');
        // .attr('transform', 'translate(' + minimapWidth + ', 0)');


    minimap.append('svg:clipPath')
        .attr('id', 'minimapClip')
        .append('svg:rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', minimapWidth)
        .attr('height', (minimapLineHeight + minimapLinePadding) * data.length);


    var chartBody = minimap.append('g')
        .attr('clip-path', 'url(#minimapClip)');


    _.each(data, function(d, i) {

        chartBody.append('path')
            .datum(d)
            .attr('class', 'line')
            .attr('d', minimapLine)
            .style('stroke', colors[i])
            .attr('transform', 'translate(0, ' + (i * (minimapLineHeight + minimapLinePadding)) + ')');
    });
    
    var brush = d3.svg.brush()
        .x(minimapX)
        .y(d3.scale.linear().range([(minimapLineHeight + minimapLinePadding) * data.length, 0]))
        .on('brush', brushed);



    minimap.append('g')
      .attr('class', 'brush')
      .call(brush);
            


    function brushed(duration) {

        console.log('brushed');
        if (!duration) {
            duration = 0;
        }

        if (brush.empty()) {
            duration = 750;
            chartY.domain([yDomain[0] - 1, max + 1]);
            chartX.domain([-1, data[0].length +1]);
        } else {

            var ext = brush.extent();
            var xExt = [ext[0][0], ext[1][0]];
            var yExt = [ext[0][1], ext[1][1]];

            chartX.domain(xExt);
            chartY.domain([utils.mapRange(yExt[0], 0, 1, yDomain[0] - 1, max + 1), utils.mapRange(yExt[1], 0, 1, yDomain[0] - 1, max + 1)]);
        }

        chart.selectAll('.line')
            .transition().duration(duration)
            .attr('d', chartLine);

    }


    function zoomed() {
        chart.selectAll('.line')
            .attr('d', chartLine);
    }

    chart.append('svg:clipPath')
        .attr('id', 'chartClip')
        .append('svg:rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', chartWidth)
        .attr('height', (chartLineHeight + chartLinePadding) * data.length);


    chartBody = chart.append('g')
        .attr('clip-path', 'url(#chartClip)');
        // .call(zoom);


    _.each(chartData, function(d, i) {
        chartBody.append('path')
            .datum(d)
            .attr('class', 'line')
            .style('stroke', colors[i])
            .attr('d', chartLine);
    });


};

module.exports = StackedLineGraph;



StackedLineGraph.prototype.updateData = function(data) {
    this.svg.select('.line')
        .datum(data)
        .transition()
        .attr('d', this.line);
};