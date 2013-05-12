/*
 * tubes.js - 0.1.0 
 * Author : Jacob Lowe <http://jacoblowe.me> 
 */

// for testing
var jQuery = (jQuery) ? 
  jQuery : (require) ?
  require('jquery') : null; // if were in node require jquery
  // probably would work with require js too maybe.

(function(exports){
  
  // Tubes Constructor
  // Create an instance of Tubes
  // You can pass in a object that will allow you to settup
  // some basic restrictions on the ajax calls within the instance
  // options.maxCalls will limit the number of calls that is made
  // concurrently. options.maxChannel will limit the number of channels 
  // that can be made in a tube.

  var Tubes = function(options){
    //
    if(!(this instanceof Tubes)){
      return new Tubes(options);
    }
    this.queues = {};
    this.max = (options.max) ? options.max : 10;
    this.maxChannel = (options.maxChannel) ? 
      options.maxChannel : 2;
    this.maxCalls = (options.maxCalls) ? 
      options.maxCalls : 10;
    this.state = 1;
    return this;
  };

  // Tubes::pipe
  // // this will create another ajax call in the queues.
  // the first parameter is an object that is very similat
  // to the object you would pass $.ajax since that is exactly what
  // is done in the Queue Constructor
  // 
  // pass in a object to change the behavior and which queue the call will 
  // go into. options.channel will decide which queue the call is
  // inserted into, options.maxCalls will limit the number calls a queue
  // can make. options also get passed directly to the Queue constructor

  Tubes.prototype.pipe = function(ajax, options){

    if(!options){
      options = {};
    }

    if(!options.channel){
      options.channel = 1; //set to default channel 
    }

    options.maxCalls = this.maxCalls;

    if(!this.queues[options.channel]){
      this.queues[options.channel] = new this.Queue(options); // create a new queue
      // and push it into out queues object
    }

    options.ajax = ajax;
    options.auto = this.state;

    return this.queues[options.channel].addCall(options); // this will return an instance
    // of the Emit Constructor so .on methods can be attached
  };

  // Tubes::eachQueue 
  // is a small utility that will loop through all queues activly in stored queues
  // a function can be passed and as an callback to access each queue individually

  Tubes.prototype.eachQueue = function(callback){
    for(var key in this.queues){
        var queue = this.queues[key];
        if(queue){
          callback(queue);  // returns first param as queue
        }
    }
  };

  // Tubes::pause
  // will pause all queues and set the Tube state to 0 not allowing other
  // calls to start, also locks all queues, and stops all calls;

  Tubes.prototype.pause = function(){
    if(this.state){
      this.state = 0;
      this.eachQueue(function(queue){
        queue.lock().stopCalls();
      });
    }
  };

  // Tubes::ressume
  // is the opposite of Tubes::pause and will unlock all queues and restart any
  // stopped calls by calling Queue::next

  Tubes.prototype.resume = function(){
    if(!this.state){
      this.state = 1;
      this.eachQueue(function(queue){
        queue.unlock().next();
      });
    }
  };

  // Tubes::clear
  // is a utitlity that allows you to remove all calls in each queue and restore
  // Tube to initial state, it does not lock Tube 

  Tubes.prototype.clear = function(){
    this.eachQueue(function(queue){
      queue.removeAllCalls();
    });
  };

  exports.Tubes = Tubes; // attach code to this

}(this)); // use this to attach to window or scope that code is current in


// also for testing ~ when export doesnt make Tubes global
var Tubes = (Tubes) ? Tubes : this.Tubes;

