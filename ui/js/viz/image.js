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


var ImageViz = function(selector, data, images, opts) {


    console.log('images');
    console.log(selector);
    console.log(images);

    this.$el = $(selector).first();

    
    this.currentImage = 0;
    this.images = images || [];

    this.$el.append(templateHTML({
        image: this.images[0],
        imageCount: this.images.length
    }));

    var self = this;
    this.$el.find('input.image-slider')[0].oninput = function() {
        self.setImage($(this).val());
    };

    
};


module.exports = ImageViz;


ImageViz.prototype.addImage = function(imageData) {
    this.images.push(imageData);
    this.$el.find('input.image-slider').attr('max', this.images.length - 1);
    this.setImage(this.images.length - 1);
};


ImageViz.prototype.setImage = function(index) {
    this.$el.find('input.image-slider').val(index);
    this.$el.find('.image-viz img').attr('src', this.images[index] + '_small');
    this.$el.find('.image-viz a').attr('href', this.images[index]);
};



ImageViz.prototype.updateData = function(data) {
    // in this case data should just be an image
    this.addImage(data);
};