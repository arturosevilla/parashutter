goog.require('parashutter.color');
goog.require('parashutter.quantize');
goog.require('parashutter.html2canvas');
goog.require('parashutter.text');
goog.require('parashutter.shot');
goog.provide('parashutter.api');

(function(window, undefined) {
    var document = window.document;
    var console = window.console;

    function findImages() {
        return document.getElementsByClassName('parashutter-img');
    }

    function installImageSelector(img) {
    }

    function getAnalyzer(color, quantize, getKeywords) {
        var maxKeywords = getKeywords();
        return function(canvas) {
            var topColors = quantize.getColors(canvas);
            window.console.debug(topColors);
            var images = findImages();
            for (var i = 0; i < images.length; i++) {
                installImageSelector(images[i], color);
            }
        };
    }

    function isCanvasSupported() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    if (!window['parashutter']) {
        window['parashutter'] = {};
    }

    window['parashutter']['analyze'] = function() {
         if (!isCanvasSupported()) {
             alert('<canvas> element not supported!');
             return;
         }

         var parashutter = window['parashutter'];
         var html2canvas = window.html2canvas || parashutter.html2canvas;

         html2canvas(document.body, {
             onrendered: getAnalyzer(
                parashutter.color,
                parashutter.quantize,
                parashutter.getKeywords
            )
         });
    };
})(window);

