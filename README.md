# Tube.js

[![Greenkeeper badge](https://badges.greenkeeper.io/jcblw/tubes.js.svg)](https://greenkeeper.io/)

because the internet is a series of tubes, and they need to be managed...

#### Dependencies

- jQuery

so the ajax object in the code below refers to the [jQuery](http://api.jquery.com/jQuery.ajax/) ajax object, right now it is being used but will probably be migrated from once the code is in a better condition due to limitations.
_JSONP calls will not cancel and will throw an error_

_dont worry we will be backwards compatible_

#### What works so far

```javascript

this.net = new Tube({
	maxCalls: 2
});

var call = this.net.pipe({ajax}, {}); // pipe a request

this.net.pause();

this.net.pipe({ajax}, {}); // pipe another request it queues them
this.net.pipe({ajax}, {priority : 0}); // does not start until resume

call.on("done", function(res){
	// do stuff
}).on("error", function(err){
       this.net.clear(); // clears all calls
       // handle it
}); 

var timer;

//example of use 
$('body').on("mousemove", function(){
	clearTimeout(timer);
	this.net.pause(); // cancel calls and add them back to queue
	timer = setTimeout(function(){
		this.net.ressume(); // resumes calls	
	},1000)
});

// More events comming soon //eg. connection, loading, data

```

## development

first you will need [node](http://nodejs.org) >= 0.6.* 


install grunt CLI

```
npm install -g grunt-cli
```

then install local modules

```
npm install
```

to run grunt and build files

```
grunt
```
the squence right now is : linting then concat then test then minify
