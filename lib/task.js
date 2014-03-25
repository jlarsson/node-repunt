var _ = require('lodash')
    q = require('q');

module.exports = function (url, referer) {
    var defer = q.defer();
    var isCompleted = false;
    var hasResult = false;
    this.url = url;
    this.referer = referer;
    this.error = null;
    this.response = null;
    this.body = null;
    this.$ = null;
    this.promise = defer.promise;
    this.ext = {};

    defer.promise.then(function () {
        isCompleted = true;
    }, function () {
        isCompleted = true;
    });

    this.isCompleted = function () {
        return isCompleted;
    };
    this.hasResult = function () {
        return hasResult;
    };
    this.setCompleted = function () {
        isCompleted = true;
        if (this.error) {
            return defer.reject(this);
        }
        return defer.resolve(this);
    };
    this.cancel = function () {
        this.setResult('cancelled');
        this.setCompleted();
    };
    this.setResult = function (error, response, body) {
        hasResult = true;
        this.error = error || null;
        this.response = response || null;
        this.body = body || null;
    };
};
