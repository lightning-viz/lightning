
var _ = require('lodash');

var utils = {

    preloadImages: function(urls) {
        _.each(urls, function(url) {
            utils.preloadImage(url);
        });
    },

    preloadImage: function(url) {
        var img=new Image();
        img.src=url;
    },
    randomColor: function() {
        return '#'+Math.floor(Math.random()*16777215).toString(16);
    },

    getThumbnail: function(image) {
        return image + '_small';
    }

};


module.exports = utils;