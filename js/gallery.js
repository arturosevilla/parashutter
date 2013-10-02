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

    window['parashutter']['initGallery'] = function() {
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

        window.document.body.appendChild(fancyBox);
        initEventHandlers();
    };

    window['parashutter']['getSelectedImage'] = function(eid) {
        return window.parashutter._images[eid] || null;
    }

    window['parashutter']['openGallery'] = function(eid, openAnimation, loadedAnimation) {
        if (openAnimation) {
            openAnimation();
        }
        window.parashutter.getLikedImages(eid, function(images) {

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
