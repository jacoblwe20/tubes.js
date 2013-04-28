


// the core file should start building data structure,
// garbage collecting and destroying and
// handling 


(function($, exports){
  
  var Tubes = function(options){
    this.calls = {};
    this.pending = [];
    this.max = (options.max) ? options.max : 10;
    this.maxChannel = (options.maxChannel) ? 
      options.maxChannel : 2;
    return this;
  };

  Tubes.prototype.pipe = function(ajax, options, error){

    if(!options.channel){
      options.channel = 1; //set to default channel 
    }

    // stop all calls if options
    // check for max in channel

    if(!this.calls[options.channel]){
      // in reality it should look more like this
      //this.calls[options.channel] = new this.Queue(options.channel)
    }
    options.ajax = ajax;
    this.calls[options.channel].push(options);
    
    // initiate call
  };

  Tubes.prototype.fetch = function(channel, index){
    // set tubes events up,
    // replace callbacks
    this.call[channel][index].JQxhr = 
      $.ajax(this.call[channel][index].ajax);
  };

  Tubes.prototype.events = function(channel){

    var that = this;
    this.ready = function(){
      // check for pending
      if(!(that.pending[channel].length)){
        // emit idle handle set in intial options
      }
    };

    this.done = function(){
      // send data to callback
    };

    this.error = function(){
      // send error to handle
    };

    this.abort = function(){
      // emit abort event to a abort handle
    };

  };

  exports.Tubes = Tubes;

}(jQuery, this));

