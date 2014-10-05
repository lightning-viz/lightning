
var Datamaps = require('../lib/datamaps');
var _ = require('lodash');
var templateHTML = require('../../templates/viz/map.jade');


var MapViz = function(selector, data, images, opts) {

    var $el = $(selector).first();
    $el.append(templateHTML());




    // expect data to be key value pairs:
    //
    // either 
    //  location -> color,
    //  location -> scalar value
    //  location -> label
    //
    //

    var dataObj = {}; 
    var fills = {
        defaultFill: '#ddd'
    };

    // if the data keys are of length 3, this
    // should be treated as a world map
    var isWorld = _.every(_.keys(data), function(v) {
        return v.length === 3;
    });


    if (true) { // assume everything maps to scalar value for now    
        var color = d3.scale.linear().domain([0,1]).range(['#fff', '#9175f0']);
        // make fill buckets

        _.each(data, function(val, key) {
            var c = color(val);
            fills[c] = c;
            dataObj[key] = {
                fillKey: c,
                value: val
            };
        });
    }



    var map = new Datamap({
        element: $el.find('#map-container')[0],
        height: $el.width() * 0.65,
        scope: (isWorld) ? 'world' : 'usa',
        fills: fills,
        data: dataObj,
        geographyConfig: {        

            popupTemplate: function(geography, data) { //this function should just return a string
                if(data) {
                    return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong><br/>' + data.value + '</div>';
                }
                return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
            },
            highlightBorderColor: '#fff',
            highlightFillColor: '#68a1e5',
        }

    });


};




module.exports = MapViz;