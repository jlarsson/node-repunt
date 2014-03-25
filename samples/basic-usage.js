var repunt = require('./../index.js')
    fs = require('fs'),
    crypto = require('crypto'),
    path = require('path'),
    cheerio = require('cheerio');

var spider = new repunt()
    .use(repunt.stayInRange(['http://localhost/']))
    .use(repunt.trimHashes())
    .use(repunt.once())
    .use({
        enqueue: function (task, next) {
            if (task.url.indexOf('.jpg') > 0) {
                task.cancel();
            }
            next();
        }
    })
    .use(repunt.atMost(40))
    .use(repunt.cheerio())
    .use(repunt.fileCache('./temp/.cache'));

spider.enqueue('http://localhost/');
//spider.enqueue('http://wiki.zitac.net/');
spider.start();


spider
    .on('start', function (){
        console.log('SPIDER START');
    })
    .on('done', function (){
        console.log('SPIDER DONE');
    })
    .on('enqueue', function (task) {
        //console.log('ENQUEUE',task.url);
    })
    .on('init', function (task) {
        // console.log('INIT',task.url);
    })
    .on('complete', function (task) {
        console.log('COMPLETE',task.url);
        if (task.$){
            console.log(task.$('title').text());
        }
    })
    .on('error', function (error, task) {
        console.log('ERROR',error);
    })

;

