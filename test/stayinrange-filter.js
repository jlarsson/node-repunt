var assert = require('assert'),
    http = require('http'),
    repunt = require('../'),
    checklist = require('./utility/checklist.js');

describe('repunt.stayInRange()', function (){
    var testDomain = 'http://localhost:8899/';
    var testUrl = 'http://localhost:8899/stayinrange';
    var testPort = 8899;

    var markup = ' \
        <html><body>\
            <a href="http://other-invalid-domain.com/start"></a>\
            <a href="http://other-valid-domain.com/start"></a>\
            <a href="https://localhost/same-domain-other-protocol"></a>\
            <a href="http://localhost:80/same-domain-other-port"></a>\
        </body></html>';
    var httpServer = http.createServer(function (req,res){
        switch (req.url){
            case '/stayinrange':
                res.setHeader('Content-Type','text/html');
                return res.end(markup);
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
        
        var l = checklist() // set up a checklist of which urls we expect to be enqueued
            .add('enqueue:' + testUrl)
            .add('enqueue:http://other-valid-domain.com/start');
        
        var validUrls = {};
        validUrls[testUrl] = true;
        repunt()
            .use(repunt.cheerio())
            .use(repunt.followLinks())
            .use(repunt.stayInRange([testDomain,'http://other-valid-domain.com/']))
            .use(repunt.setFakeResult({url: 'http://other-valid-domain.com/start', error: null, response: null, body: null}))   // dont call this url, but treat it as having a result
            .on('enqueue', function (task){
                l.check('enqueue:' + task.url.trim());  // verify enqueing against checlist
            })
            .on('done', function (){
                l.verify();
                done();
            })
            .enqueue(testUrl)
            .start();
    });
});
