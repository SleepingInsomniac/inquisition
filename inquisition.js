// ============================
// = Create a server instance =
// ============================
/*

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

*/

(function (Lx) {
	
	// =============================
	// = Set object param defaults =
	// =============================
	Lx.setDefaults = function (defaults, options) {
		for (var i in defaults) {
			if (options[i] == undefined) {
				options[i] = defaults[i];
			}
		}
		return options;
	}
	
	// =================================
	// = The server object constructor =
	// =================================
	Lx.Server = function (options) {
		
		// set the defaults for the path (the location you handle ajax requests from)
		options = Lx.setDefaults({
			path: '/ajax/',
			indicator: {},
			timeout: 5000,
			contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
			json: true
		}, options);
		
		// call backs for ajax events
		options.indicator = Lx.setDefaults({
			begin:   function () { console.log( 'Ajax began...'   ); },
			finish:  function () { console.log( 'Ajax finished!'  ); },
			timeout: function () { console.log( 'Ajax timed out!' ); },
			error:   function () { console.log( 'Ajax error. :('  ); }
		}, options.indicator);
		
		// =========================================
		// = Serialize an object into a URI string =
		// =========================================
		var serialize = function (obj, prefix) {
			var str = [];
			for(var p in obj) {
				var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
				str.push(typeof v == "object" ?
					LxServer.serialize(v, k) :
		      		encodeURIComponent(k) + "=" + encodeURIComponent(v));
			}
			return str.join("&");
		}
		
		// ====================
		// = Send the request =
		// ====================
		var sendRequest = function (method, actions) {
			var query = [];

			// start the ajax indicator
			options.indicator.begin();
			
			// since we allow multiple queries at once.
			if (!(actions instanceof Array)) actions = [actions];
			
			// convert the objects into the proper crap
			for (var i in actions) {
				if (!actions[i].params || Object.keys(actions[i].params).length == 0) {
					query.push(encodeURIComponent(actions[i].method)+'=');
				} else {
					if (actions[i].params instanceof FormData) {
						query = new FormData();
						query.append(actions[i].method, actions[i].params);
					} else {
						query.push(serialize(actions[i].params, actions[i].method)); // string up the query
					}
				}
			}
			
			// =======================================================
			// = Set up the timeout for requests that take too long. =
			// =======================================================
			var tooLong = setTimeout(function() {
				console.log('ajax timeout');
				options.indicator.timeout();
				options.indicator.finish();
				xmlhttp = null;
			}, options.timeout);
			
			// ===================================
			// = Iinitialize the xmlhttp object. =
			// ===================================
			var xmlhttp;
			if (window.XMLHttpRequest) // normal browser get to use this:
				xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
			else // freaks have to use this crap:
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
			
			// when something interesting happens...
			xmlhttp.onreadystatechange = function() {
				// response is 200 - okay!
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

					clearTimeout(tooLong); // it didn't take too long.
					
					// if the json option is set, try to parse, otherwise just return the text
					if (options.json) {
					
						try {
							var response = JSON.parse(xmlhttp.responseText);
						} catch(err) {
							options.indicator.finish();
							console.error(err);
							console.error(xmlhttp.responseText);
						}
					
						for (var i in actions) {
							var action = actions[i];
							var r = response[action.method];
							// if nothing is specified, just log output to console.
							if (action.onResponse == undefined) {
								console.log(r);
							} else {
								action.onResponse(r);
							}
							if (r == null) {
								console.warn('no response from method');
							} else if (r.error !== undefined) {
								console.error(action.method+": "+r.error);
							}
						}
						
					} else {
						
						action.onResponse(xmlhttp.responseText);
						
					}

					options.indicator.finish();

				} else if (xmlhttp.readyState == 4) {
					// response other than 200 :/ not okay.
					clearTimeout(tooLong);
					options.indicator.finish();
					console.error('Ajax Error: '+xmlhttp.status);
					
				}
			}

			if (query instanceof Array)
				query = query.join('&');

			if (method == "POST") {

				xmlhttp.open("POST", options.path, true);
				xmlhttp.setRequestHeader("Content-type", options.contentType);
				xmlhttp.send(query);

			} else {
				// append the data to the url for a get request...
				xmlhttp.open("GET", options.path +'?'+ query, true);
				xmlhttp.setRequestHeader("Content-type", options.contentType);
				xmlhttp.send();

			}
			
		}
		
		this.get  = function(actions) { return sendRequest('GET',  actions); }
		this.post = function(actions) { return sendRequest('POST', actions); }
		
	}	
	
} (window.Lx = window.Lx || {}) );
