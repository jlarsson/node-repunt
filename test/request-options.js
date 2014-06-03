var assert = require('assert'),
    http = require('http'),
    repunt = require('../');

describe('request-options', function () {
    var testUrl = 'http://localhost:8899/once';
    var testPort = 8899;

    var httpServer = http.createServer(function (req, res) {
        return res.end(req.headers['x-test'] || 'header x-test not found');
    });

    before(function () {
        httpServer.listen(testPort);
    });

    after(function (done) {
        httpServer.close(done);
    });

    it('should allow custom setup of request options', function (done) {
        var r = repunt({
            createRequestOptions: function (task, options) {
                (options.headers || (options.headers = {}))['x-test'] = 'hello world';
                return options;
            }
        })
            .use(repunt.once())
            .use({
                complete: function (task, next, ctx) {
                    assert.equal(task.body, 'hello world', 'expected response to be value of custom header');
                    done();
                }
            })
            .enqueue(testUrl)
            .start();
    });
});