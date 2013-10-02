var search = require('./search.js');

function doSearch(color, keywords) {
    search.shutterRequest({color: color, keywords: keywords}, function(data) {
        console.log(JSON.stringify(data));
    });
}

if (process.argv.length < 4) {
    console.error('Must specify a color (or any) and at least a keyword');
    process.exit(1);
}

doSearch(process.argv[2], process.argv.slice(3));

