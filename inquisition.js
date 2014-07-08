function LxServer(actionPath, indicator, onTimeout, onError) {
	if (!actionPath) actionPath = 'action/';
	if (!indicator) indicator = new LxIndicator(function() {}, function() {});
	if (!onTimeout) onTimeout = function() { console.warn('Ajax timed out!'); };
	if (!onError) onError = function(error) { console.error(error); };
	
	var _this = this;
	this.actionPath = actionPath;
	this.sent = [];
	this.indicator = indicator;
	this.onTimeout = onTimeout;
	this.onError = onError;
	this.timeout = 5000;
		
	this.send = function(actions) {
		var xmlhttp;
		var query = [];
		
		_this.indicator.start();
		
		if (!(actions instanceof Array)) actions = [actions];

		for (var i in actions) {
			if (!actions[i].params || Object.keys(actions[i].params).length == 0) {
				query.push(encodeURIComponent(actions[i].method)+'=');
			} else {
				query.push(LxServer.serialize(actions[i].params, actions[i].method)); // string up the query
			}
		}

		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
		
		var tooLong = setTimeout(function() {
			console.log('ajax timeout');
			_this.onTimeout();
			_this.indicator.stop();
			xmlhttp = null;
		}, _this.timeout);
		
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				
				clearTimeout(tooLong);
				try {
					var response = JSON.parse(xmlhttp.responseText);
				} catch(err) {
					_this.indicator.stop();
					console.error(err);
					console.error(xmlhttp.responseText);
				}
				for (var i in actions) {
					var action = actions[i];
					var r = response[action.method];
					action.onResponse(r);
					if (r == null) {
						console.warn('no response from method');
					} else if (r.error !== undefined) {
						console.error(action.method+": "+r.error);
					}
				}
				
				_this.indicator.stop();

			} else if (xmlhttp.readyState == 4) {

				clearTimeout(tooLong);
				_this.indicator.stop();
				console.error('Ajax Error: '+xmlhttp.status);
			}
		}

		xmlhttp.open("POST","action/",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded;charset=UTF-8");
		xmlhttp.send(query.join('&'));
		this.sent = this.sent.concat(actions);
	};
	
	return this;
}

LxServer.serialize = function(obj, prefix) {
	var str = [];
	for(var p in obj) {
		var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
		str.push(typeof v == "object" ?
			LxServer.serialize(v, k) :
      		encodeURIComponent(k) + "=" + encodeURIComponent(v));
	}
	return str.join("&");
}


function LxAction(actionMethod, actionParams, onResponse) {
	
	this.method     = actionMethod;
	this.params     = actionParams;
	this.onResponse = onResponse;
	
	return this;
}

function LxIndicator(start, stop) {
	
	this.start = start;
	this.stop  = stop;
	
	return this;
}