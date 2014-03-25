/*jslint node: true*/
"use strict";

var util = require('util'),
    request = require('request'),
    uri = require('url'),
    EventEmitter = require('events').EventEmitter,
    q = require('q'),
    _ = require('lodash'),
    cheerio = require('cheerio'),
    Task = require('./task.js'),
    TaskFilters = require('./taskfilters.js')

var Repunt = function (options) {
    options = _.defaults({},options,{connections:8});

    var filters = new TaskFilters();
    var taskQueue = [];
    var urlQueue = [];
    var inProgress = 0;
    
    var self = this;
    var emit = this.emit.bind(this);
    
    // These are final filter actions
    filters.addFinal({
        start: function (next) {
            // when filters are started, we start out timer/queue management
            setImmediate(processQueue);
            emit('start');
            next();
        },
        enqueue: function (task, next) {
            taskQueue.push(task);
            emit('enqueue', task);
            next();
        },
        init: function (task, next) {
            emit('init', task);
            if (task.hasResult()){
                next();
                return filters.apply(self, task, 'complete');
            }
            
            // The final step for initializing a task is normally to issue the request
            task.request = request({uri: task.url}, function (error, response, body) {
                task.setResult(error, response, body);
                filters.apply(self, task, 'complete');
                next();
            });
            
            return filters.apply(self, task, 'request');
        },
        request: function (task, next) {
            if (task.hasResult()){
                next();
                return filters.apply(self, task, 'complete');
            }
            next();
        },
        complete: function (task, next) {
            task.setCompleted();
            emit('complete', task);
            next();
        }
    });

    var processQueue = function () {
        if (urlQueue.length) {
            _(urlQueue).each(function (r) {
                enqueue(r.url, r.referer);
            });
            urlQueue = [];
        }
        dequeue();
        if ((inProgress > 0) || (taskQueue.length > 0) || (urlQueue.length > 0)) {
            setImmediate(processQueue);
        }
        else{
            emit('done');
        }
    };

    var enqueue = function (url, referer) {
        filters.apply(self, new Task(url, referer), 'enqueue');
    };

    var dequeue = function () {
        if (inProgress >= options.connections) {
            return;
        }
        if (taskQueue.length == 0) {
            return;
        }

        var task = taskQueue.pop();
        if (task.isCompleted()) {
            return;
        }

        ++inProgress;

        // whenever the task is completed, we free a slot in the pool
        task.promise.then(
            function () {
                --inProgress;
            },
            function (error, task) {
                emit('error', error, task);
                --inProgress;
            });
        filters.apply(self, task, 'init');
    };

    this.use = function (filter) {
        filters.add(filter);
        return this;
    };
    this.enqueue = function (url, referer) {
        enqueue(url, referer);
        return this;
    };
    this.start = function () {
        filters.start(self);
        return this;
    };
};

Repunt.prototype = new EventEmitter();

module.exports = Repunt;