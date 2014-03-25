/*jslint node: true*/
"use strict";

var uri = require('url');
module.exports = function () {
    return {
        enqueue: function (task, next) {
            if (task.url.indexOf('#') >= 0){
                var parsed = uri.parse(task.url);
                if (parsed.hash) {
                    parsed.hash = '';
                    task.url = uri.format(parsed);
                }
            }
            next();
        }
    };
};