var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt.once()', function (){
    var testUrl = 'http://localhost:8899/once';
    var testPort = 8899;

    var httpServer = http.createServer(function (req,res){
        return res.end('hello world - once');
    });
    
    before(function (){
        httpServer.listen(testPort);
    });
    
    after(function (done){
        httpServer.close(done);
    });
    
    it('should prevent enqueing of duplicate urls', function (done){
        var hasEnqueued = false;
        
        var r = repunt()
            .use(repunt.once())
            .on('enqueue', function (task){
                assert.equal(task.url, testUrl);
                assert(!hasEnqueued);
                hasEnqueued = true;
            })
            .on('done', function (){
                assert(hasEnqueued);
                done();
            })
            .start();
        for(var i = 0; i < 10; ++i) { r.enqueue(testUrl); }
    });
});
