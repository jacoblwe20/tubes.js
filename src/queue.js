(function(Tubes){

	var _QueueCount = 0;

	var Queue = function(options){

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
		this.id = _QueueCount;
		this._emitterId = 0;

		return this;
	};

	Queue.prototype = Tubes.prototype;

	Queue.prototype.lock = function(){
		this._lock = 1;
		return this;
	};

	Queue.prototype.unlock = function(){
		this._lock = 0;
		return this;
	};

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

		emiter.on("done", this.doneHandle(this, options.priority, index));

		if(!this._lock){
			this.next();
		}
		
		return function(e){
			return e;
		}(emiter);

	};

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

	// this could be destructive
	Queue.prototype.removeAllCalls = function(){
		this.stopCalls();
		this.currentCalls = 0;
		this.emitters = {};
		this.calls = {};
	};

	Queue.prototype.removeCall = function(priority, index){
		if(typeof this.calls[priority] === "object"){
			this.calls[priority][index] = null;
			this.emitters[index] = null;
			this.currentCalls -= 1;
		}
	};

	Tubes.prototype.Queue = Queue;

}(Tubes));