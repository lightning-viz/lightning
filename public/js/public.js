(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

window.define = undefined;

var vizs = {};


setTimeout(function() {
    $('.feed-item[data-initialized=false]').each(function() {

        var type = $(this).data('type');
        var data = $(this).data('data');
        var images = $(this).data('images');
        var options = $(this).data('options');
        var Viz =  require(type);

        var vid = $(this).attr('id');
        vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + $(this).attr('id'), data, images, options);
        $(this).data('initialized', true);
        $(this).attr('data-initialized', true);
    });

    $('.feed-container').animate({opacity: 1});

}, 0);


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXRoaXNvbmlhbi9wcm9qZWN0cy9saWdodG5pbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21hdGhpc29uaWFuL3Byb2plY3RzL2xpZ2h0bmluZy91aS9qcy9wYWdlcy9mYWtlXzE4YTQ2ODJlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQSxNQUFNLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQzs7QUFFMUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2Q7O0FBRUEsVUFBVSxDQUFDLFdBQVc7QUFDdEIsSUFBSSxDQUFDLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVzs7UUFFcEQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QyxRQUFRLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7UUFFekIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9DLEtBQUssQ0FBQyxDQUFDOztBQUVQLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRTlDLEVBQUUsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG53aW5kb3cuZGVmaW5lID0gdW5kZWZpbmVkO1xuXG52YXIgdml6cyA9IHt9O1xuXG5cbnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgJCgnLmZlZWQtaXRlbVtkYXRhLWluaXRpYWxpemVkPWZhbHNlXScpLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHR5cGUgPSAkKHRoaXMpLmRhdGEoJ3R5cGUnKTtcbiAgICAgICAgdmFyIGRhdGEgPSAkKHRoaXMpLmRhdGEoJ2RhdGEnKTtcbiAgICAgICAgdmFyIGltYWdlcyA9ICQodGhpcykuZGF0YSgnaW1hZ2VzJyk7XG4gICAgICAgIHZhciBvcHRpb25zID0gJCh0aGlzKS5kYXRhKCdvcHRpb25zJyk7XG4gICAgICAgIHZhciBWaXogPSAgcmVxdWlyZSh0eXBlKTtcblxuICAgICAgICB2YXIgdmlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgICAgICB2aXpzW3ZpZC5zbGljZSh2aWQuaW5kZXhPZignLScpICsgMSldID0gbmV3IFZpeignIycgKyAkKHRoaXMpLmF0dHIoJ2lkJyksIGRhdGEsIGltYWdlcywgb3B0aW9ucyk7XG4gICAgICAgICQodGhpcykuZGF0YSgnaW5pdGlhbGl6ZWQnLCB0cnVlKTtcbiAgICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLWluaXRpYWxpemVkJywgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICAkKCcuZmVlZC1jb250YWluZXInKS5hbmltYXRlKHtvcGFjaXR5OiAxfSk7XG5cbn0sIDApO1xuIl19
