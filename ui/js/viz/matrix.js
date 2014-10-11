var d3 = require('d3');
var inherits = require('inherits');

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
};




var Matrix = function(selector, data, images, opts) {

    var width = $(selector).width() - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var matrix = [];
    var nodes = data.nodes;
    var n = nodes.length;
    var color = d3.scale.category10().domain(d3.range(10));
    
    var x = d3.scale.ordinal().rangeBands([0, Math.min(width, height)]);

    var zrng = d3.extent(data.links, function(d) {
            return d.value;
        });
    var z = d3.scale.linear().domain([zrng[0], zrng[1]]).clamp(true);

    nodes.forEach(function(node, i) {
        node.index = i;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

    data.links.forEach(function(link) {
        matrix[link.source][link.target].z = link.value;
    });


    //x.domain(d3.range(n))
    x.domain(d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; }));

    var zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 20])
        .on('zoom', zoomed);

    var svg = d3.select(selector)
        .append('svg:svg')
        .attr('class', 'matrix')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('pointer-events', 'all')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom)
        .append('svg:g')
        .attr('transform', 'translate(' + (margin.left + (width / 2) - Math.min(width, height)/2)  + ', 0)');

    svg.selectAll('.row')
        .data(matrix)
        .enter().append('g')
        .attr('class', 'row')
        .attr('transform', function(d, i) { return 'translate(0,' + x(i) + ')'; })
        .each(function(row) {
            d3.select(this).selectAll('.cell')
                .data(row.filter(function(d) { return d.z; }))
                .enter().append('rect')
                .attr('class', 'cell')
                .attr('x', function(d) { return x(d.x); })
                .attr('width', x.rangeBand())
                .attr('height', x.rangeBand())
                .style('fill-opacity', function(d) { return z(d.z); })
                .style('fill', function(d) { return nodes[d.x].group === nodes[d.y].group ? color(nodes[d.x].group) : null; });
        });


    svg.selectAll('.column')
        .data(matrix)
        .enter().append('g')
        .attr('class', 'column')
        .attr('transform', function(d, i) { return 'translate(' + x(i) + ')rotate(-90)'; });

    function zoomed() {
        svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
    }

};


module.exports = Matrix;