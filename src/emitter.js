(function(Tubes){

	var Emit = function(ajax, options){
		// be able to attach events in options
		if(!(this instanceof Emit)){
			return new Emit(ajax, options);
		}

		var that = this;
		this.ajax = ajax;
		this.open = [];
		this.connection = [];
		this.loading = [];
		this.done = [];

		events.onChange = function(){

			switch (xhr.readyState) {

				case 1 : 
					that.onOpen(xhr);
					break;
				
				case 2 : 
					that.onConnection(xhr);
					break;
				
				case 3 : 
					that.onLoading(xhr);
					break;
				
				case 4 : 
					that.onDone(xhr);
					break;
				

			}

		};

		return this;

	};

	Emit.prototype = Tubes.prototype;
	// because we want cool event emiters
	Emit.prototype.on = function(event, callback){
		if(typeof this[event] === "object" &&
			typeof callback === "function"){

			this.event.push(callback);

		}
	};

	Emit.prototype.listen = function(){
		var that = this;
		var handle = function(event){
			return function(){
				if(that[event]){
					for(var index = 0; index < that[event].length; index += 1){
						var callback = that[event][i];
						if(typeof callback === "function"){
							callback(xhr);
						}
					}
				}
			};
		};

		that.onStart = handle("start");

		that.onOpen = handle("open");

		that.onConnection = handle("connection");

		that.onLoading = handle("loading");

		that.onDone = handle("done");
		
	};

	Emit.prototype.start = function(){
		this.xhr = $.ajax(this.ajax);
		this.listen();
	};	

	Emit.prototype.abort = function(){
		that.xhr.abort();
	};	

	Tubes.prototype.Emit = Emit;

}(Tubes));