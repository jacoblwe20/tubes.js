(function(Tubes){

	var Queue = function(id, options){
		if(!(this instanceof Queue)){
			return new Queue(id, option);
		}
		this.quequeOptions = options;
		this.queueId = id;
	};

	Queue.prototype = Tubes.prototype;

	Queue.prototype.getId = function(){
		return this.queueId();
	};

	Tubes.prototype.Queue = Queue;

}(Tubes))