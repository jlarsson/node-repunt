/*jslint node: true*/
"use strict";

var fs = require('fs'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    path = require('path'),
    util = require('util');

module.exports = function (folder) {
    var folderExists = false;

    var ensureFolder = function (f, callback) {
        fs.exists(f, function (exists) {
            if (exists){
                return callback();
            }
            mkdirp(f, callback);
        });
    };
    
    return {
        init: function (task, next, ctx) {
            if (task.hasResult()){
                return next();
            }
            var urlhash = crypto.createHash('md5').update(task.url, 'utf8').digest('hex');
            var c = task.ext.cache = {
                path: path.join(folder, urlhash.substr(0,2), urlhash + '.cache')
            };
            fs.readFile(c.path, function (err, data) {
                if (err) {
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
                return next();
            }
            if (c.response) {
                return next();
            }
            if (!task.response) {
                return next();
            }
            if (task.response.statusCode !== 200){
                return next();
            }
            
            ensureFolder(path.dirname(c.path), function (err){
                if (err){
                    ctx.emit('error',
                        new Error(util.format('Failed to create cache folder for %s [%s]', task.url, error)),
                        task);
                    return next();
                }
            
                fs.writeFile(c.path, JSON.stringify(task.response), function (error) {
                    if (error) {
                        ctx.emit('error',
                            new Error(util.format('Failed to cache response for %s [%s]', task.url, error)),
                            task);
                        return next();
                    }
                    fs.appendFile(
                        path.join(folder, '.index'),
                        util.format('%s\t%s\r\n', path.relative(folder, c.path), task.url),
                        function () {
                            next();
                        });
                });
            });
        }
    };
};