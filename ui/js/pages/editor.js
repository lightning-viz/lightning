require('../lib/bigSlide');
$('.menu-link').bigSlide();

var request = require('superagent');

var editor = document.getElementById('js-editor');

var CodeMirror = require('../lib/codemirror/codemirror');
require('../lib/codemirror/javascript.js');

var d3 = require('d3');
var inherits = require('inherits');


var saveViz = function () {
    console.log('SAVE VIZ')

    var jsVal = editor.getValue();
    eval(jsVal);
    
    var Viz = module.exports;
    $('.feed-item').html('');
    new Viz('.feed-item', data, null, options);


    var url = '/visualizations/types/' + $('.visualization-type').data('id');
    var params = {};
    params.javascript = jsVal;

    request.put(url, params, function(error, res){
        if(error) {
            
            $('.problem-saving').slideDown(function() {
                var $self = $(this);
                setTimeout(function() {
                    $self.slideUp('slow');    
                }, 2000);        
            });
        } else {
            $('.saved').slideDown(function() {
                var $self = $(this);
                setTimeout(function() {
                    $self.slideUp('slow');    
                }, 2000);        
            });
        }
    });


};


var editor = CodeMirror.fromTextArea(editor, {
    mode: 'text/javascript',
    theme : 'solarized light',
    extraKeys: {
        'Ctrl-Enter': saveViz
    }
});


var $feedItem = $('.feed-item');
var type = $feedItem.data('type');
var data = $feedItem.data('data');
var options = $feedItem.data('options');

setTimeout(function() {

    var Viz =  require('viz/' + type);

    var vid = $(this).attr('id');
    new Viz('.feed-item', data, null, options);

    $feedItem.data('initialized', true);
    $feedItem.attr('data-initialized', true);
}, 0);
