var assert = require('assert')
    repunt = require('../')

;

describe('repunt', function (){
    it('should inherit from event emitter', function (done){
        var rpnt = repunt();
        rpnt
            .on('test',done)
            .emit('test');
    });
});

/*
describe("once() filter", function () {
    it("should prevent (re-)enqueing of same url", function () {

        assert.equal(1,2);
    });
});
*/