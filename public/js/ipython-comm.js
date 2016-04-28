(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.lightning = window.lightning || {};
var lightningCommMap = {};
var IPython = window.IPython;

var readCommData = function(commData, field) {
    try {
        return commData.content.data[field];
    } catch (err) {
        return;
    }
};


var init_comm = function() {
    IPython.notebook.kernel.comm_manager.register_target('lightning', function(comm, data) {
        var id = readCommData(data, 'id');
        lightningCommMap[id] = comm;
    });

    window.lightning.comm_map = lightningCommMap;
}


if(IPython && IPython.notebook) {

    if(IPython.notebook.kernel) {
        init_comm();
    }

    IPython.notebook.events.on('kernel_connected.Kernel', init_comm);

}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jb25sZW5tL3Byb2plY3RzL2xpZ2h0bmluZy12aXovbGlnaHRuaW5nL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9jb25sZW5tL3Byb2plY3RzL2xpZ2h0bmluZy12aXovbGlnaHRuaW5nL3VpL2pzL3BhZ2VzL2Zha2VfYjQyNDg5ZWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDO0FBQzFDLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzFCLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7O0FBRTdCLElBQUksWUFBWSxHQUFHLFNBQVMsUUFBUSxFQUFFLEtBQUssRUFBRTtJQUN6QyxJQUFJO1FBQ0EsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN2QyxDQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTztLQUNWO0FBQ0wsQ0FBQyxDQUFDO0FBQ0Y7O0FBRUEsSUFBSSxTQUFTLEdBQUcsV0FBVztJQUN2QixPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxTQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7UUFDbkYsSUFBSSxFQUFFLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDcEMsS0FBSyxDQUFDLENBQUM7O0lBRUgsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUM7QUFDakQsQ0FBQztBQUNEOztBQUVBLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7O0lBRTVCLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDeEIsU0FBUyxFQUFFLENBQUM7QUFDcEIsS0FBSzs7QUFFTCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxTQUFTLENBQUMsQ0FBQzs7Q0FFcEUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LmxpZ2h0bmluZyA9IHdpbmRvdy5saWdodG5pbmcgfHwge307XG52YXIgbGlnaHRuaW5nQ29tbU1hcCA9IHt9O1xudmFyIElQeXRob24gPSB3aW5kb3cuSVB5dGhvbjtcblxudmFyIHJlYWRDb21tRGF0YSA9IGZ1bmN0aW9uKGNvbW1EYXRhLCBmaWVsZCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBjb21tRGF0YS5jb250ZW50LmRhdGFbZmllbGRdO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxufTtcblxuXG52YXIgaW5pdF9jb21tID0gZnVuY3Rpb24oKSB7XG4gICAgSVB5dGhvbi5ub3RlYm9vay5rZXJuZWwuY29tbV9tYW5hZ2VyLnJlZ2lzdGVyX3RhcmdldCgnbGlnaHRuaW5nJywgZnVuY3Rpb24oY29tbSwgZGF0YSkge1xuICAgICAgICB2YXIgaWQgPSByZWFkQ29tbURhdGEoZGF0YSwgJ2lkJyk7XG4gICAgICAgIGxpZ2h0bmluZ0NvbW1NYXBbaWRdID0gY29tbTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5saWdodG5pbmcuY29tbV9tYXAgPSBsaWdodG5pbmdDb21tTWFwO1xufVxuXG5cbmlmKElQeXRob24gJiYgSVB5dGhvbi5ub3RlYm9vaykge1xuXG4gICAgaWYoSVB5dGhvbi5ub3RlYm9vay5rZXJuZWwpIHtcbiAgICAgICAgaW5pdF9jb21tKCk7XG4gICAgfVxuXG4gICAgSVB5dGhvbi5ub3RlYm9vay5ldmVudHMub24oJ2tlcm5lbF9jb25uZWN0ZWQuS2VybmVsJywgaW5pdF9jb21tKTtcblxufVxuIl19
