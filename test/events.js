var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt', function (){
    var testUrl = 'http://localhost:8899/event-test';
    var testPort = 8899;

    var httpServer = http.createServer(function (req,res){
        switch (req.url){
            case '/event-test':
                return res.end('hello evented world');
        }
        res.end(404);
    });
    
    before(function (){
        httpServer.listen(testPort);
    });
    
    after(function (done){
        httpServer.close(done);
    });
    
    it('should inherit from event emitter', function (done){
        repunt()
            .on('test',done)
            .emit('test');
    });
    it('should emit start event', function (done){
        repunt()
            .on('start',done)
            .start();
    });
    it('should emit enqueue event', function (done){
        repunt()
            .on('enqueue',function (task){
                assert.equal(task.url,testUrl);
                done();
            })
            .enqueue(testUrl)
            .start();
    });
    it('should emit complete event', function (done){
        repunt()
            .on('complete',function (task){
                assert.equal(task.url,testUrl);
                assert(task.hasResult(), 'completed task should have result');
                assert.equal(task.body,'hello evented world', 'completed task should have body');
                done();
            })
            .enqueue(testUrl)
            .start();
    });
    it('should emit done event', function (done){
        repunt()
            .on('done',done)
            .start();
    });
});
