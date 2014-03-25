/*jslint node: true*/
"use strict";

var cheerio = require('cheerio'),
    _ = require('lodash');

module.exports = function (){
    return {
        complete: function (task, next) {
            if (task.$){
                return next();
            }
            if (!task.body){
                return next();
            }
            if (!_.isString(task.body)){
                return next();
            }
            if (!task.response) {
                return next();
            }
            if (!task.response.headers) {
                return next();
            }
            if ((task.response.headers['content-type'] || '').indexOf('text') !== 0){
                return next();
            }
            task.$ = cheerio.load(task.body);
            next();
        }
    };
};