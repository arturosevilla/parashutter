goog.require('parashutter.utils');
goog.provide('parashutter.gallery');

(function(window, undefined) {

    if (!window['parashutter']) {
        window['parashutter'] = {};
    }

    function initEventHandlers() {
        window.jQuery("#para-fancybox-close").click(function (){
            window.jQuery('#para-fancybox').animate({
                opacity: 0
            }, 400);
            window.jQuery('#para-fancybox').css("height", "1px");
        });
    }

    window['parashutter']['initGallery'] = function(session) {
        var fancyBox = document.createElement('div');
        fancyBox.setAttribute('id', 'para-fancybox');
        
        var fancyBoxContainer = document.createElement('div');
        fancyBoxContainer.setAttribute('id', 'para-fancybox-container');

        var fancyBoxContent = document.createElement('div');
        fancyBoxContent.setAttribute('id', 'para-fancybox-content');

        var fancyClose = document.createElement('a');
        fancyClose.setAttribute('id', 'para-fancybox-close');

        fancyBoxContent.appendChild(fancyClose);
        fancyBoxContainer.appendChild(fancyBoxContent);
        fancyBox.appendChild(fancyBoxContainer);

        var imgLoading = document.createElement('img');
        imgLoading.setAttribute('src', 'compass-project/images/loading.gif');
        imgLoading.setAttribute('class', 'para-loading');
        fancyBox.appendChild(imgLoading);

        window.document.body.appendChild(fancyBox);
        window.parashutter._session = session;
        if (window.parashutter.utils.isEmptyObject(session)) {
            window.parashutter.firtSearch = true;
        }
        initEventHandlers();
    };

    window['parashutter']['clearFirstSearchFlag'] = function() {
        window.parashutter.firstSearch = false;
    };

    window['parashutter']['searchForImages'] = function(width, height, color, keywords, callback) {
        window.parashutter.utils.ajax(
            'get',
            '/' + width + 'x' + height + '/' + color + '/' + keywords,
            null,
            callback
        );
    };

    window['parashutter']['getSelectedColors'] = function(eid) {
        var ss = window.parashutter._session[eid];
        if (!ss || !ss.colors) {
            return window.parashutter.analyzedColors;
        }
        return ss.colors;
    };

    window['parashutter']['getSelectedKeywords'] = function(eid) {
        var kws = window.parashutter._session[eid];
        if (!kws || !kws.keywords) {
            return window.parashutter.keywords;
        }

        return kws.keywords;
    };

    window['parashutter']['getSelectedImage'] = function(eid) {
        var img = window.parashutter._session[eid];
        if (!img) {
            return null;
        }
        return img.image_id;
    };

    window['parashutter']['setSelectedImage'] = function(eid, image) {
    };

    window['parashutter']['openGallery'] = function(eid, openAnimation, loadedAnimation) {
        if (openAnimation) {
            openAnimation();
        }
        window.parashutter.getLikedImages(eid, function(images) {

            images.forEach(function(image) {
            });

            loadedAnimation();
        });
    };

    window['parashutter']['like'] = function(elementId, photoId) {
        if (!window.parashutter.session) {
            // session hasn't been established
            return;
        }
        window.parashutter.utils.ajax(
            'put',
            '/sample/' + window.parashutter.session + '/' + elementId +
                '/' + photoId
        );
    };

    window['parashutter']['unlike'] = function(elementId, photoId) {
        if (!window.parashutter.session) {
            // session hasn't been established
            return;
        }
        window.parashutter.utils.ajax(
            'delete',
            '/sample/' + window.parashutter.session + '/' + elementId +
                '/' + photoId
        );
    };

    window['parashutter']['getLikedImages'] = function(elementId, callback) {
        if (!window.parashutter.session) {
            // session hasn't been established
            return;
        }
        window.parashutter.utils.ajax(
            'delete',
            '/sample/' + window.parashutter.session + '/' + elementId,
            null,
            function(images) {
                callback(JSON.parse(images)['images']);
            }
        );
    };

})(window);
