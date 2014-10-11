
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
    },

    mapRange: function(value, istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    },

    getColors: function(n) {
        var colors = ['#A38EF3', '#7AB2EA', '#57C6B9', '#E96684'];

        var retColors = [];
        for(var i = 0; i<n; i++) {
            retColors.push(colors[ i % colors.length]);
        }

        return retColors;
    }


};


module.exports = utils;