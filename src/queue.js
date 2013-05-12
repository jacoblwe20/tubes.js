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