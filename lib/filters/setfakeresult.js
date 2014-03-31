/*jslint node: true*/
"use strict";

module.exports = function (options) {
    options = options || {url: null, error: null, response: null, body: null};
    return {
        request: function (task, next) {
            if (task.url === options.url){
                if (task.request){
                    task.request.abort();
                }
                task.setResult(options.error, options.response, options.body);
            }
            next();
        }
    };
};
