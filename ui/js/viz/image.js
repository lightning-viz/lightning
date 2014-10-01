var d3 = require('d3');
var _ = require('lodash');
var templateHTML = require('../../templates/viz/image.jade');

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
};

var width = 600 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;



var ImageViz = function(selector, data, image, opts) {

    this.$el = $(selector).first();

    this.$el.append(templateHTML({
        image: image
    }));
};


module.exports = ImageViz;



ImageViz.prototype.setImage = function(image) {
    this.$el.find('.image-viz img').attr('src', image + '_small');
    this.$el.find('.image-viz a').attr('href', image);
};


ImageViz.prototype.updateData = function(image) {
    // in this case data should just be an image
    this.setImage(image);
};
