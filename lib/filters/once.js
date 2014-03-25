/*jslint node: true*/
"use strict";

module.exports = function () {
    var map = {};
    return {
        enqueue: function (task, next) {
            if (map.hasOwnProperty(task.url)) {
                return task.cancel();
            }
            map[task.url] = 1;
            next();
        }
    };
};