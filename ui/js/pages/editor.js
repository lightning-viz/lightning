var request = require('superagent');

var jsEditorEl = document.getElementById('js-editor');
var styleEditorEl = document.getElementById('style-editor');
var markupEditorEl = document.getElementById('markup-editor');
var dataEditorEl = document.getElementById('data-editor');

var CodeMirror = require('../lib/codemirror/codemirror');
require('../lib/codemirror/javascript.js');
require('../lib/codemirror/sass.js');
require('../lib/codemirror/jade.js');

var _ = require('lodash');

var Viz;


setTimeout(function() {
    var $container = $('.feed-item-container').not('.full').addClass('fixed');
    if($(window).height() < 900) {
        $container.css('max-height', $(window).height() * 0.95).css('overflow-y', 'scroll');
    }
}, 500);


var getVizTypeValues = function() {

    var params = {};

    var fieldMap = {
        javascript: jsEditor,
        styles: styleEditor
    };
    _.each(fieldMap, function(val, key) {

        var editorText = val.getValue();
        if(editorText.trim()) {
            params[key] = editorText;
        }
    });

    // todo the sampleData

    return params;

};

var importViz = function() {
    console.log('IMPORT VIZ');
    var url = '/visualizations/types/';
    var params = getVizTypeValues();

    var name = prompt("Please enter the name for this Visualization Type");

    if(name) {
        request.post(url, _.extend(params, {name: name, sampleData: []}), function(err, res) {
            if(err) {
                alert('problem saving!');
            } else {
                window.location.href = '/visualization-types/' + res.body.id;
            }
        });
    }   
};

var saveVis = function() {
    console.log('SAVE VIZ');

    var url = '/visualizations/types/' + $('.visualization-type').data('id');
    var params = getVizTypeValues();

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

$('#save-button').click(saveVis);
$('#import-button').click(importViz);


var updateJS = function () {

    var dynamicBundleName = 'dynamicallyBundledJavascript';

    var jsVal = jsEditor.getValue();

    request.post('/js/dynamic', {javascript: jsVal}, function(err, res) {
        
        if(err) {
            return console.log('Error bundling javascript!');
        }

        try {
            eval(res.text);
            $('.feed-item-container').removeClass('fixed');
            Viz = require(dynamicBundleName);
            $('.feed-item').html('');
            new Viz('.feed-item', data, images, options);
            $('.feed-item-container').not('.full').addClass('fixed');
        } catch (e) {
            console.log('error evaluating js');
        }
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
var updateData = function() {
    try {
        data = JSON.parse(dataEditor.getValue());
        $('.feed-item-container').removeClass('fixed');
        $('.feed-item').html('');
        new Viz('.feed-item', data, images, options);
        $('.feed-item-container').addClass('fixed');
    } catch(e) {
        console.log('fail');
    } 
};


var jsEditor, styleEditor, markupEditor, dataEditor;

if(jsEditorEl) {
    jsEditor = CodeMirror.fromTextArea(jsEditorEl, {
        mode: 'text/javascript',
        theme : 'solarized light',
        extraKeys: {
            'Ctrl-Enter': updateJS,
            'Ctrl-S': saveVis
        },
        indentUnit: 4
    });
}
if(styleEditorEl) {
    styleEditor = CodeMirror.fromTextArea(styleEditorEl, {
        mode: 'text/x-sass',
        theme : 'solarized light',
        extraKeys: {
            'Ctrl-Enter': updateStyles,
            'Ctrl-S': saveVis
        },
        indentUnit: 4
    });
}

if(markupEditorEl) {
    markupEditor = CodeMirror.fromTextArea(markupEditorEl, {
        mode: 'text/x-jade',
        theme : 'solarized light',
        extraKeys: {
            'Ctrl-Enter': updateMarkup,
            'Ctrl-S': saveVis
        },
        indentUnit: 4
    });
}
if(dataEditorEl) {
    dataEditor = CodeMirror.fromTextArea(dataEditorEl, {
        mode: 'text/x-jade',
        theme : 'solarized light',
        extraKeys: {
            'Ctrl-Enter': updateData,
            'Ctrl-S': saveVis
        },
        indentUnit: 4
    });
}


$('.section-header').click(function() {
    $(this).nextAll('.CodeMirror').first().slideToggle();
})

$('.data-button').click(function() {
    console.log($(this).data('data'));
    dataEditor.setValue(JSON.stringify($(this).data('data')));
    updateData();
});

var $feedItem = $('.feed-item');
var type = $feedItem.data('type');
var data = $feedItem.data('data');

console.log(data);
var images = $feedItem.data('images');
var options = $feedItem.data('options');

setTimeout(function() {

    Viz =  require('viz/' + type);

    var vid = $(this).attr('id');
    new Viz('.feed-item', data, images, options);

    $feedItem.data('initialized', true);
    $feedItem.attr('data-initialized', true);
}, 0);
