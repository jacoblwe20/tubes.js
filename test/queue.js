var assert = require('assert');
var should = require('should');
var Tubes = require("../build/tubes.js").Tubes;
var Emit = Tubes.prototype.Emit;
var Queue = Tubes.prototype.Queue;

describe("Queue", function(){
	it("should return a new instance of itself", function(){
		assert.equal(true, Queue({}) instanceof Queue)
	})
	it("should return a new instance of itself when using new keyword", function(){
		assert.equal(true, new Queue({}) instanceof Queue)
	})
	it("should return a new instance of itself when called from Tubes", function(){
		var tubes = Tubes({});
		assert.equal(true, tubes.Queue({}) instanceof Queue)
	})
	it("should set its maxCalls by default to three", function(){
		assert.equal("3", Queue({}).maxCalls);
	})
	it("should set its maxPriority by default to three", function(){
		assert.equal("3", Queue({}).maxPriority);
	})
	it("should give you the ability to override maxCalls " + 
		"and maxPriority by adding in options", function(){
		assert.equal("7", Queue({maxCalls: "7"}).maxCalls);
		assert.equal("5", Queue({maxPriority: "5"}).maxPriority);
	})
	it("should have a default state of zero calls", function(){
		assert.equal(0, Queue({}).currentCalls);
	})
	it("should have add a call everytime a Tubes::pipe", function(){
		var tubes = Tubes({});
	
		tubes.pipe({}, {channel : "5", priority : 2});
		tubes.pipe({}, {channel : "5", priority : 2});
		tubes.pipe({}, {channel : "5", priority : 2});

		assert.equal(3, tubes.queues["5"].currentCalls);
	})
});




//we will eventually need some more hardcore testing