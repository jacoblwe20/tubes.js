// for testing
var jQuery = (jQuery) ? 
  jQuery : (require) ?
  require('jquery') : null;

(function($, exports){
  
  var Tubes = function(options){
    if(!(this instanceof Tubes)){
      return new Tubes(options);
    }
    this.calls = {};
    this.max = (options.max) ? options.max : 10;
    this.maxChannel = (options.maxChannel) ? 
      options.maxChannel : 2;
    this.state = 1;
    return this;
  };

  Tubes.prototype.pipe = function(ajax, options, error){

    if(!options.channel){
      options.channel = 1; //set to default channel 
    }

    // stop all calls if options
    // check for max in channel

    if(!this.calls[options.channel]){
      this.calls[options.channel] = new this.Queue(options.channel);
    }

    options.ajax = ajax;
    options.auto = this.state;
    this.calls[options.channel].addCall(options);
    //return emitter
    // initiate call
  };

  Tubes.prototype.eachQueue = function(callback){
    for(var key in this.calls){
        var queue = this.calls[key];
        if(queue){
          callback(queue);
        }
    }
  };

  Tubes.prototype.pause = function(){
    if(!this.state){
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

}(jQuery, this));


// also for testing ~ when export doesnt make Tubes global
var Tubes = (Tubes) ? Tubes : this.Tubes;