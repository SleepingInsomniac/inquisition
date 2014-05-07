function LxServer() {
	this.sent = [];
	this.timeOutLength = 10000;

	this.send = function(actions) {
		var xmlhttp;
		var query = [];
		
		if (!(actions instanceof Array)) actions = [actions]; // put the request in an array if it's singular
		
		// form the query in an array, later to be joined by '&'
		for (var i in actions) {
			var action = actions[i];
			query.push(i+'[name]='+action.name);
			Object.keys(action.params).forEach(function (key) {
				query.push(i+"["+key+"]="+action.params[key]);
			});
		}

		if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
		else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
		
		// if the server takes too long
		var timeOut = setTimeout(function() {
			throw 'The request timed out!';
			xmlhttp = null;
		}, this.timeOutLength);

		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

				clearTimeout(timeOut);
				
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

		xmlhttp.open("POST","action/",true);
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded;charset=UTF-8");
		// xmlhttp.setRequestHeader("Content-type","text/plain;charset=UTF-8");
		xmlhttp.send(query.join('&'));
		this.sent = this.sent.concat(actions);
		return this.sent;
	};
}

function LxAction(actionName, actionParams, responseFunction) {
	this.name = actionName;
	this.params = actionParams;
	this.responseFunction = responseFunction;
}