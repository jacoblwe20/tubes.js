# Tube.js

because the internet is a series of tubes, and they need to be managed...

#### Dependencies

- jQuery

so the ajax object in the code below refers to the [jQuery](http://api.jquery.com/jQuery.ajax/) ajax object, right now it is being used but will probably be migrated from once the code is in a better condition due to limitations

_dont worry we will be backwards compatible_

#### What works so far

```javascript

this.net = new Tube({
	maxCalls: 2
});

this.net.pipe({ajax}, {}); // pipe a request

this.net.pipe({ajax}, {}); // pipe another request it queues them

this.net.pipe({ajax}, {channel : 23, priority : 1}); // we can send options as well

this.net.pipe({ajax}, {channel : 21});

this.net.pause(); // cancel calls and add them back to queue

this.net.pipe({ajax}, {channel : 21}); // does not start until resume

this.net.resume(); // resumes calls

this.net.clear(); // clears all calls

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