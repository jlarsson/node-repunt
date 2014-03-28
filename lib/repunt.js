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

    var taskQueue = [];
    var urlQueue = [];
    var inProgress = 0;
    
    this.filters = new TaskFilters();
    
    // These are final filter actions
    this.filters.addFinal({
        start: function (next) {
            // when filters are started, we start our timer/queue management
            setImmediate(processQueue);
            this.emit('start');
            next();
        }.bind(this),
        enqueue: function (task, next) {
            taskQueue.push(task);
            this.emit('enqueue', task);
            next();
        }.bind(this),
        init: function (task, next) {
            this.emit('init', task);
            if (task.hasResult()){
                next();
                return this.filters.apply(this, task, 'complete');
            }
            
            // The final step for initializing a task is normally to issue the request
            task.request = request({uri: task.url}, function (error, response, body) {
                if (response.statusCode != 200){
                    error = error || response.statusCode;
                }
                task.setResult(error, response, body);
                this.filters.apply(this, task, 'complete');
                next();
            }.bind(this));
            return this.filters.apply(this, task, 'request');
        }.bind(this),
        request: function (task, next) {
            if (task.hasResult()){
                next();
                return this.filters.apply(this, task, 'complete');
            }
            next();
        }.bind(this),
        complete: function (task, next) {
            task.setCompleted();
            this.emit('complete', task);
            next();
        }.bind(this)
    });

    var processQueue = function () {
        if (urlQueue.length) {
            _(urlQueue).each(function (r) {
                this.enqueue(r.url, r.referer);
            });
            urlQueue = [];
        }
        dequeue();
        if ((inProgress > 0) || (taskQueue.length > 0) || (urlQueue.length > 0)) {
            setImmediate(processQueue);
        }
        else{
            this.emit('done');
        }
    }.bind(this);

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
            function (error) {
                this.emit('error', error, task);
                --inProgress;
            }.bind(this));
        this.filters.apply(this, task, 'init');
    }.bind(this);
};

Repunt.prototype = Object.create(EventEmitter.prototype);

Repunt.prototype.start = function (){
    setImmediate(function () { this.filters.start(this); }.bind(this));
    return this;
};
Repunt.prototype.use = function (filter){
    this.filters.add(filter);
    return this;
};
Repunt.prototype.enqueue = function (url, referer){
    this.filters.apply(this, new Task(url, referer), 'enqueue');
    return this;
};

module.exports = Repunt;