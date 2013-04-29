/*
 * tubes.js - 0.0.1 
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
        queue.stopCalls();
      });
    }
  };

  Tubes.prototype.resume = function(){
    if(!this.state){
      this.state = 1;
      this.eachQueue(function(queue){
        queue.next();
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
		return function(){
			if(typeof queue.calls[priority][index] === "number"){
				queue.removeCall(priority, index);
			}
			queue.next();
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
			if(call && !call.state){

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
		this.emitters = {};
		this.currentCalls = 0;
	};

	Queue.prototype.removeCall = function(priority, index){

		if(typeof this.calls[priority] === "object"){
			this.calls[priority].splice(index, 1);
			this.emitters[index] = null;
			this.currentCalls -= 1;
			if(!this.calls[priority].length){
				this.calls[priority] = null;
			}
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
		var handle = function(event){
			return function(res){
				if(that[event]){
					for(var index = 0; index < that[event].length; index += 1){
						var callback = that[event][index];
						if(typeof callback === "function"){
							callback(xhr, res);
						}
					}
				}
				if(event === "done"){
					that.success(res);
				}
			};
		};
		this.ajax = ajax;
		this.open = [];
		this.state = 0;
		this.success = function(a){return a;}(ajax.success); //grab a copy
		this.error = ajax.error;
		this.connection = [];
		this.loading = [];
		this.done = [];

		//overwrite ajax settings
		this.ajax.success = handle("done");

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
	};

	Emit.prototype.start = function(){
		this.state = 1;
		this.xhr = $.ajax(this.ajax);
	};	

	Emit.prototype.abort = function(){
		that.xhr.abort();
	};	

	Tubes.prototype.Emit = Emit;

}(Tubes, jQuery));