(function(Tubes){

	// _QueueCount is a private variable that
	// help manage the ids of each Queue instance

	var _QueueCount = 0;

	// Queue Constructor
	// Queue is a object that will make stop hold on to
	// ajax calls. It stores all calls and emitters, but also
	// clean out garbage that collect from older calls
	// You can pass a number of options as an object to Queue that will
	// allow you to control the behavior of the queue,
	// options.maxPriority will allow you to set the maxPriority so that you
	// dont have a ton of keys to loop though in you calls object.
	// options.maxCalls will limit the number of calls that the queue can make,
	// this includes across multiple prioriy groups

	var Queue = function(options){
		// magical innvocation
		if(!(this instanceof Queue)){
			return new Queue(options);
		}

		this.queueOptions = options;
		this.maxPriority = (options.maxPriority) ?
			options.maxPriority :
			3;
		this.calls = {};
		this.emitters = {};
		this.maxCalls = (options.maxCalls) ?
			options.maxCalls :
			10;
		this.currentCalls = 0;
		this._lock = 0;
		_QueueCount += 1;
		this.id = _QueueCount; // set is to queue count

		return this;
	};

	Queue.prototype = Tubes.prototype; // before we addon extend its prototype
	// with tubes prototype

	// Queue::lock
	// is a simple way to lock a queue so it will not make any new ajax calls

	Queue.prototype.lock = function(){
		this._lock = 1;
		return this;
	};

	// Queue::unlock
	// is the oppisite of Queue::lock and will allow for new ajax calls

	Queue.prototype.unlock = function(){
		this._lock = 0;
		return this;
	};

	// Queue::doneHandle
	// is a method that will remove the call that has just finished and
	// with trigger Queue::next
	// there are three prameters that are passed into Queue::doneHandle
	// queue is the instance of Queue current being used ~ this will probably be removed
	// priority is the priority of the call that is done
	// and index is the index of the call in a priority group
	// a function is returned and called by an event listener

	Queue.prototype.doneHandle = function(queue, priority, index){
		var that = this;
		return function(){
			// remove call
			if(typeof that.calls[priority][index] === "number"){
				that.removeCall(priority, index);
			}
			// go to next if not locked
			if(!queue._lock){
				queue.next();
			}
		};
	};

	// Queue::eachCall
	// is a way to loop through all available calls in the queue
	// the first parater is a function as a callback
	// this function is called on every active call, also if true is
	// returned from the callback function the loop will then break
	// allowing you to stop the loop

	Queue.prototype.eachCall = function(callback){
		for(var start = 0; start < this.maxPriority + 1; start += 1){
			var set = this.calls[start];

			if(set){
				for(var index = 0; index < set.length; index += 1){
					var call = this.emitters[set[index]];

					if(!callback(call, start, index)){
						return null;
					}
				}
			}
		}

		return true;
	};

	// Queue::addCall
	// is a method that add a call to a priority group, also it create a new
	// Emit instance to emit events of the ajax call
	// an options object can be passed into the first param
	// options.priority will set the priority group the call is added into
	// if none is set the call will be set in the maxPriority group,
	// addCall returns a function the will in turn return the emiter that is
	// created by the new call.

	Queue.prototype.addCall = function(options){

		if(!options){
			options = {};
		}

		// make sure 0 doesnt get caught here
		if(typeof options.priority === "undefined"){
			options.priority = this.maxPriority;
		}

		if(!(this.calls[options.priority])){
			this.calls[options.priority] = [];
		}

		var emiter = new this.Emit(options.ajax, options);
		var index = this.calls[options.priority].length;
		var id = this._emitterId += 1;

		this.calls[options.priority].push(id);
		this.emitters[id] = emiter;

		emiter.on("done", this.doneHandle(this, options.priority, index)); // attach
		// done event using Emit::on

		if(!this._lock){
			this.next(); // call new ajax calls if not locked
		}
		
		return function(e){ // map emiter
			return e; // return emiter
		}(emiter); // passing in emiter

	};

	// Queue::next
	// Loops through all the avaible calls and start them if it is not hit the max 
	// amount of calls, also will automatically stop loop in Queue::eachCall when
	// max calls are hit.
	// The queue loops through the higher priority calls first to allow the lesser 
	// calls to be put on hold if maxCalls is hit

	Queue.prototype.next = function(){

		if(!this._lock){
			var that = this;
			this.eachCall(function(call, start, index){
				if(call && !call.state){
					call.start();
					that.progress = 1; // one mean its fetching
					that.currentCalls += 1;
				}

				if(that.currentCalls === that.maxCalls){
					return null;
				}

				return true;
			});
		}
	};

	// Queue::stopCalls
	// will loop through all calls and if they are in progress it will abort the call
	// right now this does not work with jsonp calls

	Queue.prototype.stopCalls = function(){
		var that = this;
		this.eachCall(function(call, start, index){
			if(call && call.xhr){
				call.abort();
				call.state = 0;
				that.currentCalls -= 1;
			}

			if(that.currentCalls === 0){
				return null;
			}
			
			return true;
		});
	};

	// Queue::removeAllCalls
	// is a method that will remove all calls from the queue, and will stop any
	// current calls

	Queue.prototype.removeAllCalls = function(){
		this.stopCalls();
		this.currentCalls = 0;
		this.emitters = {};
		this.calls = {};
	};

	// Queue::removeCall
	// will remove on call in the call list or priority groups
	// the first parameter is priority to select the priority group
	// that the call is in, the next parameter is index which will
	// give the index of the call in the priority group

	Queue.prototype.removeCall = function(priority, index){
		if(typeof this.calls[priority] === "object"){
			this.calls[priority][index] = null;
			this.emitters[index] = null;
			this.currentCalls -= 1;
		}
	};

	Tubes.prototype.Queue = Queue; // add it to tubes prototype

}(Tubes));

