var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt.cheerio()', function (){
    var testBaseUrl = 'http://localhost:8899/cheerio';
    var testPort = 8899;

    var httpServer = http.createServer(function (req,res){
        switch (req.url){
            case '/cheerio/parseable': {
                res.setHeader('Content-Type','text/html');
                return res.end('<html><head><title>Cheerio</title></head><body><h1>Cheerio World</h1></body></html>');
            }
            case '/cheerio/binary': {
                res.setHeader('Content-Type','application/octet-stream');
                return res.end('<html><head><title>Cheerio</title></head><body><h1>Cheerio World</h1></body></html>');
            }
                
            res.statusCode = 404;
            res.end('?');
        }
        return res.end('hello evented world');
    });
    
    before(function (){
        httpServer.listen(testPort);
    });
    
    after(function (done){
        httpServer.close(done);
    });
    
    it('should set task.$ to parsing of result markup if content type is text/*', function (done){
        repunt()
            .use(repunt.cheerio())
            .on('complete', function (task) {
                assert(task.$, 'Complete task should have property $ holding cheerio parsing of response');
                assert.equal(task.$('h1').text(),'Cheerio World');
                done();
            })
            .enqueue(testBaseUrl + '/parseable')
            .start();
    });
    it('should not set task.$ if content type is not text/*', function (done){
        repunt()
            .use(repunt.cheerio())
            .on('error', function (error, task){
                assert.fail(task.error);
            })
            .on('complete', function (task) {
                assert(!task.$, 'Complete task not should have property $ holding cheerio parsing of response');
                done();
            })
            .enqueue(testBaseUrl + '/binary2')
            .start();
    });
});
