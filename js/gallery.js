goog.require('parashutter.utils');
goog.provide('parashutter.gallery');

(function(window, undefined) {

    if (!window['parashutter']) {
        window['parashutter'] = {};
    }

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

    window['parashutter']['getLikedImages'] = function(elementId, photoId, callback) {
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
