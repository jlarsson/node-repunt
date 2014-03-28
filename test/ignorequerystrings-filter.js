var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt.ignoreQueryStrings()', function (){
    var testDomain = 'http://localhost:8899/';
    var testUrl = 'http://localhost:8899/ignorequerystrings';
    var testPort = 8899;

    var httpServer = http.createServer(function (req,res){
        switch (req.url){
            case '/ignorequerystrings':
            case '/ignorequerystrings?validqs=1':
                res.setHeader('Content-Type','text/html');
                return res.end('<html><body><a href="?validqs=1&invalidqs=1"></a></body></html>');
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

    
    it('ignoreQueryStrings(true) should remove all', function (done){
        var validUrls = {};
        validUrls[testUrl] = true;
        repunt()
            .use(repunt.ignoreQueryStrings(true))   // -- this is what we test
            .use(repunt.once())
            .use(repunt.cheerio())
            .use(repunt.followLinks())
            .on('enqueue', function (task){
                assert(validUrls[task.url], 'Unexpected enqueing of ' + task.url);
            })
            .on('done', function (){
                done();
            })
            .enqueue(testUrl)
            .start();
    });
    
    it('ignoreQueryStrings([...]) removes by name', function (done){
        var validUrls = {};
        validUrls[testUrl] = true;
        validUrls[testUrl + '?validqs=1'] = true;
        
        repunt()
            .use(repunt.ignoreQueryStrings(['invalidqs']))   // -- this is what we test
            .use(repunt.once())
            .use(repunt.cheerio())
            .use(repunt.followLinks())
            .on('enqueue', function (task){
                assert(validUrls[task.url], 'Unexpected enqueing of ' + task.url);
            })
            .on('done', function (){
                done();
            })
            .enqueue(testUrl)
            .start();
    });
    
});
