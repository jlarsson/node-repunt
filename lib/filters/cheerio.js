/*jslint node: true*/
"use strict";

var cheerio = require('cheerio'),
    _ = require('lodash');

module.exports = function (){
    return {
        complete: function (task, next) {
            if (task.$){
                // someone already defined jquery, bail out
                return next();
            }
            if (!task.body){
                // nothing to analyze, bail out
                return next();
            }
            if (!_.isString(task.body)){
                // prefer textual content...
                return next();
            }
            if (!task.response) {
                // Somehow we have to http response, bail out
                return next();
            }
            if (!task.response.headers) {
                return next();
            }
            if ((task.response.headers['content-type'] || '').indexOf('text') !== 0){
                // prefer textual content...
                return next();
            }
            
            // The straight forward way of defining task.$ would be <<task.$ = cheerio.load(task.body);>>, but lazy parsing is perhaps to prefer
            Object.defineProperty(task, '$', {
                configurable: false,
                enumerable: true,
                //writable: false,
                get: function () {
                    // fyi, _this_ refers to the task instance ...
                    return this.ext.cheerio || (this.ext.cheerio = cheerio.load(task.body));
                },
                set: function (v) { this.ext.cheerio = v; }
            });
            next();
        }
    };
};