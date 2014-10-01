var d3 = require('d3');

var inherits = require('inherits');

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
};

var width = 600 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;


var ScatterPlot = function(selector, data, images, opts) {

    var self = this;

    if (data.hasOwnProperty('colors')) {
        fillcolors = data.colors.map(function(d) {return d3.rgb(d.r, d.g, d.b)})
        strokecolors = fillcolors.map(function(d) {return d.darker(0.5)})
    } else {
        fillcolors = []
        strokecolors = []
    }

    if (data.hasOwnProperty('points')) {
        data = data.points
    }

    var xDomain = d3.extent(data, function(d) {
            return d.x;
        });

    var yDomain = d3.extent(data, function(d) {
            return d.y;
        });

    var x = d3.scale.linear()
        .domain([xDomain[0] - 1, xDomain[1] + 1])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([yDomain[0] - 1, yDomain[1] + 1])
        .range([height, 0]);


    var zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .on('zoom', zoomed);

    var svg = d3.select(selector)
        .append('svg')
        .attr('class', 'line-plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('svg:g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom);

    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'plot');


    var makeXAxis = function () {
        return d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(5);
    };

    var makeYAxis = function () {
        return d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);
    };

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(5);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + height + ')')
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(5);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(makeXAxis()
                .tickSize(-height, 0, 0)
                .tickFormat(''));

    svg.append('g')
        .attr('class', 'y grid')
        .call(makeYAxis()
                .tickSize(-width, 0, 0)
                .tickFormat(''));

    // var clip = svg.append('svg:clipPath')
    //     .attr('id', 'clip')
    //     .append('svg:rect')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .attr('width', width)
    //     .attr('height', height);

    // var chartBody = svg.append('g')
    //     .attr('clip-path', 'url(#clip)');

    // // chartBody.append('svg:path')
    // //     .datum(data)
    // //     .attr('class', 'line')
    // //     .attr('d', line);

    // draw dots
    svg.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        //.attr('class', 'dot')
        .attr('r', 6)
        .attr('fill',function(d, i) { return (fillcolors[i] || '#deebfa');})
        .attr('stroke',function(d, i) { return (strokecolors[i] || '#68a1e5');})
        .attr('transform', function(d) {
            return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
        })
        .on('mouseover', function(d, i) {
            var point = d3.select(this)
            var newcolor = d3.rgb(point.style('fill')).darker(0.75)
            point.style('fill', newcolor)
            self.emit('hover', d);
            console.log('in: ' + i);

        })
        .on('mouseout', function(d, i) {
            var point = d3.select(this)
            var newcolor = d3.rgb(point.style('fill')).brighter(0.75)
            point.style('fill', newcolor)
            console.log('out: ' + i);
        });



    function zoomed() {
        svg.select('.x.axis').call(xAxis);
        svg.select('.y.axis').call(yAxis);
        svg.select('.x.grid')
            .call(makeXAxis()
                .tickSize(-height, 0, 0)
                .tickFormat(''));
        svg.select('.y.grid')
            .call(makeYAxis()
                    .tickSize(-width, 0, 0)
                    .tickFormat(''));

        svg.selectAll('circle')
            .attr('transform', function(d) {
                return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
            });
    }
};

inherits(ScatterPlot, require('events').EventEmitter);

module.exports = ScatterPlot;
