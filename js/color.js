if (String.prototype.trim === undefined) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

function rgb2hsl(rgb) {
    var r = rgb[0],
        g = rgb[1],
        b = rgb[2];
    var minColor = Math.min(r, g, b);
    var maxColor = Math.max(r, g, b);
    var colorSpan = maxColor - minColor;
    var sumSpan = maxColor + minColor;
    var lightness = sumSpan / 2;
    var hue = 0, saturation = 0;
    if (colorSpan !== 0) {
        if (lightness < 0.5) {
            saturation = colorSpan / sumSpan;
        } else {
            saturation = colorSpan / (2 - sumSpan);
        }
        var spanR = (maxColor - r) / (6 * colorSpan) + 0.5;
        var spanG = (maxColor - g) / (6 * colorSpan) + 0.5;
        var spanB = (maxColor - b) / (6 * colorSpan) + 0.5;
        if (r === maxColor) {
            hue = spanB - spanG;
        } else if (g === maxColor) {
            hue = 1.0 / 3 + spanR - spanB;
        } else {
            hue = 2.0 / 3 + spanG - spanR;
        }
        if (hue < 0) {
            hue += 1;
        } else if (hue > 1) {
            hue -= 1;
        }
    }
    return [hue, saturation, lightness];
}

function getHSL(hsl) {
    return [hsl[0] * 360, hsl[1] * 100, hsl[2] * 100];
}

function _hue2rgb(span1, span2, hue) {
    if (hue < 0) {
        hue += 1;
    } else if (hue > 1) {
        hue -= 1;
    }

    if (6 * hue < 1) {
        return span1 + (span2 - span1) * 6 * hue;
    }
    if (2 * hue < 1) {
        return span2;
    }
    if (3 * hue < 2) {
        return span1 + (span2 - span1) * 6 * (2.0 / 3 - hue);
    }

    return span1;
}

function hsl2rgb(hsl) {
    var h = hsl[0],
        s = hsl[1],
        l = hsl[2];
    if (s === 0) {
        return [l, l, l];
    } else {
        var span2;
        if (l < 0.5) {
            span2 = l * (1 + s);
        } else {
            span2 = s + l * (1 - s);
        }
        var span1 = 2 * l - span2;
        return [
            _hue2rgb(span1, span2, h + 1.0 / 3),
            _hue2rgb(span1, span2, h),
            _hue2rgb(span1, span2, h - 1.0 / 3)
        ];
    }
}

function getRGB(rgb) {
    var r = Math.round(rgb[0] * 255, 0);
    var g = Math.round(rgb[1] * 255, 0);
    var b = Math.round(rgb[2] * 255, 0);
    return (r.toString(16) + g.toString(16) + b.toString(16)).toUpperCase();
}

function _parseColor(color, percentage) {
    var divisor = 255.0;
    if (percentage) {
        color = color.replace('%', '');
        divisor = 100.0;
    }
    return Number(color) / divisor;
}

function rgbFromString(colorString) {
    // trim our colorString
    colorString = colorString.trim().toLowerCase();
    var rgbIndex = -1;
    rgbIndex = colorString.substr(0, 4) === 'rgb(' ? 4 : -1;
    if (rgbIndex === -1) {
        rgbIndex = colorString.substr(0, 5) === 'rgba(' ? 5 : -1;
    }
    var red, green, blue;
    if (rgbIndex > 0) {
        colorString = colorString.substr(rgbIndex);
        var lastColorIndex = colorString.indexOf(')');
        if (lastColorIndex < 0) {
            return null;
        }
        var colors = colorString.substr(0, lastColorIndex).split(',');
        if (colors.length < 3) {
            return null;
        }
        red = _parseColor(colors[0].trim(), colors[0].indexOf('%') > 0);
        green = _parseColor(colors[1].trim(), colors[1].indexOf('%') > 0);
        blue = _parseColor(colors[2].trim(), colors[2].indexOf('%') > 0);
    } else if (/^#?[0-9a-f]{6}([0-9a-f]{2})?$/.test(colorString)){
        red = parseInt(colorString.substr(0, 2), 16) / 255.0;
        green = parseInt(colorString.substr(2, 2), 16) / 255.0;
        blue = parseInt(colorString.substr(4, 2)) / 255.0;
    } else {
        return null;
    }
    if (isNaN(red) || isNaN(green) || isNaN(blue)) {
        return null;
    }
    return [red, green, blue]; 
}
