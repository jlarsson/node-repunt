var assert = require('assert'),
    util = require('util');

module.exports = function () {
    var pending = [];
    return {
        add: function (note) {
            pending.push(note);
            return this;
        },
        check: function (note) {
            var i = pending.indexOf(note);
            if (i< 0){
                assert.fail('Unexpected checklist called: ' + note);
            }
            pending.splice(i,1);
            return this;
        },
        verify: function () {
            assert(pending.length === 0, 'Unsatisfied checklist: ' + pending.join('\n\t'));
            return this;
        }
    };
};