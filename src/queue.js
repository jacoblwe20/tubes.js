(function(Tubes){

	var Queue = function(options){

		if(!(this instanceof Queue)){
			return new Queue(options);
		}

		this.queueOptions = options;
		this.maxPriority = (options.maxPriority) ?
			options.maxPriority :
			"3";
		this.calls = {};
		this.emitters = {};
		this.maxCalls = (options.maxCalls) ?
			options.maxCalls :
			"3";
		this.currentCalls = 0;

		return this;
	};

	Queue.prototype = Tubes.prototype;

	Queue.prototype.doneHandle = function(queue, priority, index){
		if(typeof queue.calls[priority][index] === "object"){
			queue.removeCall(priority, index);
		}
		queue.next();
	};

	Queue.prototype.eachCall = function(callback){
		for(var start = 0; start < this.maxPriority + 1; start += 1){
			var set = this.emitters[this.calls[start]];

			if(set){
				for(var index = set.length -1; index > -1; index -= 1){
					var call = set[index];

					if(!callback(call, start, index)){
						return null;
					}
				}
			}
		}
		return true;
	};

	Queue.prototype.addCall = function(options){

		if(!options.priority){
			options.priority = this.maxPriority;
		}
	


		if(!(this.calls[options.priority])){
			this.calls[options.priority] = [];
		}

		var emiter = new this.Emit(options.ajax, options);
		var index = this.calls[options.priority].length;

		this.calls[options.priority].push(index);
		this.currentCalls += 1;
		this.emitters[index] = emiter;

		emiter.on("done", this.doneHandle(this, options.priority, index));
		
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