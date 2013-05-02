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