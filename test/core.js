var assert = require('assert');
var Tubes = require("../build/tubes.js").Tubes;

describe("Tubes", function(){
	it("should return a new instance of itself", function(){
		assert.equal(true, Tubes({}) instanceof Tubes)
	})
	it("should return a new instance of itself when using new keyword", function(){
		assert.equal(true, new Tubes({}) instanceof Tubes)
	})
});