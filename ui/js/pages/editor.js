require('../lib/bigSlide');
$('.menu-link').bigSlide();

var request = require('superagent');

var jsEditorEl = document.getElementById('js-editor');
var styleEditorEl = document.getElementById('style-editor');
var markupEditorEl = document.getElementById('markup-editor');

var CodeMirror = require('../lib/codemirror/codemirror');
require('../lib/codemirror/javascript.js');
require('../lib/codemirror/sass.js');
require('../lib/codemirror/jade.js');

var d3 = require('d3');
var inherits = require('inherits');



setTimeout(function() {
    $('.feed-item-container').addClass('fixed');
}, 500);


var saveVis = function() {
    console.log('SAVE VIZ');

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


var updateJS = function () {

    var dynamicBundleName = 'dynamicallyBundledJavascript';

    var jsVal = jsEditor.getValue();

    request.post('/js/dynamic', {javascript: jsVal}, function(error, res) {
        $('.feed-item-container').removeClass('fixed');
        eval(res.text);

        var Viz = require(dynamicBundleName);
        $('.feed-item').html('');
        new Viz('.feed-item', data, images, options);
        $('.feed-item-container').addClass('fixed');
    }); 
};

var updateStyles = function() {
    
    var stylesVal = styleEditor.getValue();

    request.post('/css/dynamic', {styles: stylesVal}, function(error, res) {
        $('#viz-styles').removeAttr('href').replaceWith('<style id="viz-styles">');
        $('#viz-styles').html(res.text);
    }); 
};

var updateMarkup = function() {

};


var jsEditor, styleEditor, markupEditor;

if(jsEditorEl) {
    jsEditor = CodeMirror.fromTextArea(jsEditorEl, {
        mode: 'text/javascript',
        theme : 'solarized light',
        extraKeys: {
            'Ctrl-Enter': updateJS
        },
        indentUnit: 4
    });
}
if(styleEditorEl) {
    styleEditor = CodeMirror.fromTextArea(styleEditorEl, {
        mode: 'text/x-sass',
        theme : 'solarized light',
        extraKeys: {
            'Ctrl-Enter': updateStyles
        },
        indentUnit: 4
    });
}

if(markupEditorEl) {
    markupEditor = CodeMirror.fromTextArea(markupEditorEl, {
        mode: 'text/x-jade',
        theme : 'solarized light',
        extraKeys: {
            'Ctrl-Enter': updateMarkup
        },
        indentUnit: 4
    });
}


$('.section-header').click(function() {
    $(this).nextAll('.CodeMirror').first().slideToggle();
})

var $feedItem = $('.feed-item');
var type = $feedItem.data('type');
var data = $feedItem.data('data');
var images = $feedItem.data('images');
var options = $feedItem.data('options');

setTimeout(function() {

    var Viz =  require('viz/' + type);

    var vid = $(this).attr('id');
    new Viz('.feed-item', data, images, options);

    $feedItem.data('initialized', true);
    $feedItem.attr('data-initialized', true);
}, 0);
