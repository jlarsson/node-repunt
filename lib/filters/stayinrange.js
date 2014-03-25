/*jslint node: true*/
"use strict";

var uri = require('url'),
    _ = require('lodash');

module.exports = function (urls) {
    var rejected = {};

    return {
        enqueue: function (task, next) {
            var isRejected = rejected.hasOwnProperty(task.url) || _(urls).any(function anon_10(u) {
                return uri.resolve(u, task.url).indexOf(u) !== 0;
            });
            if (isRejected) {
                if (!rejected.hasOwnProperty(task.url)) {
                    //console.log('stayInRange, rejecting:', task.url);
                    rejected[task.url] = 1;
                }
                return task.cancel();
            }
            next();
        }
    };
};