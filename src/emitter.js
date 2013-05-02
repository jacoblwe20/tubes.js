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