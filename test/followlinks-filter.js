var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt.followLinks()', function (){
    var testUrls = [
        'http://localhost:8899/followlinks/start',
        'http://localhost:8899/followlinks/second',
        'http://localhost:8899/followlinks/third'];
    var testPort = 8899;

    var httpServer = http.createServer(function (req,res){
        switch (req.url){
            case '/followlinks/start':
                res.setHeader('Content-Type','text/html');
                return res.end('<html><body><a href="/followlinks/second"></a><a href="/followlinks/third"></a></body></html>');
            case '/followlinks/second':
                return res.end('second');
            case '/followlinks/third':
                return res.end('third');
        }
        res.statusCode = 404;
        res.end('?');
    });
    
    before(function (){
        httpServer.listen(testPort);
    });
    
    after(function (done){
        httpServer.close(done);
    });

    
    it('should enqueue referenced urls found in <a href="">', function (done){
        var enqueued = {};
        repunt()
            .use(repunt.cheerio())
            .use(repunt.followLinks())
            .on('enqueue', function (task){
                enqueued[task.url] = true;
            })
            .on('done', function (){
                
                for(var i = 0; i < testUrls.length; ++i){
                    assert(enqueued.hasOwnProperty(testUrls[i]), 'Expected linked url to be enqueued: ' + testUrls[i]);
                }
                done();
            })
            .enqueue(testUrls[0])   // enqueue start page only, the rest will follow
            .start();
    });

    it('requires repunt.cheerio() to work', function (done){
        var validUrls = {};
        validUrls[testUrls[0]] = true;  // only the root is expected
        repunt()
            // .use(repunt.cheerio()) - lets see what happens when cheerio() is out...
            .use(repunt.followLinks())
            .on('enqueue', function (task){
                assert(validUrls[task.url]);
            })
            .on('done', function (){
                done();
            })
            .enqueue(testUrls[0])   // enqueue start page only, the rest will follow
            .start();
    });
});
