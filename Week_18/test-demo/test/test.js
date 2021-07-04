var assert = require('assert');
import { add, mul } from '../add.js';
// var add = require('../add.js').add;
// var mul = require('../add.js').mul;
describe("add functin testing", function () {
    it('1 + 2 should be 3', function () {
        assert.equal(add(1, 2), 3);
    });
    it('-5 + 2 should be -3', function () {
        assert.equal(add(-5, 2), -3);
    });
    it('-5 * 2 should be -10', function () {
        assert.equal(mul(-5, 2), -10);
    });
})
