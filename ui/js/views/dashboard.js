
require('../lib/modal');

var request = require('superagent');
var marked = require('marked');


var AmpersandView = require('ampersand-view');
require('../lib/gridster')($);


var DashboardView = AmpersandView.extend({
    events: {
        "submit form#add-visualization": "handleAddVisulization"
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
    },

    handleAddVisulization: function(e) {
        
        e.preventDefault();

        var datasetId = $(e.target).find('select[name=dataset]').val();
        var vizType = $(e.target).find('select[name=type]').val();

        request
          .post('./datasets/' + datasetId + '/visualizations')
          .send({ type: vizType })
          .set('Accept', 'application/json')
          .end(function(err, res){
            console.log(err, res);
          });



        console.log('submit form');
    }
});

module.exports = DashboardView;
