(function () {
	
	// ================================================================
	// = applies any defaults to unset properties of object 'options' =
	// ================================================================
	function setDefaults(defaults, options) {
		defaults = defaults || {}; // defaults to blank object
		for (var i in defaults) {
			if (options[i] == undefined) {
				options[i] = defaults[i];
			}
		}
		return options;
	}
	
	// =====================================================
	// = Convert object to URI serialized key value string =
	// =====================================================
	function uriSerialize(obj, prefix) {
		var str = [];
		for(var p in obj) {
			var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
			str.push(typeof v == "object" ?
				uriSerialize(v, k) :
	      		encodeURIComponent(k) + "=" + encodeURIComponent(v));
		}
		return str.join("&");
	}
	
	// ==================================
	// = The main Inquisition interface =
	// ==================================
	function Inquisition(opts) {
        if (this instanceof Inquisition) {
			if (typeof opts == "string") opts = {url: opts}; // if a string was given instead of an object.
            this.opts = setDefaults(this.defaultOptions, opts);
        } else {
            return new Inquisition(opts);
        }
	}
		
	Inquisition.prototype = {
		
		defaultOptions: {
			url: '/',
			data: {},
			method: 'GET',
			contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
			timeout: 0,
			json: false,
			onResponse: function(r) {
				console.log(r);
			},
			onStart: function() {},
			onEnd: function() {},
			onTimeout: function() {},
			onError: function() {}
		},
		
		async: function(onResponse) {
			var _inquisition = this;
			var xmlhttp;
			
			_inquisition.opts.method = _inquisition.opts.method.toUpperCase(); // get to GET etc.
			
			// either what's in options, or what's sent to the async function.
			onResponse = onResponse || _inquisition.opts.onResponse;
			(window.XMLHttpRequest) ? xmlhttp = new XMLHttpRequest() : xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			
			// ===================================
			// = Set up what happens on response =
			// ===================================
			xmlhttp.onreadystatechange = function() {
					
				// ========
				// = Done =
				// ========
				if (xmlhttp.readyState == 4) {
					
					var response = {
						status: xmlhttp.status,
						text: xmlhttp.responseText,
						object: null // where parsed json ends up
					}
					
					switch (xmlhttp.status) {
						
						case 200: // 200 OK
							if (_inquisition.opts.json) response.object = JSON.parse(xmlhttp.responseText);
							onResponse(response);
							break;
						default:
							onResponse(response);
							break;
							
					}
					
				}
				
			}
			
			var query = uriSerialize(_inquisition.opts.data); // convert the object to uri data
			
			// if the method is GET, the data has to be tacked on to the url.
			if (_inquisition.opts.method == 'GET') {
				_inquisition.opts.url += ('?' + query);
				query = null;
			}
			
			xmlhttp.open(_inquisition.opts.method, _inquisition.opts.url, true);
			xmlhttp.setRequestHeader("Content-type", _inquisition.opts.contentType);
			(query) ? xmlhttp.send(query) : xmlhttp.send();
			
		}
				
	}
	
	// ===================================
	// = Export the inquisition function =
	// ===================================
	window.Inquisition = window.Iq = Inquisition;
	
}());

