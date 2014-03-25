var repunt = require('./lib/repunt.js');

// Make filters accessible
repunt.atMost = require('./lib/filters/atmost.js');
repunt.cheerio = require('./lib/filters/cheerio.js');
repunt.fileCache = require('./lib/filters/filecache.js');
repunt.followLinks = require('./lib/filters/followlinks.js');
repunt.followImages = require('./lib/filters/followimages.js');
repunt.once = require('./lib/filters/once.js');
repunt.stayInRange = require('./lib/filters/stayinrange.js');
repunt.trimHashes = require('./lib/filters/trimhashes.js');

module.exports = repunt;