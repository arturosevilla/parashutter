var express = require('express'),
    log     = require('./log.js'),
    search  = require('./search.js'),
    session = require('./session.js');

var server = express();

/* our main handler */
server.use(express.static(__dirname + '/public'));
server.use('/js', express.static(__dirname + '/js'));
server.use('/css', express.static(__dirname + '/css'));
server.use(express.logger()); 

server.get('/sample/:id', function(request, response) {
    session.getSessionData(request.params.id, function(sessionData) {
        if (!sessionData) {
            response.send({});
        } else {
            response.send(sessionData);
        }
        response.end();
    });
});

server.post('/sample/:sample', function(request, response) {
    var imageData = request.body;
    if (typeof imageData === 'string') {
        imageData = JSON.parse(imageData);
    }
    session.storeSessionData(
        request.params.sample,
        imageData
    );
    response.status(200);
    response.end();
});

server.get('/sample/:sample/:element', function(request, response) {
    session.getTopImages(
        request.params.sample,
        request.params.element,
        function(topImages) {
            response.send({images: topImages || []});
        }
    );
});

server.put('/sample/:sample/:element/:photoid', function(request, response) {
    session.addTopImage(
        request.params.sample,
        request.params.element,
        request.params.photoid
    );
    response.status(201);
    response.end();
});

server.delete('/sample/:sample/:element/:photoid', function(request, response) {
    session.removeTopImage(
        request.params.sample,
        request.params.element,
        request.params.photoid
    );
    response.status(200);
    response.end();
});

server.get('/image/:id', function(request, response) {
    search.shutterImageInfo(request.params.id, function(data) {
        response.send(data);
        response.end();
    });
});

server.get(
    /^\/(\d+)x(\d+)\/(any|([0-9A-Fa-f]{6})(,[0-9A-Fa-f]{6}){1,3})\/((\S+,)*\S+)?$/,
    function(request, response) {
        var params   = request.params,
            width    = params[0],
            height   = params[1],
            colors   = params[2],
            keywords = params[5];
    
        log.debug('Request for image size ' + width + 'x' + height +
                  ', colors ' + colors + ', keywords = ' +
                  (keywords === undefined ? '(no keywords)' : keywords));

        query = {};
        if (colors !== 'any') {
            query.color = colors.split(',')[0];
        }
        if (keywords !== undefined && keywords.length > 0) {
            query.searchterm = keywords;
        }
        if (width >= height) {
            query.orientation = 'horizontal';
        } else {
            query.orientation = 'vertical';
        }

        search.shutterRequest(query, function(data) {
            response.set({
                'Content-Type': 'application/json'
            });
            response.send(data);
            response.end();
        });
    }
);

server.listen(1234);
