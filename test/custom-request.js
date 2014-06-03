var assert = require('assert'),
    http = require('http'),
    repunt = require('../'),
    request = require('request');

describe('options', function () {
    var testUrl = 'http://localhost:8899/once';
    var testPort = 8899;

    var httpServer = http.createServer(function (req, res) {
        return res.end('hello world');
    });

    before(function () {
        httpServer.listen(testPort);
    });

    after(function (done) {
        httpServer.close(done);
    });

    it('should allow custom request implementation', function (done) {
        var customRequestCalled = false;

        var r = repunt({
            request: function (){
                customRequestCalled = true;
                return request.apply(request, arguments);
            }
        })
            .use(repunt.once())
            .use({
                complete: function (task, next, ctx) {
                    assert.equal(customRequestCalled, true, 'Custom request was never called');
                    assert.equal(task.body, 'hello world');
                    done();
                }
            })
            .enqueue(testUrl)
            .start();
    });
});