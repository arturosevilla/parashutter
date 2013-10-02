var redis = require('redis'),
    log   = require('./log.js');

var REDIS_PORT = 6379;
var REDIS_HOST = 'localhost';
var MAX_ELEMENTS = 30;

function getConnection() {
    return redis.createClient(REDIS_PORT, REDIS_HOST);
}

exports.getSessionData = function(sessionId, callback) {
    var redisClient = getConnection();
    redisClient.hgetall(sessionId + ':elements', function(err, sessionData) {
        redisClient.quit();
        if (err) {
            log.error(err);
            return;
        }

        callback(sessionData);
    });
};

exports.storeSessionData = function(sessionId, elementsWithImages) {
    if (!/^(\w)+$/.test(sessionId)) {
        return;
    }
    var redisClient = getConnection();

    redisClient.del(sessionId + ':elements', function() {
        var count = 0;
        var toStore = {};
        
        for (var elementId in elementsWithImages) {
            if (elementsWithImages.hasOwnProperty(elementId)) {
                count++;
                if (count > MAX_ELEMENTS) {
                    break;
                }

                toStore[elementId] = elementsWithImages[elementId];
            }
        }
        redisClient.hmset(sessionId + ':elements', toStore);
        redisClient.quit();
    });
};

exports.getTopImages = function(sessionId, elementId, callback) {
    var redisClient = getConnection();

    redisClient.smembers(sessionId + ':' + elementId, function(data) {
        redisClient.quit();
        callback(data);
    });
};

exports.addTopImage = function(sessionId, elementId, photoId) {
    var redisClient = getConnection();
    redisClient.sadd(sessionId + ':' + elementId, photoId);
};

exports.removeTopImage = function(sessionId, elementId, photoId) {
    var redisClient = getConnection();
    redisClient.srem(sessionId + ':' + elementId, photoId);
};

