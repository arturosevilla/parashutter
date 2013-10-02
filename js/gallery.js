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
        fancyClose.innerHTML = "x";

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
            window.parashutter.firtSearch = {
                horizontal: {
                    ids: {},
                    results: []
                },
                vertical: {
                    ids: {},
                    results: [] 
                }
            };
        }
        initEventHandlers();
    };

    function sync() {
        window.parashutter.utils.ajax(
            'put',
            '/sample/' + window.parashutter.session,
            window.parashutter._session
        );
    }

    window['parashutter']['clearFirstSearchFlag'] = function() {
        delete  window.parashutter.firstSearch;
    };

    window['parashutter']['loadImage'] = function(element, searchResult, save) {
        element.style.backgroundImage = 'url(' + searchResult.preview + ')';
        var eid = element.getAttribute('id');
        if (!window.parashutter._session[eid]) {
            window.parashutter._session[eid] = {};
        }
        var photo_id = searchResult.photo_id;
        window.parashutter._session[eid] = searchResult;
        if (save) {
            sync();
        }
    };

    window['parashutter']['searchForImages'] = function(width, height, color, keywords, callback) {
        if (window.parashutter.firstSearch) {
            var field;
            if (width >= height) {
                field = window.parashutter.firstSearch.horizontal;
            } else {
                field = window.parashutter.firstSearch.vertical;
            }
            if (field.results.length > 0) {
                callback(field.results);
                return;
            }
        }
        window.parashutter.utils.ajax(
            'get',
            '/' + width + 'x' + height + '/' + color + '/' + keywords,
            null,
            function(images) {
                if (window.parashutter.firstSearch) {
                    if (width >= height) {
                        window.parashutter.firstSearch.horizontal.results = images;
                        window.parashutter.firstSearch.horizontal.ids = {};
                    } else {
                        window.parashutter.firstSearch.vertical.results = images;
                        window.parashutter.firstSearch.vertical.ids = {};
                    }
                } else {
                    callback(images);
                }
            }
        );
    };

    window['parashutter']['getSelectedColors'] = function(eid) {
        var ss = window.parashutter._session[eid];
        if (!ss || !ss.colors) {
            return window.parashutter.analyzedColors;
        }
        return ss.colors;
    };

    window['parashutter']['setSelectedColors'] = function(eid, colors) {
        var ss = window.parashutter._session[eid];
        if (!ss) {
            window.parashutter._session[eid] = {};
        }
        window.parashutter._session[eid]['colors'] = colors;
    };

    window['parashutter']['getSelectedVariations'] = function(eid) {
        var varCt = window.parashutter._session[eid];
        if (!varCt || !varCt.variations || varCt.variations.length !== 3) {
            return [0, 0, 0];
        }
        return varCt.variations;
    };

    window['parashutter']['setSelectedVariations'] = function(eid, variations) {
        if (variations.length !== 3) {
            return;
        }
        var varCt = window.parashutter._session[eid];
        if (!varCt) {
            window.parashutter._session[eid] = {};
        }
        window.parashutter._session[eid]['variations'] = variations;
    };

    window['parashutter']['getSelectedKeywords'] = function(eid) {
        var kws = window.parashutter._session[eid];
        if (!kws || !kws.keywords) {
            return window.parashutter.keywords;
        }

        return kws.keywords;
    };

    window['parashutter']['setSelectedKeywords'] = function(eid, keywords) {
        var kws = window.parashutter._session[eid];
        if (!kws) {
            window.parashutter._session[eid] = {};
        }
        return window.parashutter._session[eid]['keywords'] = keywords;
    }

    window['parashutter']['getSelectedImage'] = function(eid) {
        var img = window.parashutter._session[eid];
        if (!img) {
            return null;
        }
        return img.photo_id;
    };

    window['parashutter']['openGallery'] = function(eid, openAnimation, loadedAnimation) {
        if (openAnimation) {
            openAnimation();
        }
        window.parashutter.getLikedImages(eid, function(images) {

            var galleryHTML = "";
            images.forEach(function(image) {
                galleryHTML+= "<img style=\"height: 150px\" src=\"" + image.preview + "\" alt=\"" + image.photo_id + "\">"; 
            });

            window.jQuery('#para-fancybox-container').innerHTML = galleryHTML;
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
            'get',
            '/sample/' + window.parashutter.session + '/' + elementId,
            null,
            function(images) {
                callback(JSON.parse(images)['images']);
            }
        );
    };

})(window);
