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

                element.searchCache = {
                    element: element,
                    width: width,
                    height: height,
                    resultsQueue: [],
                    index: 0,
                    canSearch: true
                };

                images.push(element.searchCache);
            }
        }
        return images;
    }

    var menuHTML = '<div class="para-bar">' +
        '<a class="para-first para-prev"></a>' +
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
        '<div class="para-arrow_container"><div class="para-arrow_down"></div>' +
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
            var idElement = img.element.getAttribute('id');
            img.element.parentNode.replaceChild(imgBlock, img.element);
            imgBlock.setAttribute('id', idElement);
            img.element = imgBlock;
        }
        img.element.className = 'para-image-replacement ' + img.element.className;
        img.element.innerHTML = menuHTML;

        function getHSLVariations(element) {
            var h = window.jQuery('.slider-hue', element).slider('value');
            var s = window.jQuery('.slider-saturation', element). val().slider('value');
            var l = window.jQuery('.slider-lightness', element).val().slider('value');
            return [h, s, l];
        }

        img.element.doSearch = function() {
            var width  = this.width,
                height = this.height;
            var colors = []
            var hslVariations = getHSLVariations(this);
            var colorsTexts = window.jQuery('.para-pallete-item para-on', img.element).each(function() {
                var displacedColor = window.parashutter.displaceHSL($(this).text());
                colors.push(displacedColor);
                window.jQuery('.para-pallete-item-color', parent).css(
                    'background-color',
                    displacedColor
                );
            });
            var keywords = window.jQuery('.para-input', img.element).val();

            window.parashutter.searchForImages(width, height, colors, keywords, function(images) {
                if (images.length === 0) {
                    img.canSearch = false;
                }
                for (var x in images) {
                    img.resultsQueue.push(images[x]);
                }
            });
        };

        var colors = window.parashutter.getSelectedColors(img.element.id);
        var keywords = window.parashutter.getSelectedKeywords(img.element.id);
        window.console.debug('selected keywords: ' + keywords);
        window.jQuery('.para-input', img.element).val(keywords);
        window.jQuery('.para-pallete-item-text', img.element).each(function(i) {
            var rgbText = '#' + window.parashutter.getRGB(colors[i][0]);
            window.jQuery(this).text(rgbText);
            var parent = window.jQuery(this).parent();

            window.jQuery('.para-pallete-item-color', parent).css(
                'background-color',
                rgbText
            );

            parent.removeClass('para-on').removeClass('para-off');
            if (colors[i][1]) {
                parent.addClass('para-on');
            } else {
                parent.addClass('para-off');
            }
        });

        // setup sliders
        var variations = window.parashutter.getSelectedVariations(img.element.id);
        window.jQuery('.slider-hue', img.element).slider(
            'option', 'value', variations[0]
        );
        window.jQuery('.slider-saturation', img.element).slider(
            'option', 'value', variations[1]
        );
        window.jQuery('.slider-lightness', img.element).slider(
            'option', 'value', variations[2]
        );
    }

    function installEventHandlers() {
        window.jQuery(function() {
            window.jQuery('.para-gallery').click(function() {
                var baseId = this.parentNode.parentNode.getAttribute('id');
                window.parashutter.openGallery(
                    baseId,
                    function() {
                        window.jQuery('.para-loading').removeClass('nodisplay');
                        window.jQuery('#para-fancybox').css("height", "100%");
                        window.jQuery('#para-fancybox').animate({
                            opacity: 1
                        }, 400);
                    },
                    function() {
                        /* remove gif animation */
                        window.jQuery('.para-loading').addClass('nodisplay');
                    }
                );
            });

            window.jQuery(".para-hate, .para-love").click(function(e) {
                e.preventDefault();
                var baseId = this.parentNode.parentNode.getAttribute('id');
                var image = window.parashutter.getSelectedImage(baseId);
                if (image === null) {
                    return;
                }
                if(window.jQuery(this).attr('class').indexOf('para-love') !== -1 ){
                    window.parashutter.like(baseId, image.id);  
                    window.jQuery(this).removeClass('para-love').addClass('para-hate')  
                } else {
                    window.parashutter.unlike(baseId, image.id); 
                    window.jQuery(this).removeClass('para-hate').addClass('para-love') 
                }
            });

            window.jQuery('.para-on, .para-off').click(function(e) {
                e.preventDefault();
                if( window.jQuery(this).attr('class').indexOf('para-on') !== -1 ){ 
                    window.jQuery(this).removeClass('para-on').addClass('para-off')  
                } else { 
                    window.jQuery(this).removeClass('para-off').addClass('para-on') 
                }
            });

            function nullHandler(e) {
                e.preventDefault();
            }

            function nextHandler(e) {
                e.preventDefault();
                var searchCache = this.parentNode.parentNode.searchCache;
                var queue = searchQueue.resultsQueue;
                if (searchCache.index === queue.length - 2 && searchCache.canSearch) {
                    searchCache.element.doSearch();
                } else if (searchCache.index === queue.length - 1) {
                    // disable until search finishes or someone presses prev
                    window.jQuery(this).unbind('click').click(nullHandler);
                } else if (searchCache.index === 0 && queue.length > 1) {
                    window.jQuery('.para-prev', searchCache.element)
                        .unbind('click')
                        .click(prevHandler);
                }
                searchCache.index++;
                window.parashutter.loadImage(searchCache.element, queue[searchCache.index], true);
            }

            function prevHandler(e) {
                e.preventDefault();
                var searchCache = this.parentNode.parentNode.searchCache;
                var queue = searchQueue.resultsQueue;
                if (searchCache.index === 1) {
                    window.jQuery(this).unbind('click').click(nullHandler);
                } else if (searchCache.index === queue.length - 1 && queue.length > 1) {
                    window.jQuery('.para-next', searchCache.element)
                        .unbind('click')
                        .click(nextHandler);
                }
                searchCache.index--;
                window.parashutter.loadImage(searchCache.element, queue[searchCache.index], true);
            }

            function searchHandler(e) {
                this.parentNode.parentNode.doSearch();
            }

            window.jQuery('.para-next').click(nextHandler);
            window.jQuery('.para-prev').click(prevHandler);
            window.jQuery('.slider-hue').slider(
                {min: -1, max: 1}
            ).change(searchHandler);
            window.jQuery('.slider-saturation').slider(
                {min: -1, max: 1}
            ).change(searchHandler);
            window.jQuery('.slider-lightness').slider(
                {min: -1, max: 1}
            ).change(searchHandler);
            window.jQuery('.para-input').change(searchHandler);
        });
    }

    function getAnalyzer(color, quantize, getKeywords) {
        window.parashutter.keywords = getKeywords();
        return function(canvas) {
            var topColors = quantize.getColors(canvas);
            window.console.debug('Colors:');
            window.console.debug(topColors);
            window.parashutter.analyzedColors = [];
            topColors.forEach(function(color) {
                window.parashutter.analyzedColors.push([color, true]);
            });
            var images = findImages();
            installEventHandlers();
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

    function loadJQuery(head) {
        var withJQuery = !!window.jQuery;
        var withJQueryUI = !!window.jQuery.fn.slider;
        if (!withJQueryUI) {
            var cssUINode = document.createElement('link');
            cssUINode.setAttribute('rel', 'stylesheet');
            cssUINode.setAttribute('type', 'text/css');
            cssUINode.setAttribute(
                'href',
                'http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css'
            );
            head.appendChild(cssUINode);
        }

        if (!withJQuery) {
            var jqueryNode = document.createElement('script');
            jqueryNode.setAttribute(
                'src',
                'http://code.jquery.com/jquery-1.9.1.js'
            );
            jqueryNode.setAttribute('type', 'text/javascript');
            head.appendChild(jqueryNode);
        }

        if (!withJQueryUI) {
            var jqueryUINode = document.createElement('script');
            jqueryUINode.setAttribute(
                'src',
                'http://code.jquery.com/ui/1.10.3/jquery-ui.js'
            );
            jqueryUINode.setAttribute('type', 'text/javascript');
            head.appendChild(jqueryUINode);
        }
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


         var html2canvas = window.html2canvas || parashutter.html2canvas;

         var session = getSession(function(sessionId, storedSession) {
             // initialize our session data
             parashutter.session = sessionId;
             parashutter.initGallery(storedSession);
             html2canvas(document.body, {
                 onrendered: getAnalyzer(
                    parashutter.color,
                    parashutter.quantize,
                    parashutter.getKeywords
                )
             });
        });
    };

    loadRequiredFiles();

})(window);

