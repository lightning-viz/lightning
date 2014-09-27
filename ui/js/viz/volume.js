if(!window.d3) {
    d3 = require('d3');
}
var _ = require('lodash');
var templateHTML = require('../../templates/viz/volume.jade');

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
};

var width = 600 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

var preloadImages = function(urls) {

    _.each(urls, function(url) {
        preloadImage(url);
    });
};


var preloadImage = function(url) {
    var img=new Image();
    img.src=url;
};

var getThumbnail = function(image) {
    return image + '_small';
}


var VolumeViz = function(selector, data, images, opts) {

    preloadImages(_.map(images, getThumbnail));

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


module.exports = VolumeViz;


VolumeViz.prototype.addImage = function(imageData) {
    this.images.push(imageData);
    this.$el.find('input.image-slider').attr('max', this.images.length - 1);
    this.setImage(this.images.length - 1);
};


VolumeViz.prototype.setImage = function(index) {
    this.$el.find('input.image-slider').val(index);
    this.$el.find('.image-viz img').attr('src', getThumbnail(this.images[index]));
    this.$el.find('.image-viz a').attr('href', this.images[index]);
};



VolumeViz.prototype.updateData = function(data) {
    // in this case data should just be an image
    this.addImage(data);
};