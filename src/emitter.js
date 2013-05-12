(function(Tubes, $){

	// Emit Constructor
	// is a object that will allow you to attach event listeners to
	// ajax calls, right now the only events avaiable are done and error
	// two parameters are passed into the Emit Constructor first ajax is an
	// object that is essentially the jQuery ajax object which you would pass
	// into $.ajax so the object. You really only need the url key but others,
	// will work as expected.
	// THe second parameter is the options parameter which is an object, right 
	// now it is not being used for anything but will soon have some uses with 
	// the behavior of the emmiter

	var Emit = function(ajax, options){
		// magical invoccation
		if(!(this instanceof Emit)){
			return new Emit(ajax, options);
		}

		var that = this;
		// send even out, avoids some doubling up
		var emit = function(fn, xhr, res){
			fn(res, xhr);
		};

		// handle is a private function that with emit the events to all
		// callbacks attached to it, also it is will pass the event to
		// the success or error handlers that may be attached in the ajax object
		// the first parameter is the event type passed in as a string
		// the function return a function that is called by event handlers

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
		this.success = function(a){return a;}(ajax.success); // grab a copy
		this.error_ = function(a){return a;}(ajax.error); // ditto
		this.connection = [];
		this.loading = [];
		this.done = [];
		this.error = [];

		// overwrite ajax settings
		this.ajax.success = handle("done");
		this.ajax.error = handle("error");
		// this really sucks
		// this.ajax.state2 = handle('connection');
		// this.ajax.state3 = handle("loading");

		return this;

	};

	// extend the prototype with Tubes prototype

	Emit.prototype = Tubes.prototype;

	// Emit::on 
	// is a method that allows you to attach event handlers to ajax events
	// multiple event handlers can attached to on emmiter
	// the first parameter in the Emit::on method is a string with the event type
	// the second parameter is a callback function to pass the event to
	// this method return the instance so mutltiple on method my be chained together

	Emit.prototype.on = function(event, callback){

		if(event === "success"){
			event = "done"; // pretty muuch just mapping success to done
		}

		if(typeof this[event] === "object" &&
			typeof callback === "function"){

			this[event].push(callback);

		}
		return this;
	};

	// Emit::start 
	// will start the ajax call by passing it into $.ajax and will also set the state of
	// the emmiterto 1 to signify that the call has started

	Emit.prototype.start = function(){
		this.state = 1;
		this.xhr = $.ajax(this.ajax);
	};	

	// Emit::abort
	// will abort the ajax call

	Emit.prototype.abort = function(){
		this.xhr.abort();
	};	

	Tubes.prototype.Emit = Emit; // attach it to the tubes

}(Tubes, jQuery));