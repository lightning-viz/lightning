if(!window.d3) {
    d3 = require('d3');
}

var _ = require('lodash');

var margin = {
    top: 40,
    right: 10,
    bottom: 20,
    left: 10
};

var lineChartHeight = 100;
var axisSize = 20;
var width = 600 - margin.left - margin.right;


var StackedLineGraph = function(selector, data, images, opts) {


    var self = this;
    var height = (data.length) * lineChartHeight + axisSize - margin.top - margin.bottom;

    
    var yDomain = d3.extent(data[0], function(d) {
            return d;
        });

    this.x = d3.scale.linear()
        .domain([-1, data[0].length + 1])
        .range([0, width]);

    this.y = d3.scale.linear()
        .domain([yDomain[0] - 1, yDomain[1] + 1])
        .range([lineChartHeight, 0]);

    this.line = d3.svg.line()
        .x(function (d, i) {
            return self.x(i);
        })
        .y(function (d) {
            return self.y(d);
        });


    this.zoom = d3.behavior.zoom()
        .x(this.x)
        .y(this.y)
        .on('zoomstart', function(scale, translate) {
            self.y = d3.scale.linear()
                .domain([yDomain[0] - 1, yDomain[1] + 1])
                .range([lineChartHeight, 0]);
        })
        .on('zoom', zoomed);


    var svg = d3.select(selector).append('svg')
        .attr('class', 'stacked-line-plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + axisSize)
        .call(this.zoom);


    svg.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'plot');

    var makeXAxis = function () {
        return d3.svg.axis()
            .scale(self.x)
            .orient('bottom')
            .ticks(5);
    };

    var makeYAxis = function () {
        return d3.svg.axis()
            .scale(self.y)
            .orient('left')
            .ticks(5);
    };

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .ticks(5);

    svg.append('svg:g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (height + margin.top) + ')')
        .call(this.xAxis);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .ticks(5);

    svg.append('svg:g')
        .attr('class', 'y axis')
        .call(this.yAxis);

    var clip = svg.append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height + margin.top);

    var chartBody = svg.append('g')
        .attr('clip-path', 'url(#clip)');


    _.each(data, function(d, i) {
        chartBody.append('path')
            .datum(d)
            .attr('class', 'line')
            .attr('d', self.line)
            .attr('transform', 'translate(0, ' + (i * lineChartHeight) + ')');
    
    });
    
    var focus = svg.append('g')
        .attr('class', 'focus')
        // .attr('transform', 'translate(' + 0 + ',' + margin.top + ')');

    var context = svg.append('g')
        .attr('class', 'context')
        // .attr('transform', 'translate(' + 0 + ',' + margin.top + ')');


      // context.append('g')
      //       .attr('class', 'x brush')
      //       .call(brush)
      //       .selectAll('rect')
      //       .attr('y', 0)
      //       .attr('height', height);

    function brushed() {
          // x.domain(brush.empty() ? x2.domain() : brush.extent());
          // focus.select('.area').attr('d', area);
          // focus.select('.x.axis').call(this.xAxis);
    }

    function zoomed() {
        self.y = d3.scale.linear()
            .domain([yDomain[0] - 1, yDomain[1] + 1])
            .range([lineChartHeight * Math.pow(Math.max(1, self.zoom.scale()), 1/5), 0]);

        // var scale = self.zoom.scale();
        // var translate = self.zoom.translate();

        // console.log(self.y);
        // self.zoom.y(self.y).scale(scale).translate(translate);

        self.svg.select('.x.axis').call(self.xAxis);
        self.svg.select('.y.axis').call(self.yAxis);

        self.svg.select('.x.grid')
            .call(makeXAxis()
                .tickSize(-height, 0, 0)
                .tickFormat(''));

        // self.svg.select('.y.grid')
        //     .call(makeYAxis()
        //             .tickSize(-width, 0, 0)
        //             .tickFormat(''));

        console.log(self.zoom.scale());

        self.svg.selectAll('.line').each(function() {
            d3.select(this)
                .attr('class', 'line')
                .attr('d', self.line);
        });
    }

    this.svg = svg;

};


module.exports = StackedLineGraph;





StackedLineGraph.prototype.updateData = function(data) {
    this.svg.select('.line')
        .datum(data)
        .transition()
        .attr('d', this.line);
};