var log = require('custom-logger');

exports.DEBUG = -1;
exports.INFO = 0;
exports.WARN = 1;
exports.ERROR = 2;


var config = {
    format: '%timestamp% %event%:%padding% %message%',
    level: exports.DEBUG
};
log.config(config);

exports.config = function(cfg) {
    for (var key in cfg) {
        if (config.hasOwnProperty(key)) {
            config[key] = cfg[key];
        }
    }
    log.config(config);
    return this;
}

log.new({
    debug: { color: 'cyan', level: exports.DEBUG, event: 'debug' }
});

exports.info = log.info;
exports.error = log.error;
exports.warn = log.error;
exports.debug = log.debug;