(function(Tubes, $){

	// Emit Constructor
	// is a object that will allow you to attach event listeners to
	// ajax calls, right now the only events avaiable are done and error
	// two parameters are passed into the Emit Constructor first ajax is an
	// object that is essentially the jQuery ajax object which you would pass
	// into $.ajax so the object. You really only need the url key but others,
	// will work as expected.
	// THe second parameter is the options parameter which is an object, right 
	// now it is not being used for anything but will soon have some uses with 
	// the behavior of the emmiter

	var Emit = function(ajax, options){
		// magical invoccation
		if(!(this instanceof Emit)){
			return new Emit(ajax, options);
		}

		var that = this;
		// send even out, avoids some doubling up
		var emit = function(fn, xhr, res){
			fn(res, xhr);
		};

		// handle is a private function that with emit the events to all
		// callbacks attached to it, also it is will pass the event to
		// the success or error handlers that may be attached in the ajax object
		// the first parameter is the event type passed in as a string
		// the function return a function that is called by event handlers

		var handle = function(event){
			return function(res){
				if(that[event]){
					for(var index = 0; index < that[event].length; index += 1){
						var callback = that[event][index];
						if(typeof callback === "function"){
							emit(callback, xhr, res);
						}
					}
				}
				if(event === "done" && 
					typeof that.success === "function"){
						that.success(res);
				}
				if(event === "error" && 
					res.statusText !== "abort" &&
					typeof that.error_ === "function"){
						that.error_(res);
				}
			};
		};

		this.ajax = ajax;
		this.open = [];
		this.state = 0;
		this.success = function(a){return a;}(ajax.success); // grab a copy
		this.error_ = function(a){return a;}(ajax.error); // ditto
		this.connection = [];
		this.loading = [];
		this.done = [];
		this.error = [];

		// overwrite ajax settings
		this.ajax.success = handle("done");
		this.ajax.error = handle("error");
		// this really sucks
		// this.ajax.state2 = handle('connection');
		// this.ajax.state3 = handle("loading");

		return this;

	};

	// extend the prototype with Tubes prototype

	Emit.prototype = Tubes.prototype;

	// Emit::on 
	// is a method that allows you to attach event handlers to ajax events
	// multiple event handlers can attached to on emmiter
	// the first parameter in the Emit::on method is a string with the event type
	// the second parameter is a callback function to pass the event to
	// this method return the instance so mutltiple on method my be chained together

	Emit.prototype.on = function(event, callback){
		if(typeof this[event] === "object" &&
			typeof callback === "function"){

			this[event].push(callback);

		}
		return this;
	};

	// Emit::start 
	// will start the ajax call by passing it into $.ajax and will also set the state of
	// the emmiterto 1 to signify that the call has started

	Emit.prototype.start = function(){
		this.state = 1;
		this.xhr = $.ajax(this.ajax);
	};	

	// Emit::abort
	// will abort the ajax call

	Emit.prototype.abort = function(){
		this.xhr.abort();
	};	

	Tubes.prototype.Emit = Emit; // attach it to the tubes

}(Tubes, jQuery));