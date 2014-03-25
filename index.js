var repunt = require('./lib/repunt.js');

var api = function (options){ return new repunt(options||{}); };


// Make filters accessible
api.atMost = require('./lib/filters/atmost.js');
api.cheerio = require('./lib/filters/cheerio.js');
api.fileCache = require('./lib/filters/filecache.js');
api.followLinks = require('./lib/filters/followlinks.js');
api.followImages = require('./lib/filters/followimages.js');
api.once = require('./lib/filters/once.js');
api.stayInRange = require('./lib/filters/stayinrange.js');
api.trimHashes = require('./lib/filters/trimhashes.js');

module.exports = api;