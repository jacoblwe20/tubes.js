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

	Queue.prototype.eachCall = function(callback){
		for(var start = 0; start < this.maxPriority + 1; start += 1){
			var set = this.calls[start];

			if(set){
				for(var index = 0; index < set.length; index += 1){
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

		this.call[options.priority].push(options.ajax);
	};

	Queue.prototype.next = function(){

		var that = this;
		this.eachCall(function(call, start, index){
			if(call){
				// need to send call to events and attach to emiter
				// the up tick the current calls
				// should attach index to help find on removeCall
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
				// stop ajax call
				// do not remove
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

	Queue.prototype.removeCall = function(){
		// somehow get location of call
		// and then remove whole priority 
		// set if no calls are left
	};

	Tubes.prototype.Queue = Queue;

}(Tubes))