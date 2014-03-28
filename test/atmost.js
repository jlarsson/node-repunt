var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt.atmost(n)', function (){
    var testUrl = 'http://localhost:8899/atmost-test';
    var testPort = 8899;

    var httpServer = http.createServer(function (req,res){
        return res.end('hello evented world');
    });
    
    before(function (){
        httpServer.listen(testPort);
    });
    
    after(function (done){
        httpServer.close(done);
    });
    
    it('should prevent enqueing of urls in range [n...]', function (done){
        var max = 4;
        var actual = 0;
        
        var r = repunt()
            .use(repunt.atMost(max))
            .on('complete', function (task) {
                ++actual;
                assert(actual <= max, 'repunt.atMost(n) should discard all n+1 requests');
            })
            .on('done', function (){
                assert.equal(actual, max, 'repunt.atMost(n) failed to discard all n+1 requests');
                done();
            })
            .start();
        for(var i = 0; i < 20; ++i) { r.enqueue(testUrl); }
    });
});
