/*jslint node: true*/
"use strict";

var uri = require('url');

module.exports = function(n) {
    return {
        complete: function (task, next, ctx) {
            // completed requests follow links
            if (task.$) {
                task.$('img[src]').each(function () {
                    ctx.enqueue(
                        /*url*/uri.resolve(task.url, task.$(this).attr('src')),
                        /*referer*/task.url
                    );
                });
            }
            return next();
        }
    }
};
