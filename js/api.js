goog.require('parashutter.color');
goog.require('parashutter.quantize');
goog.require('parashutter.html2canvas');
goog.require('parashutter.text');
goog.require('parashutter.shot');
goog.require('parashutter.utils');
goog.require('parashutter.history');
goog.provide('parashutter.api');

(function(window, undefined) {
    var document = window.document;
    var console = window.console;

    function findImages() {
        var elements = document.getElementsByClassName('parashutter-img');
        var images = [];
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var id = element.getAttribute('id') || '';
            if (id !== '') {
                var width  = Number(element.getAttribute('width')),
                    height = Number(element.getAttribute('height'));
                if (isNaN(width)) {
                    width = window.parashutter.utils.getCssSize(
                        element,
                        'width'
                    );
                }
                if (isNaN(height)) {
                    height = window.parashutter.utils.getCssSize(
                        element,
                        'height'
                    );
                }

                if (isNaN(width) || isNaN(height)) {
                    continue;
                }

                images.push({
                    element: element,
                    width: width,
                    height: height
                });
            }
        }
        return images;
    }

    function installImageSelector(img, color) {
        
    }

    function getAnalyzer(color, quantize, getKeywords, sessionData) {
        window.parashutter.keywords = getKeywords();
        return function(canvas) {
            var topColors = quantize.getColors(canvas);
            window.console.debug(topColors);
            var images = findImages();
            for (var i = 0; i < images.length; i++) {
                installImageSelector(images[i], color);
            }
        };
    }
    
    function loadSession(sessionId, callback) {
        window.parashutter.utils.ajax(
            'get',
            '/sample/' + sessionId,
            null,
            function(data) {
                window.console.debug('Session data: ' + data);
                callback(sessionId, JSON.parse(data));
            }
        );
    }

    function getSession(afterLoadingCallback) {
        History.Adapter.bind(window,'statechange',function(){
            var state = History.getState(); 
            loadSession(state.session, afterLoadingCallback);
        });
        var session = window.parashutter.utils.getParameterByName('sample');
        if (!session) {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
            session = '';
            for (var i = 0; i < 10; i++) {
                session += chars[Math.floor(Math.random() * chars.length)];
            }
            History.pushState({sample:session}, '', '?sample=' + session);
        } else {
            loadSession(session, afterLoadingCallback);
        }
    }

    if (!window['parashutter']) {
        window['parashutter'] = {};
    }

    window['parashutter']['analyze'] = function() {
         var parashutter = window['parashutter'];
         if (!parashutter.utils.isCanvasSupported()) {
             alert('<canvas> element not supported!');
             return;
         }

         var html2canvas = window.html2canvas || parashutter.html2canvas;

         var session = getSession(function(sessionId, storedSession) {
             // initialize our session data
             parashutter.session = sessionId;
             html2canvas(document.body, {
                 onrendered: getAnalyzer(
                    parashutter.color,
                    parashutter.quantize,
                    parashutter.getKeywords,
                    storedSession
                )
             });
        });
    };
})(window);

