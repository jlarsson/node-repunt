var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('repunt', function (){
    var testUrl = 'http://localhost:8899/filter-test';
    var testPort = 8899;
    var httpServer = http.createServer(function (req,res){
        switch (req.url){
            case '/filter-test':
                return res.end('start page');
        }
        res.end(404);
    });
    
    before(function (){
        httpServer.listen(testPort);
    });
    after(function (done){
        httpServer.close(done);
    });
    
    it('should call start filter', function (done){
        repunt()
            .use({
                start: function (next,ctx) {
                    next();
                    done();
                }
            })
            .start();
    });

    it('should call enqueue filter', function (done){
        repunt()
            .use({
                enqueue: function (task, next, ctx){
                    assert(!task.error, 'task should not have error: ' + task.error);
                    assert.equal(task.url,testUrl);
                    done();
                }
            })
            .enqueue(testUrl)
            .start();
    });
    it('should call init filter', function (done){
        repunt()
            .use({
                init: function (task, next, ctx){
                    assert(!task.error, 'task should not have error: ' + task.error);
                    assert.equal(task.url,'http://localhost:8899/');
                    done();
                }
            })
            .enqueue('http://localhost:8899/')
            .start();
    });
    it('should call request filter', function (done){
        repunt()
            .use({
                request: function (task, next, ctx){
                    assert(!task.error, 'task should not have error: ' + task.error);
                    assert.equal(task.url,testUrl);
                    done();
                }
            })
            .enqueue(testUrl)
            .start();
    });
    it('should call complete filter', function (done){
        repunt()
            .use({
                complete: function (task, next, ctx){
                    assert(!task.error, 'task should not have error: ' + task.error);
                    assert(task.hasResult(),'complete should only be called for tasks with results');
                    assert(!!task.response, 'completed tasks should have a response');
                    assert.equal(task.body,'start page', 'completed tasks should have a body');
                    assert.equal(task.url,testUrl);
                    done();
                }
            })
            .enqueue(testUrl)
            .start();
    });
});
