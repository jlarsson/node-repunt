var _ = require('lodash')
    q = require('q'),
    uri = require('url');

var sanitizeUrl = function (url){
    /*
    -- Im not sure wether its good to remove traling slahes so that /foo/bar/ becomes /foo/bar
    if (url){
        var parsed = uri.parse(url);
        if (parsed.path) {
            parsed.pathname = parsed.pathname.replace(/\/+$/ig,'');
            return uri.format(parsed);
        }
    }
    */
    return url;
}

module.exports = function (url, referer) {
    var defer = q.defer();
    var isCompleted = false;
    var hasResult = false;
    this.url = sanitizeUrl(url);
    this.referer = sanitizeUrl(referer);
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
            return defer.reject(this.error, this);
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
