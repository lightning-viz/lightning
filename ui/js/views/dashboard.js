
require('../lib/modal');

var request = require('superagent');
var marked = require('marked');
var _ = require('lodash');


var AmpersandView = require('ampersand-view');
require('../lib/gridster')($);


var DashboardView = AmpersandView.extend({
    events: {
        "submit form#add-visualization": "handleAddVisulization"
    },

    vizs: {},
    dataCache: {},

    initialize: function() {

        var $el = $(this.el);
        var width = $el.width();
        var self = this;

        this.gridster = $el.find('.gridster ul').gridster({
            widget_margins: [40, 40],
            widget_base_dimensions: [(width) / 3 - 80, width / 6],
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
                },

                ignore_dragging: function(e) {
                    return $(e.target).closest('.visualization').length;
                }
            }, 

        }).data('gridster');

        this.$el = $el;
        this.initializeVisualizations();
    },

    initializeVisualizations: function() {

        var self = this;

        this.$el.find('.dashboard-item[data-initialized=false]').each(function() {

            var type = $(this).data('type');
            
            var data = self.getDataForDataSet($(this).data('dataset-id'));
            console.log('got data');
            console.log(data);


            var images = $(this).data('images');
            var options = $(this).data('options');

            var Viz =  require('viz/' + type);

            var vid = $(this).attr('id');
            self.vizs[vid.slice(vid.indexOf('-') + 1)] = new Viz('#' + $(this).attr('id'), data, images, options);
            $(this).data('initialized', true);
            $(this).attr('data-initialized', true);
        });

    },

    getDataForDataSet: function(dataSetId) {
        var d;
        if(this.dataCache[dataSetId]) {
            d = this.dataCache[dataSetId];
        } else {
            d = this.$el.find('.dataset[data-model-id=' + dataSetId + ']').data('data'); 
            this.dataCache[dataSetId] = d;
        }
        return _.cloneDeep(d);
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
