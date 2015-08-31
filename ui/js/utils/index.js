var request = require('superagent');
var baseURL = window.lightning.baseURL || window.lightning.host || '/';
console.log(baseURL);

module.exports = {

    addStylesheet: function(url) {
        $('head').append('<link rel="stylesheet" href="' + url + '" type="text/css" />');
    },

    getNamespaceForSession: function(sid) {
        return window.location.origin + '/session' + sid.split('-').join('');
    },

    requireOrFetchViz: function(viz, cb) {
        console.log(viz);
        var self = this;
        try {
            var Viz = require(viz.moduleName || viz.name);
            cb(null, Viz);
        } catch(e) {
            self.addStylesheet(baseURL + 'css/dynamic/viz/?visualizations[]=' + viz.name);
            request(baseURL + 'js/dynamic/viz/?visualizations[]=' + viz.name, function(err, res) {
                if(err) {
                    return cb(err);
                }
                eval(res.text);
                var Viz = require(viz.moduleName || viz.name);
                cb(null, Viz);
            });
        }

    }

};