/*
 * tubes.js - 0.0.13 
 * Author : Jacob Lowe <http://jacoblowe.me> 
 */

// for testing
var jQuery = (jQuery) ? 
  jQuery : (require) ?
  require('jquery') : null;

(function(exports){
  
  var Tubes = function(options){
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

  Tubes.prototype.pipe = function(ajax, options){

    if(!options){
      options = {};
    }

    if(!options.channel){
      options.channel = 1; //set to default channel 
    }

    options.maxCalls = this.maxCalls;

    if(!this.queues[options.channel]){
      this.queues[options.channel] = new this.Queue(options);
    }

    options.ajax = ajax;
    options.auto = this.state;

    return this.queues[options.channel].addCall(options);
  };

  Tubes.prototype.eachQueue = function(callback){
    for(var key in this.queues){
        var queue = this.queues[key];
        if(queue){
          callback(queue);
        }
    }
  };

  Tubes.prototype.pause = function(){
    if(this.state){
      this.state = 0;
      this.eachQueue(function(queue){
        queue.lock().stopCalls();
      });
    }
  };

  Tubes.prototype.resume = function(){
    if(!this.state){
      this.state = 1;
      this.eachQueue(function(queue){
        queue.unlock().next();
      });
    }
  };

  Tubes.prototype.clear = function(){
    this.eachQueue(function(queue){
      queue.removeAllCalls();
    });
  };

  exports.Tubes = Tubes;

}(this));


// also for testing ~ when export doesnt make Tubes global
var Tubes = (Tubes) ? Tubes : this.Tubes;

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

(function(Tubes, $){

	var Emit = function(ajax, options){
		// be able to attach events in options
		if(!(this instanceof Emit)){
			return new Emit(ajax, options);
		}

		var that = this;
		// send even out, avoids some doubling up
		var emit = function(fn, xhr, res){
			fn(res, xhr);
		};
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
		this.success = function(a){return a;}(ajax.success); //grab a copy
		this.error_ = function(a){return a;}(ajax.error);
		this.connection = [];
		this.loading = [];
		this.done = [];
		this.error = [];

		//overwrite ajax settings
		this.ajax.success = handle("done");
		this.ajax.error = handle("error");
		// this really sucks
		// this.ajax.state2 = handle('connection');
		// this.ajax.state3 = handle("loading");

		return this;

	};

	Emit.prototype = Tubes.prototype;
	// because we want cool event emiters
	Emit.prototype.on = function(event, callback){
		if(typeof this[event] === "object" &&
			typeof callback === "function"){

			this[event].push(callback);

		}
		return this;
	};

	Emit.prototype.start = function(){
		this.state = 1;
		this.xhr = $.ajax(this.ajax);
	};	

	Emit.prototype.abort = function(){
		this.xhr.abort();
	};	

	Tubes.prototype.Emit = Emit;

}(Tubes, jQuery));