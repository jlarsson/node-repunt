/*jslint node: true*/
"use strict";

module.exports = function(n) {
    return {
        enqueue: function (task, next) {
            if (--n < 0) {
                task.cancel();
            }
            next();
        }
    };
};
