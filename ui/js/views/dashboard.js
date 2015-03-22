
require('../lib/modal');

var request = require('superagent');
var marked = require('marked');


var AmpersandView = require('ampersand-view');
require('../lib/gridster')($);


var DashboardView = AmpersandView.extend({
    events: {

    },

    initialize: function() {

        var $el = $(this.el);
        var width = $el.width();
        var self = this;

        this.gridster = $el.find('.gridster ul').gridster({
            widget_margins: [10, 10],
            widget_base_dimensions: [width / 3, width / 6],
            min_cols: 3,
            max_cols: 3,
            resize: {
                enabled: true,
                stop: function(e, ui, $widget) {
                    self.model.save({
                        layout: this.serialize()
                    });
                    var s = this.serialize();
                    console.log(JSON.stringify(s));
                }
            },
            draggable: {
                stop: function(e, ui, $widget) {
                    self.model.save({
                        layout: this.serialize()
                    });
                    var s = this.serialize();
                    console.log(JSON.stringify(s));
                }
            }
        }).data('gridster');
    }
});

module.exports = DashboardView;
