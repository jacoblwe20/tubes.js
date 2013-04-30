# Tube.js

because the internet is a series of tubes, and they need to be managed...

#### what works so far

```javascript
this.net = new Tube({
	maxCalls: 2
});

this.net.pipe({ajax}, {channel : 23, priority : 2});

this.net.pipe({ajax}, {channel : 23, priority : 5});

this.net.pipe({ajax}, {channel : 23, priority : 1, abort : true});

this.net.pipe({ajax}, {channel : 21});

this.net.pause(); // cancle calls and add them back to queue

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