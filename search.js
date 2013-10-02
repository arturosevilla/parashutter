var http = require('http'),
    log  = require('./log.js');

var shutter_USERNAME = 'mintitmediahack';
var shutter_KEY = '817307111f1911a022d3f53f2e7bc78ceda0259b';
var shutter_DOMAIN = 'api.shutterstock.com';

function getQueryString(query) {
    var params = [];
    if (query.hasOwnProperty('color')) {
        params.push('color=' + query.color);
    }

    if (query.hasOwnProperty('keywords')) {
        if (typeof query.keywords === 'string') {
            params.push('searchterm=' + query.keywords);
        } else {
            var keywords = [];
            query.keywords.forEach(function(keyword) {
                keywords.push(encodeURIComponent(keyword));
            });
            params.push('searchterm=' + keywords.join(','));
        }
    }

    if (query.hasOwnProperty('orientation')) {
        params.push('orientation=' + query.orientation);
    } else {
        params.push('orientation=horizontal');
    }

    return params.join('&');
}

function shutterAPICall(options, callback) {
    var request = http.get(options, function(response) {
        var fullResponse = '';
        response.setEncoding('utf8');
        response.on('data', function(data) {
            fullResponse += data.toString();
        }).on('end', function() {
            callback(fullResponse);
        });
    });

    request.on('error', function(error) {
        log.error(error.message);
    });

}

function shutterRequest(query, callback) {
    var options = {
        host: shutter_DOMAIN,
        path: '/images/search.json?' + getQueryString(query),
        auth: shutter_USERNAME + ':' + shutter_KEY
    };

    shutterAPICall(options, function(response) {
        response = JSON.parse(response);
        var searchResponse = {
            count: fullResponse.count,
            results: []
        };
        response.results.forEach(function(imageData) {
            searchResponse.results.push({
                resource_url: imageData.resource_url,
                web_url: imageData.web_url,
                photo_id: imageData.photo_id,
                preview: imageData.preview,
                description: imageData.description
            });
        });
        callback(searchResponse);
    });

}

function imageInfo(imageID, callback) {
    var options = {
        host: shutter_DOMAIN,
        path: '/images/' + imageID + '.json',
        auth: shutter_USERNAME + ':' + shutter_KEY
    };

    shutterAPICall(options, function(response) {
        callback(JSON.parse(response));
    });


}

exports.shutterRequest = shutterRequest;
exports.shutterImageInfo = imageInfo;


