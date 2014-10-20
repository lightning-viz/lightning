var d3 = require('d3');


module.exports = function(el) {
    var svg = d3.select(el).append('svg')
        .attr('width', 100)
        .attr('height', 100);

    svg.append('path')
        .style('fill', 'none')
        .style('stroke', '#9175f0')
        .attr('d', 'M44.6820968,30.89796 L24.5765323,30.89796 L35.0557258,0 L0.317177419,43.10278 L20.4241935,43.10278 L9.945,74 L44.6820968,30.89796 Z')
        .call(backTransition);

    var transition = function(path) {
      path
          .attr('stroke-dashoffset', 0)
          .attr('stroke-dasharray', function() {
            return '0, ' + this.getTotalLength();
          })
          .transition()
          .duration(3000)
          .attrTween('stroke-dasharray', tweenDash)
          .each('end', function() { d3.select(this).call(backTransition); });
    };

    var backTransition = function(path) {
      path
        .transition()
          .duration(3000)
          .attrTween('stroke-dashoffset', tweenBackOffset)
          .attrTween('stroke-dasharray', tweenBackArray)
          .each('end', function() { d3.select(this).call(transition); });
    };

    function tweenDash() {
      var l = this.getTotalLength(),
      i = d3.interpolateString('0,' + l, l + ',' + l);

      return function(t) {
        return i(t);
      };
    }

    function tweenBackOffset() {
      var l = this.getTotalLength(),
      i = d3.interpolate(0, l);
      return function(t) {
        return -i(t);
      };
    }

    function tweenBackArray() {
      var l = this.getTotalLength(),
      i = d3.interpolate(0, l);
      return function(t) {
        return i(t) + ', 0, ' + (l - i(t));
      };
    }
};
