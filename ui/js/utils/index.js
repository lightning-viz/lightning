var request = require('superagent');


module.exports = {

    requireOrFetchViz: function(vizName, cb) {

        try {
            console.log('trying')
            var Viz = require('viz/' + vizName);
            console.log('got it');
            console.log(Viz);

            cb(null, Viz);
        } catch(e) {
            console.log('fail');

            console.log(e);
            request('/js/dynamic/viz/?visualizations[]=' + vizName, function(err, res) {
                if(err) {
                    cb(err);
                }

                eval(res.text);

                var Viz = require('viz/' + vizName);
                cb(null, Viz);
            });


        }

    }

};