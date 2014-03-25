/*jslint node: true*/
"use strict";

var uri = require('url');

module.exports = function(n) {
    return {
        complete: function (task, next, ctx) {
            // completed requests follow links
            if (task.$) {
                task.$('a[href]').each(function () {
                    ctx.enqueue(
                        /*url*/uri.resolve(task.url, task.$(this).attr('href')),
                        /*referer*/task.url
                    );
                });
            }
            return next();
        }
    }
};
