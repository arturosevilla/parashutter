goog.provide('parashutter.utils');

(function(window, undefined) {

if (String.prototype.trim === undefined) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

if (window['parashutter'] === undefined) {
    window['parashutter'] = {};
}

window['parashutter']['utils'] = {};
window['parashutter']['utils']['getParameterByName'] = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

window['parashutter']['utils']['isCanvasSupported'] = function() {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
};

if (typeof XMLHttpRequest === "undefined") {
    XMLHttpRequest = function() {
        try {
            return new ActiveXObject("Msxml2.XMLHTTP.6.0");
        } catch (e) {}
        try {
            return new ActiveXObject("Msxml2.XMLHTTP.3.0");
        } catch (e) {}
        try {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}

        throw new Error("This browser does not support XMLHttpRequest.");
    };
}

window['parashutter']['utils']['ajax'] = function(method, url, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4){
            if(xhr.status >= 200 && xhr.status < 300){
                if (callback) {
                    callback(xhr.responseText);
                }
            } else {
                alert('Error: '+ xhr.status);
            }
        }
    };
 
    if (data) {
        xhr.send(data); 
    } else {
        xhr.send(null);
    }

};

window['parashutter']['utils']['getCssSize'] = function(element, property) {
    var cssValue = element.style[property];
    if (cssValue === undefined || cssValue === '') {
        return NaN;
    }

    return Number(cssValue.substring(0, cssValue.length - 2));
};


})(window);

