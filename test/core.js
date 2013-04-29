var assert = require('assert');
var should = require('should');
var Tubes = require("../build/tubes.js").Tubes;
var Emit = Tubes.prototype.Emit;
var Queue = Tubes.prototype.Queue;

describe("Tubes", function(){
	it("should return a new instance of itself", function(){
		assert.equal(true, Tubes({}) instanceof Tubes)
	})
	it("should return a new instance of itself when using new keyword", function(){
		assert.equal(true, new Tubes({}) instanceof Tubes)
	})
	it("should have a start state of one", function(){
		assert.equal(1, Tubes({}).state);
	})
});

describe("Tubes::pipe", function(){
	it("should return a instance of Emit", function(){
		assert.equal(true, Tubes({}).pipe({}) instanceof Emit);
	});
});

describe("Tubes::eachQueue", function(){
	var tube = Tubes({});
	var pipe = tube.pipe({});
	it("should return a new instance of Queue if there is a call added", function(done){
		tube.eachQueue(function(queue){
			queue.should.be.an.instanceOf(Queue);
			done();
		});
	});
});

describe("Tubes::pause", function(){
	var tube = Tubes({});
	it("should change the state of the tube to zero", function(){
		tube.pause();
		assert.equal(0, tube.state);
	});
});

describe("Tubes::resume", function(){
	var tube = Tubes({});
	it("should change the state of the tube to one after being set to zero", function(){
		tube.pause();
		tube.resume();
		assert.equal(1, tube.state);
	});
});

//we will eventually need some more hardcore testing