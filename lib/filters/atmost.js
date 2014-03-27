/*jslint node: true*/
"use strict";

module.exports = function (n) {
    return {
        enqueue: function (task, next) {
            // The idea here is to decrement a counter for each task, assumed to denote a distinct uri
            // and then prevent queing when counter reaches zero
            if ((--n) < 0) {
                task.cancel();
            }
            next();
        }
    };
};
