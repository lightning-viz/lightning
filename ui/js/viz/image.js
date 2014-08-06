var d3 = require('d3');
var _ = require('lodash');

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
};

var width = 600 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;


var ImageViz = function(selector, data, images, opts) {


    console.log('images');
    console.log(selector);
    console.log(images);

    this.$el = $(selector);

    var self = this;

    _.each(images, function(image) {
        self.addImage(image);
    })
};


module.exports = ImageViz;


ImageViz.prototype.addImage = function(image) {
    var $img = $('<img>');
    $img.attr('src', image);
    this.$el.append($img);
};



ImageViz.prototype.updateData = function(data) {
    // todo append image to current image stack

};