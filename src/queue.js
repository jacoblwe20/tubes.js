(function(Tubes){

	var Queue = function(id, options){
		if(!(this instanceof Queue)){
			return new Queue(id, option);
		}
		this.queueOptions = options;
		this.queueId = id;
		this.maxPriority = (options.maxPriority) ?
			options.maxPriority :
			3;
		this.calls = {};
		this.maxCalls = (options.maxCalls) ?
			options.maxCalls :
			3;
		this.currentCalls = 0;
	};

	Queue.prototype = Tubes.prototype;

	Queue.prototype.getId = function(){
		return this.queueId();
	};

	Queue.prototype.doneHandle = function(queue, priority, index){
		if(typeof queue.calls[priority][index] === "object"){
			queue.removeCall(priority, index);
		}
		queue.next();
	};

	Queue.prototype.eachCall = function(callback){
		for(var start = 0; start < this.maxPriority + 1; start += 1){
			var set = this.calls[start];

			if(set){
				for(var index = set.length -1; index > -1; index -= 1){
					var call = set[index];

					if(!callback(call, start, index)){
						return null;
					}
				}
			}
		}
	};

	Queue.prototype.addCall = function(options){
		if(!options.priority){
			options.priority = this.maxPriority;
		}

		if(!this.calls[options.priority]){
			this.calls[options.priority] = [];
		}

		var emiter = new this.Emit(options.ajax, options);
		var that = this;
		var index = that.call[options.priority].length;

		this.call[options.priority].push(emiter);
		emiter.on("done", that.doneHandle(that, options.priority, index));
		if(options.auto){
			this.next();
		}
		return emiter;

	};

	Queue.prototype.next = function(){

		var that = this;
		this.eachCall(function(call, start, index){
			if(call){
				call.start();
				that.currentCalls += 1;
				that.progress = 1; // one mean its fetching
			}

			if(that.currentCalls === this.maxCalls){
				return null;
			}

			return true;
		});
	};

	Queue.prototype.stopCalls = function(){
		var that = this;
		this.eachCall(function(call, start, index){
			
			if(call && call.progress){
				call.abort();
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
		this.calls = {};
	};

	Queue.prototype.removeCall = function(priority, index){

		if(typeof this.calls[priority] === "object"){
			this.calls[priority].splice(index, 1);
			if(!this.calls[priority].length){
				this.calls[priority] = null;
			}
		}
	};

	Tubes.prototype.Queue = Queue;

}(Tubes));