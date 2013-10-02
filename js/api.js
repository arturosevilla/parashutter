goog.require('parashutter.color');
goog.require('parashutter.quantize');
goog.require('parashutter.html2canvas');
goog.require('parashutter.text');
goog.require('parashutter.shot');
goog.require('parashutter.utils');
goog.require('parashutter.history');
goog.require('parashutter.gallery');
goog.provide('parashutter.api');

(function(window, undefined) {
    var document = window.document;
    var console = window.console;
    var $ = null;

    function findImages() {
        var elements = document.getElementsByClassName('parashutter-img');
        var images = [];
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var id = element.getAttribute('id') || '';
            if (id !== '') {
                var widthText  = element.getAttribute('width'),
                    heightText = element.getAttribute('height');
                if (widthText === null) {
                    width = window.parashutter.utils.getCssSize(
                        element,
                        'width'
                    );
                } else {
                    width = Number(widthText);
                }
                if (heightText === null) {
                    height = window.parashutter.utils.getCssSize(
                        element,
                        'height'
                    );
                } else {
                    height = Number(heightText);
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

    var menuHTML = '<div class="para-bar">' +
        '<class="para-first para-prev"></a>' +
        '<a class="para-gallery"></a>' +
        '<a class="para-email"></a>' +
        '<a class="para-buy"></a>' +
        '<a class="para-love"></a>' +
        '<a class="para-last para-next"></a>' +
        '<div class="para-settings">' +
        '<div class="para-settings_panel">' +
        '<div class="para-my_palette">' +
        '<span class="para-title">' +
        'My Palette' +
        '</span>' +
        '<div class="para-pallete-item para-on para-palette-current">' +
        '<span class="para-pallete-item-color">' +
        '</span>' +
        '<span class="para-pallete-item-text">#FFDDE9</span>' +
        '</div>' +
        '<div class="para-pallete-item para-on">' +
        '<span class="para-pallete-item-color">' +
        '</span>' +
        '<span class="para-pallete-item-text">#FFDDE9</span>' +
        '</div>' +
        '<div class="para-pallete-item para-off">' +
        '<span class="para-pallete-item-color">' +
        '</span>' +
        '<span class="para-pallete-item-text">#FFDDE9</span>' +
        '</div>' +
        '<div class="para-pallete-item para-off">' +
        '<span class="para-pallete-item-color">' +
        '</span>' +
        '<span class="para-pallete-item-text">#FFDDE9</span>' +
        '</div>' +
        '</div><div class="para-controls">' +
        '<span class="para-title">' +
        'Controlls' +
        '</span>' +
        '<span class="para-subtitle">' +
        'hue' +
        '</span>' +
        '<div class="slider-hue"></div>' +
        '<span class="para-subtitle">' +
        'saturation' +
        '</span>' +
        '<div class="slider-saturation"></div>' +
        '<span class="para-subtitle">' +
        'brightness' +
        '</span>' +
        '<div class="slider-lightness"></div>' +
        '<span class="para-subtitle">' +
        'keywords <span>separated with a comma</span>' +
        '</span>' +
        '<input type="text" class="para-input" />' +
        '</div>' +
        '<div class="para-arrow_container"><div class="para-arrow_down"></div></a>' +
        '</div>' +
        '</div>' +
        '</div>';

    function installImageSelector(img, color) {
        if (img.element.tagName.toLowerCase() === 'img') {
            // replace by a div element
            var imgBlock = document.createElement('div');
            imgBlock.setAttribute(
                'style',
                'width: ' + img.width + 'px; height: ' + img.height + 'px;'
            );
            img.element.parentNode.replaceChild(imgBlock, img.element);
            img.element = imgBlock;
        }
        img.element.className = 'para-image-replacement ' + img.element.className;
        img.element.innerHTML = menuHTML;
    }

    function installEventHandlers() {
        $('.para-gallery').click(function() {
            var baseId = this.parentNode.parentNode.getAttribute('id');
            window.parashutter.openGallery(
                baseId,
                function() {
                    $('#para-fancybox').css("height", "100%");
                    $('#para-fancybox').animate({
                        opacity: 1
                    }, 400);
                },
                function() {
                    /* remove gif animation */
                }
            );
        });

        $(".para-hate, .para-love").click(function(e) {
            e.preventDefault();
            var baseId = this.parentNode.parentNode.getAttribute('id');
            var imageId = window.parashutter.getSelectedImage(baseId);
            if (imageId === null) {
                return;
            }
            if($(this).attr('class').indexOf('para-love') !== -1 ){
                window.parashutter.like(baseId, imageId);  
                $(this).removeClass('para-love').addClass('para-hate')  
            } else {
                window.parashutter.unlike(baseId, imageId); 
                $(this).removeClass('para-hate').addClass('para-love') 
            }
        });

        $('.para-on, .para-off').click(function(e) {
            e.preventDefault();
            if( $(this).attr('class').indexOf('para-on') !== -1 ){ 
                $(this).removeClass('para-on').addClass('para-off')  
            } else { 
                $(this).removeClass('para-off').addClass('para-on') 
            }
        });

        $('.slider-hue').slider();
        $('.slider-saturation').slider();
        $('.slider-lightness').slider();
    }

    function getAnalyzer(color, quantize, getKeywords, sessionData) {
        window.parashutter.keywords = getKeywords();
        return function(canvas) {
            var topColors = quantize.getColors(canvas);
            window.console.debug('Colors:');
            window.console.debug(topColors);
            var images = findImages();
            for (var i = 0; i < images.length; i++) {
                installImageSelector(images[i], color);
            }
            installEventHandlers();
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

    function loadJQuery(head) {
        var cssUINode = document.createElement('link');
        cssUINode.setAttribute('rel', 'stylesheet');
        cssUINode.setAttribute('type', 'text/css');
        cssUINode.setAttribute(
            'href',
            'http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css'
        );
        head.appendChild(cssUINode);

        var jqueryNode = document.createElement('script');
        jqueryNode.setAttribute(
            'src',
            'http://code.jquery.com/jquery-1.9.1.js'
        );
        jqueryNode.setAttribute('type', 'text/javascript');
        head.appendChild(jqueryNode);
        var jqueryUINode = document.createElement('script');
        jqueryUINode.setAttribute(
            'src',
            'http://code.jquery.com/ui/1.10.3/jquery-ui.js'
        );
        jqueryUINode.setAttribute('type', 'text/javascript');
        head.appendChild(jqueryUINode);
        $ = window.jQuery;
    }

    function loadRequiredFiles() {
        var cssParaNode = document.createElement('link');
        cssParaNode.setAttribute('rel', 'stylesheet');
        cssParaNode.setAttribute('type', 'text/css');
        cssParaNode.setAttribute('href', '/compass-project/stylesheets/parashutter.css');

        var fontNode = document.createElement('link');
        fontNode.setAttribute('rel', 'stylesheet');
        fontNode.setAttribute('type', 'text/css');
        fontNode.setAttribute('href', 'http://fonts.googleapis.com/css?family=Oxygen');

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(cssParaNode);
        head.appendChild(fontNode);

        loadJQuery(head);
    }

    window['parashutter']['analyze'] = function() {
         var parashutter = window['parashutter'];
         if (!parashutter.utils.isCanvasSupported()) {
             alert('<canvas> element not supported!');
             return;
         }

         parashutter.initGallery();

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

    loadRequiredFiles();

})(window);

