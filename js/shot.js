goog.require('parashutter.html2canvas');
goog.provide('parashutter.shot');

(function(window, undefined) {
    if (!window['parashutter']) {
        window['parashutter'] = {};
    }

    var html2canvas = window.html2canvas || parashutter.html2canvas;
    window['parashutter']['takeScreenshot'] = function() {
        html2canvas(document.body, {
            onrendered: function(canvas) {
                var data = canvas.toDataURL('image/png');
                var w = window.open('about:blank', 'Site');
                w.document.write('<img src="' + data + '" alt="Screenshot" />');
            }
        });
    };
})(window);
