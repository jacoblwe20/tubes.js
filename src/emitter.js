(function(Tubes){

	var Emit = function(xhr, id){
		if(!(this instanceof Emit)){
			return new Emit(events.)
		}

		var that = this;
		this.xhr = xhr;
		this.open = [];
		this.connection = [];
		this.loading = [];
		this.done = [];

		events.onChange = function(){

			switch (xhr.readyState) {

				case 1 : {
					that.onOpen(xhr);
				}
				case 2 : {
					that.onConnection(xhr);
				}
				case 3 : {
					that.onLoading(xhr);
				}
				case 4 : {
					that.onDone(xhr);
				}

			}

		};
	};

	Emit.prototype = Tubes.prototype;
	// because we want cool event emiters
	Emit.prototype.on = function(event, callback){
		if(typeof this[event] === "object" &&
			typeof callback === "function"){

			this.event.push(callback);

		};
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

		that.onOpen = handle("open");

		that.onConnection = handle("connection");

		that.onLoading = handle("loading");

		that.onDone = handle("done");
		
	};

	Tubes.prototype.Emit = Emit;

}(Tubes));