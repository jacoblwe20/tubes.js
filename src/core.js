// for testing
var jQuery = (jQuery) ? 
  jQuery : (require) ?
  require('jquery') : null; // if were in node require jquery
  // probably would work with require js too maybe.

(function(exports){
  
  // Tubes Constructor
  // Create an instance of Tubes
  // You can pass in a object that will allow you to settup
  // some basic restrictions on the ajax calls within the instance
  // options.maxCalls will limit the number of calls that is made
  // concurrently. options.maxChannel will limit the number of channels 
  // that can be made in a tube.

  var Tubes = function(options){
    //
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

  // Tubes::pipe
  // // this will create another ajax call in the queues.
  // the first parameter is an object that is very similat
  // to the object you would pass $.ajax since that is exactly what
  // is done in the Queue Constructor
  // 
  // pass in a object to change the behavior and which queue the call will 
  // go into. options.channel will decide which queue the call is
  // inserted into, options.maxCalls will limit the number calls a queue
  // can make. options also get passed directly to the Queue constructor

  Tubes.prototype.pipe = function(ajax, options){

    if(!options){
      options = {};
    }

    if(!options.channel){
      options.channel = 1; //set to default channel 
    }

    options.maxCalls = this.maxCalls;

    if(!this.queues[options.channel]){
      this.queues[options.channel] = new this.Queue(options); // create a new queue
      // and push it into out queues object
    }

    options.ajax = ajax;
    options.auto = this.state;

    return this.queues[options.channel].addCall(options); // this will return an instance
    // of the Emit Constructor so .on methods can be attached
  };

  // Tubes::eachQueue 
  // is a small utility that will loop through all queues activly in stored queues
  // a function can be passed and as an callback to access each queue individually

  Tubes.prototype.eachQueue = function(callback){
    for(var key in this.queues){
        var queue = this.queues[key];
        if(queue){
          callback(queue);  // returns first param as queue
        }
    }
  };

  // Tubes::pause
  // will pause all queues and set the Tube state to 0 not allowing other
  // calls to start, also locks all queues, and stops all calls;

  Tubes.prototype.pause = function(){
    if(this.state){
      this.state = 0;
      this.eachQueue(function(queue){
        queue.lock().stopCalls();
      });
    }
  };

  // Tubes::ressume
  // is the opposite of Tubes::pause and will unlock all queues and restart any
  // stopped calls by calling Queue::next

  Tubes.prototype.resume = function(){
    if(!this.state){
      this.state = 1;
      this.eachQueue(function(queue){
        queue.unlock().next();
      });
    }
  };

  // Tubes::clear
  // is a utitlity that allows you to remove all calls in each queue and restore
  // Tube to initial state, it does not lock Tube 

  Tubes.prototype.clear = function(){
    this.eachQueue(function(queue){
      queue.removeAllCalls();
    });
  };

  exports.Tubes = Tubes; // attach code to this

}(this)); // use this to attach to window or scope that code is current in


// also for testing ~ when export doesnt make Tubes global
var Tubes = (Tubes) ? Tubes : this.Tubes;