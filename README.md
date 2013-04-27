# Tube.js

because the internet is a series of tubes, and they need to be managed...

```javascript
// What I optimally would like the calls to look like
// =====================================================
this.net = new Tube({
maxChannel : 2, 
max: 2,
onIdle : function(){
  alert("the tubes are empty");
}
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

Tubes JS is a network manager, it allows you to pipe in and out info via jquery .ajax method but with pipe you can open and close valves.

Tubes JS can actually manage tubes for you If your pipe gets too full it will queue up connections.

If you want connections to have priority over other connections it should.

Also you can set channels with Tube JS so if the channel is now looking for a differnt set of data it will.

