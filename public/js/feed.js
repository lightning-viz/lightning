(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var sid = document.URL.substring(document.URL.lastIndexOf('/sessions/') + '/sessions/'.length, document.URL.lastIndexOf('/feed'));

var socket = io.connect('/sessions/' + sid);
socket.on('viz', function (viz) {

    console.log(viz);
    $('.feed-container .empty').remove();
    $('.feed-container').prepend('<div class="feed-item"><pre>' + JSON.stringify(viz.data) + '</pre></div>');
    // $('#results').html(intermediateResultsTemplate(data));
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXRoaXNvbmlhbi9wcm9qZWN0cy9saWdodG5pbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21hdGhpc29uaWFuL3Byb2plY3RzL2xpZ2h0bmluZy91aS9qcy9wYWdlcy9mYWtlX2NmYjk3MTQzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgc2lkID0gZG9jdW1lbnQuVVJMLnN1YnN0cmluZyhkb2N1bWVudC5VUkwubGFzdEluZGV4T2YoJy9zZXNzaW9ucy8nKSArICcvc2Vzc2lvbnMvJy5sZW5ndGgsIGRvY3VtZW50LlVSTC5sYXN0SW5kZXhPZignL2ZlZWQnKSk7XG5cbnZhciBzb2NrZXQgPSBpby5jb25uZWN0KCcvc2Vzc2lvbnMvJyArIHNpZCk7XG5zb2NrZXQub24oJ3ZpeicsIGZ1bmN0aW9uICh2aXopIHtcblxuICAgIGNvbnNvbGUubG9nKHZpeik7XG4gICAgJCgnLmZlZWQtY29udGFpbmVyIC5lbXB0eScpLnJlbW92ZSgpO1xuICAgICQoJy5mZWVkLWNvbnRhaW5lcicpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJmZWVkLWl0ZW1cIj48cHJlPicgKyBKU09OLnN0cmluZ2lmeSh2aXouZGF0YSkgKyAnPC9wcmU+PC9kaXY+Jyk7XG4gICAgLy8gJCgnI3Jlc3VsdHMnKS5odG1sKGludGVybWVkaWF0ZVJlc3VsdHNUZW1wbGF0ZShkYXRhKSk7XG59KTtcbiJdfQ==
