var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

http.createServer(function (req,res){
    switch (req.url){
        case '/':
            return res.end('page /');
        case '/foo':
            return res.end('page /foo');
        case '/bar':
            return res.end('page /bar');
            
    }
})
.listen(8899);



describe('repunt', function (){
    it('should inherit from event emitter', function (done){
        repunt()
            .on('test',done)
            .emit('test');
    });
    /*it('should emit start event', function (done){
        repunt()
            .on('start',done)
            .start();
    });*/
    it('should emit done event', function (done){
        repunt()
            .on('done',done)
            .start();
    });
    it('should emit enqueue event', function (done){
        repunt()
            .on('enqueue',function (task){
                assert.equal(task.url,'http://localhost:8899/');
                done();
            })
            .enqueue('http://localhost:8899/')
            .start();
    });
});
