var request = require('superagent');


module.exports = {

    addStylesheet: function(url) {
        $('head').append('<link rel="stylesheet" href="' + url + '" type="text/css" />');
    },

    requireOrFetchViz: function(vizName, cb) {

        var self = this;

        try {
            console.log('trying')
            var Viz = require('viz/' + vizName);
            console.log('got it');
            console.log(Viz);

            cb(null, Viz);
        } catch(e) {
            console.log('fail');

            console.log(e);
            self.addStylesheet('/css/dynamic/viz/?visualizations[]=' + vizName);

            request('/js/dynamic/viz/?visualizations[]=' + vizName, function(err, res) {
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