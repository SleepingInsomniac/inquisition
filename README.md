inquisition
===========

Use ajax to call asynchronous php scripts:

```javascript

// create a server instance
var server = new Lx.Server({
	path: '/ajax/'
	// ... other options
});

// send request:
server.get({
	method: 'someMethod',
	params: {p1: true, p2:'parameter 2'},
	onResponse: function(r) {
		console.log('I got a response!', r);
	}
});

```
