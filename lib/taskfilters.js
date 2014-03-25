var _ = require('lodash'),
    FilterInterface = require('./filterinterface.js');

module.exports = function () {
    var filters = [];
    var finalFilters = [];
    var normalizeFilter = function (filter) {
        return _.assign({}, FilterInterface, filter || {});
    };

    this.add = function (filter) {
        filters.push(normalizeFilter(filter));
    };
    this.addFinal = function (filter) {
        finalFilters.push(normalizeFilter(filter));
    };
    this.apply = function (ctx, task, filterMethodName) {
        var filterQ = _(filters).concat(finalFilters).reverse().value();

        var next = function () {
            if (task.isCompleted()) {
                return;
            }
            if (filterQ.length == 0) {
                return;
            }
            var filter = filterQ.pop();
            filter[filterMethodName](task, next, ctx);
        };
        next();
    };
    this.start = function (ctx) {
        var filterQ = _(filters).concat(finalFilters).reverse().value();
        var next = function () {
            if (filterQ.length == 0) {
                return;
            }
            var filter = filterQ.pop();
            if (!filter._started) {
                filter._started = true;
                filter.start(next, ctx);
            }
        };
        next();
    };
};
