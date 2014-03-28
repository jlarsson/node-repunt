var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt.stayInRange()', function (){
    var testDomain = 'http://localhost:8899/';
    var testUrl = 'http://localhost:8899/stayinrange';
    var testPort = 8899;

    var httpServer = http.createServer(function (req,res){
        switch (req.url){
            case '/stayinrange':
                res.setHeader('Content-Type','text/html');
                return res.end('<html><body><a href="http://other-domain.com/start"></a><a href="https://localhost/same-domain-other-protocol"></a><a href="http://localhost:80/same-domain-other-port"></a></body></html>');
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

    
    it('should prevent enqueueing of url with domain not in whitelist', function (done){
        var validUrls = {};
        validUrls[testUrl] = true;
        repunt()
            .use(repunt.cheerio())
            .use(repunt.followLinks())
            .use(repunt.stayInRange([testDomain]))
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
