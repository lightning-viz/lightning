var request = require('superagent');
var baseURL = window.lightning.baseURL || '/';
console.log(baseURL);

module.exports = {

    addStylesheet: function(url) {
        $('head').append('<link rel="stylesheet" href="' + url + '" type="text/css" />');
    },

    requireOrFetchViz: function(vizName, cb) {

        var self = this;

        try {
            var Viz = require('viz/' + vizName);

            cb(null, Viz);
        } catch(e) {
            self.addStylesheet(baseURL + 'css/dynamic/viz/?visualizations[]=' + vizName);

            request(baseURL + 'js/dynamic/viz/?visualizations[]=' + vizName, function(err, res) {
                if(err) {
                    return cb(err);
                }

                eval(res.text);

                var Viz = require('viz/' + vizName);
                cb(null, Viz);
            });




        }

    }

};