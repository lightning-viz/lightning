'use strict';
var _ = require('lodash');
var titleCase = require('title-case');


module.exports = {



    sortByKey: function(list, key) {
        return _.sortBy(list, key);
    },

    getRandomArbitrary: function(min, max) {
        var val = Math.random() * (max - min) + min;
        return val;
    },

    groupByN: function(arr, size) {
        var arrays = [];
        
        while (arr.length > 0) {
            arrays.push(arr.splice(0, size));
        }

        return arrays;
    },

    titleCase: function(str) {
        return titleCase(str)
    },

    uploadToS3: function(f, callback) {
    }


};