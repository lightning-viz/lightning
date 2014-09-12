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

var ForceDirectedNetworkViz = function(selector, data, images, opts) {

	var color = d3.scale.category10();

    console.log(data.nodes)

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

    function zoomed() {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
    }

    var force = d3.layout.force()
        .size([width, height])
        .linkDistance(function (d) { return 100*Math.sqrt(d.value)})
        .charge(-100)
        .gravity(0)
        .nodes(data.nodes)
        .links(data.links)
        .start();

    var drag = force.drag()
      .on("dragstart", function(d) {
        d3.event.sourceEvent.stopPropagation();
      });

    var link = svg.selectAll(".link")
        .data(data.links)
    .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); })
        .style("stroke", '#999')
        .style("stroke-opacity", 0.9);

    var node = svg.selectAll(".node")
        .data(data.nodes)
    .enter().append("circle")
        .attr("class", "node")
        .attr("r", 6)
        .style("fill", function(d) { return color(d.group); })
        .style("stroke", "white")
        .style("stroke-width", 1)
        .call(drag);

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });

};


module.exports = ForceDirectedNetworkViz;