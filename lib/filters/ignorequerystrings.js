/*jslint node: true*/
"use strict";

var uri = require('url'),
    _ = require('lodash'),
    querystring = require('querystring');

module.exports = function (options) {
    if (_.isArray(options)) {
        return {
            enqueue: function (task, next) {
                if (task.url.indexOf('?') >= 0) {
                    var parsed = uri.parse(task.url);
                    var qs = querystring.parse(parsed.query);

                    for (var i = 0; i < options.length; ++i) {
                        delete qs[options[i]];
                    }
                    var search = '?' + querystring.stringify(qs);
                    if (search === '?') {
                        search = null;
                    };
                    if (search !== parsed.search) {
                        parsed.search = search;
                        task.url = uri.format(parsed);
                    }
                }
                next();
            }
        };
    }

    if (options) {
        return {
            enqueue: function (task, next) {
                if (task.url.indexOf('?') >= 0) {
                    var parsed = uri.parse(task.url);
                    parsed.search = null;
                    task.url = uri.format(parsed);
                }
                next();
            }
        };
    }
    return {};
};