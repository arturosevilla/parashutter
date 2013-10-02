goog.provide('parashutter.utils');

if (String.prototype.trim === undefined) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
