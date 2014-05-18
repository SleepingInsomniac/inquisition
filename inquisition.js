function LxServer() {
	var _this = this;
	this.sent = [];
	
	this.serialize = function(obj, prefix) {
	  var str = [];
	  for(var p in obj) {
	    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
	    str.push(typeof v == "object" ?
	      _this.serialize(v, k) :
	      encodeURIComponent(k) + "=" + encodeURIComponent(v));
	  }
	  return str.join("&");
	}
	
	this.send = function(actions) {
		var xmlhttp;
		var query = [];

		if (!(actions instanceof Array)) actions = [actions];

		for (var i in actions) {
			query.push(_this.serialize(actions[i].params, actions[i].name)); // string up the query
		}

		if (window.XMLHttpRequest)
			xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
		else
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5

		var tooLong = setTimeout(function() {
			alert('The request timed out!');
			document.body.removeChild(loading);
			xmlhttp = null;
		}, 15000);

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

				clearTimeout(tooLong);
				document.body.removeChild(loading);
				try {
					var response = JSON.parse(xmlhttp.responseText);
					for (var i in actions) {
						var action = actions[i];
						var r = response[action.name];
						action.responseFunction(r);
						if (r.error) {
							console.error(action.name+": "+r.error);
						}
					}
				} catch(err) {
					console.error(xmlhttp.responseText);
				}

			} else if (xmlhttp.readyState == 4) {

				clearTimeout(tooLong);
				document.body.removeChild(loading);
				alert('Ajax Error: '+xmlhttp.status);
			}
		}

		console.log('sending: '+query.join('&'));

		xmlhttp.open("POST","/action/",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded;charset=UTF-8");
		// xmlhttp.setRequestHeader("Content-type","text/plain;charset=UTF-8");
		xmlhttp.send(query.join('&'));
		this.sent = this.sent.concat(actions);
	};
}

function LxAction(actionName, actionParams, responseFunction) {
	this.name = actionName;
	this.params = actionParams;
	this.responseFunction = responseFunction;
}