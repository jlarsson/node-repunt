var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt.trimHashes()', function (){
    var testDomain = 'http://localhost:8899/';
    var testUrl = 'http://localhost:8899/trimhashes';
    var testPort = 8899;

    var httpServer = http.createServer(function (req,res){
        switch (req.url){
            case '/trimhashes':
                res.setHeader('Content-Type','text/html');
                return res.end('<html><body><a href="#first-hash"></a><a href="/trimhashes#seconhash"></body></html>');
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

    
    it('should remove hash (\'#\') in urls', function (done){
        var validUrls = {};
        validUrls[testUrl] = true;
        repunt()
            .use(repunt.trimHashes())   // -- this is what we test
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
