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