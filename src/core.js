// Tubes JS is a network manager,
// it allows you to pipe in and out info
// via jquery .ajax method but with pipe 
// you can open and close valves.

// Tubes JS can actually manage tubes for you
// If your pipe gets too full it will queue
// up connections.

// If you want connections to have priority over
// other connections it should.

// Also you can set channels with Tube JS so if
// the channel is now looking for a differnt set
// of data it will.



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

    if(this.calls[options.channel]){
      options.ajax = ajax;
      this.calls[options.channel].push(options);
    }
    
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

