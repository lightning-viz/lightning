var d3 = require('d3');


var svg = d3.select("body").append("svg")
    .attr("width", 100)
    .attr("height", 100);


svg.append("path")
    .style('fill', 'none')
    .style('stroke', 'purple')
    .style('stroke-width', '2px')
    .attr("d", "M80.562,41.754L52.861 41.754 67.299 0 19.437 58.247 47.14 58.247 32.702 100 z")
    .call(backTransition);

function transition(path) {
  path
      .attr('stroke-dashoffset', 0)
      .attr('stroke-dasharray', function() {
        return '0, ' + this.getTotalLength();
      })
      .transition()
      .duration(3000)
      .attrTween("stroke-dasharray", tweenDash)
      .each("end", function() { d3.select(this).call(backTransition); });
}

function backTransition(path) {
  path
    .transition()
      .duration(3000)
      .attrTween("stroke-dashoffset", tweenBackOffset)
      .attrTween("stroke-dasharray", tweenBackArray)
      .each("end", function() { d3.select(this).call(transition); });
}

function tweenDash() {
  var l = this.getTotalLength(),
  i = d3.interpolateString("0," + l, l + "," + l);

  return function(t) {
    console.log(i(t));
    return i(t);
  };
}

function tweenBackOffset() {
  var l = this.getTotalLength(),
  i = d3.interpolate(0, l);
  return function(t) {
    console.log(i(t));
    return -i(t);
  };
}

function tweenBackArray() {
  var l = this.getTotalLength(),
  i = d3.interpolate(0, l);
  return function(t) {
    console.log(i(t) + ', ' + l);
    return i(t) + ', 0, ' + (l - i(t));
  };
}