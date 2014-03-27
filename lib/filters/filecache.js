/*jslint node: true*/
"use strict";

var fs = require('fs'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    path = require('path'),
    util = require('util'),
    _ = require('lodash');

// The idea here is to keep a cache of http responses
// The key if url+headers
// Cache are files holding responses + an .index file holding info about keys and file structure
module.exports = function (folder) {
    var indexPath = path.join(folder, '.index');
    var indexCache = {};
    
    var hashRequest = function (request) {
        // We cache on certain distingushing properties of an request
        var key = JSON.stringify({ 
            uri: request.uri, 
            headers: request.headers 
        });
        
        // double hashing - sweet paranoia...
        return crypto.createHash('md5').update(key, 'utf8').digest('hex')
                + crypto.createHash('sha1').update(key, 'utf8').digest('hex')
    };
    var ensureFolder = function (f, callback) {
        fs.exists(f, function (exists) {
            if (exists){
                return callback();
            }
            mkdirp(f, callback);
        });
    };
    
    return {
        start: function (next, ctx) {
            // start gets called once before any other filter methods and this is a good time
            // to read in the index, i.e. mapping from requests to their cached results.
            fs.exists(indexPath, function (exists){
                if (!exists){
                    return next();
                }
                fs.readFile(indexPath, "utf8", function (error, data) {
                    if (error){
                        return next();
                    }
                    
                    // the format of the file is <hash> <timestamp> <relative path to cached response> <url>
                    indexCache = _(data.split(/(\r|\n)/))
                        .map(function (l) { return l.split('\t'); })   // each line is tab separated
                        .filter(function (l) { return l.length == 4 })
                        .map(function (l) {
                            return {
                                hash: l[0],
                                date: new Date(l[1]),
                                path: path.join(folder,l[2]),
                                url: l[3]
                            }
                        })
                        .indexBy('hash')
                        .value();
                    ;
                    return next();
                });
                
            });
        },
        request: function (task, next, ctx) {
            if (task.hasResult()){
                // another cache won?
                return next();
            }
            if (!task.request){
                // this is weird, no request to be issued
                return next();
            }
            
            // calculate a hash for teh request
            var hash = hashRequest(task.request);
            
            // setup memo for our handling
            var c = task.ext.cache = {
                hash: hash,
                date: new Date(),
                url: task.url,
                path: path.join(folder, hash.substr(0,2), hash + '.cache')
            };
            
            if (!indexCache.hasOwnProperty(c.hash)){
                // this request wasnt cached, to proceed as normal    
                return next();
            }
            
            // we server the content from our cache sp we want to prevent the actual http request
            task.request.abort();
            
            // go ahead and read cached response
            fs.readFile(c.path, 'utf8', function (error, data) {
                if (error) {
                    task.setResult(new Error(util.format('Failed to read cached response for %s [%s]', task.url, error)));
                    return next();
                }
                c.response = JSON.parse(data);
                task.setResult(null, c.response, c.response.body);
                next();
            });
        },
        complete: function (task, next, ctx) {
            var c = task.ext.cache;
            if (!c) {
                // we didnt set up a memo in 'request'
                return next();
            }
            if (c.response) {
                // we replied with a cached response
                return next();
            }
            if (!task.response) {
                // the request in question had no response
                return next();
            }
            if (task.response.statusCode !== 200){
                // the request was no good
                return next();
            }
            if (indexCache.hasOwnProperty(c.hash)){
                // its already cached
                return next();
            }
            
            // update our global memo
            indexCache[c.hash] = c;
            
            // write response to disk
            ensureFolder(path.dirname(c.path), function (err){
                if (err){
                    ctx.emit('error',
                        new Error(util.format('Failed to create cache folder for %s [%s]', task.url, error)),
                        task);
                    return next();
                }
            
                fs.writeFile(c.path, JSON.stringify(task.response), 'utf8', function (error) {
                    if (error) {
                        ctx.emit('error',
                            new Error(util.format('Failed to cache response for %s [%s]', task.url, error)),
                            task);
                        return next();
                    }
                    // update the index file with a new entry
                    fs.appendFile(
                        indexPath,
                        util.format('%s\t%s\t%s\t%s\r\n', 
                                    c.hash,
                                    new Date().toISOString(),
                                    path.relative(folder, c.path), 
                                    task.url),
                        function (error) {
                            if (error){
                                ctx.emit('error',
                                    new Error(util.format('Failed to update cache index for %s [%s]', task.url, error)),
                                    task);
                            }
                            next();
                        });
                });
            });
        }
    };
};