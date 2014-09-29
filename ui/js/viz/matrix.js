if(!window.d3) {
    d3 = require('d3');
}

var inherits = require('inherits');

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
};

var width = 600 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

var Matrix = function(selector, data, images, opts) {

    var matrix = []
    var nodes = data.nodes
    var n = nodes.length
    var color = d3.scale.category10().domain(d3.range(10));
    var x = d3.scale.ordinal().rangeBands([0, width])
    var zrng = d3.extent(data.links, function(d) {
            return d.value;
        });
    var z = d3.scale.linear().domain([zrng[0], zrng[1]]).clamp(true)

    nodes.forEach(function(node, i) {
        node.index = i;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

    data.links.forEach(function(link) {
        matrix[link.source][link.target].z = link.value;
    });

    console.log(x(0))
    console.log(x(5))
    console.log(x.rangeBand())

    //x.domain(d3.range(n))
    x.domain(d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; }))

    var zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 20])
        .on("zoom", zoomed)

    var svg = d3.select(selector)
        .append('svg:svg')
        .attr('class', 'line-plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('pointer-events', 'all')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom)
        .append('svg:g')

    var row = svg.selectAll(".row")
        .data(matrix)
      .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .each(row);

    var column = svg.selectAll(".column")
        .data(matrix)
      .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
          .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x(d.x); })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) { return z(d.z); })
            .style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? color(nodes[d.x].group) : null; });
    }

    function zoomed() {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }

};


module.exports = Matrix;