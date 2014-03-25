/* This is the layout of a well formed filter doin nothing */
module.exports = {
    start: function (next, ctx) { next(); },
    enqueue: function (task, next, ctx) { next(); },
    init: function (task, next, ctx) { next(); },
    request: function (task, next, ctx) { next(); },
    complete: function (task, next, ctx) { next(); }
};
