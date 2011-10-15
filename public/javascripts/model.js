var Model = {};
Model.Contact = (function() {
	
	return {
		// a id do usuário pega pela session
		list: function(callback) {
			$.ajax({
  				url: "http://localhost:3000/contacts/list",
  				dataType: 'json',
  				success: callback
			});
		}
	};
})();

Model.Message = (function() {
	
	return {
		setAsRead: function(id, callback) {
			$.ajax({
  				url: "http://localhost:3000/messages/set_as_read/"+id,
  				dataType: 'json',
  				success: callback
			});
		}
	};
})();

Model.Comment = (function() {
	
	return {
		list: function(id, callback) {
			$.ajax({
  				url: "http://localhost:3000/comments/list/"+id,
  				dataType: 'json',
  				success: callback
			});
		},
		
		listUpdated: function(obj, callback) {
			$.ajax({
  				url: "http://localhost:3000/comments/list_updated/",
  				dataType: 'json',
  				data: obj,
  				success: callback
			});
		},
		
		save: function(obj, callback) {
			$.ajax({
			  type: 'POST',
			  url: "http://localhost:3000/comments/save",
			  data: obj,
			  success: callback,
			  error: callback,
			  dataType: "json"
			});
		},
		
		destroy: function(id, callback) {
			$.ajax({
			  type: 'DELETE',
			  url: "http://localhost:3000/comments/destroy/" + id,
			  success: callback,
			});
		}
	};
})();

Model.Item = (function() {
	
	return {
		list: function(callback) {
			$.ajax({
  				url: "http://localhost:3000/items/list",
  				dataType: 'json',
  				success: callback
			});
		},
		
		save: function(data, callback) {
			$.ajax({
			  type: 'POST',
			  url: "http://localhost:3000/items/create",
			  data: data,
			  success: callback,
			  error: callback,
			  dataType: "json"
			});
		}
	};
})();

Model.IncomeStatement = (function() {
	var id = null,
		type = null,
		beforeSave = null,
		afterSave = null;
		
	var buffer = {items:{}};
	var sending = false;
	
	return {
		get: function(id, callback) {
			$.ajax({
  				url: "http://localhost:3000/income_statements/show/" + id,
  				dataType: 'json',
  				success: callback
			});
		},
		
		destroy: function(id, callback) {
			$.ajax({
			  type: 'DELETE',
			  url: "http://localhost:3000/income_statements/destroy/" + id,
			  success: success,
			});
		},
		
		getItemHistory: function(id, callback) {
			$.ajax({
  				url: "http://localhost:3000/income_statements/list_item_history/" + id,
  				dataType: 'json',
  				success: function(data) {
  					for (i in data)
  						data[i][0] = new Date(data[i][0]);
  						
  					callback(data);
  				}
			});
		},
		
		saveInfo: function(obj, callback) {
			$.ajax({
				type: 'POST',
			 	url: "http://localhost:3000/income_statements/save_info",
			  	data: obj,
			  	dataType: "json",
			  	success: function() {
					if (callback) callback("success");
				},
				error: function() {
					if (callback) callback("error");
				}
			});
		},
		
		setSaveCallbacks: function(b, a) {
			beforeSave = b;
			afterSave = a;
		},
		
		setId: function(isId) {
			id = isId;
			buffer.id = id;
		},
		
		setType: function(isType) {
			type = isType;
			buffer.type = isType;
		},
		
		save: function(item) {
			var data = {items:{}};
			data.items[item.id] = item;
			data.id = id;
			
			// a little experiment
			if (buffer.items[item.id])
				$.extend(buffer.items[item.id], item);
			else
				buffer.items[item.id] = item;
			
			if (!sending) {
				Model.IncomeStatement.sendData();
				sending = true;
			}
		},
		
		sendData: function(callback) {
			if (beforeSave)
				beforeSave();
				
			console.log("saving...");
			
			$.ajax({
				type: 'POST',
			 	url: "http://localhost:3000/income_statements/save",
			  	data: buffer,
			  	dataType: "json",
			  	success: function() {
					if (afterSave)
						afterSave({date: new Date(), success: true});
						
					if (callback)
						callback("success");
				},
				error: function() {
					if (callback)
						callback("error");
				}
			});
			
			setTimeout(function() {
				Model.IncomeStatement.sendData();
			}, 15000);
		},
		
		printBuffer: function() {
			console.log(buffer);
		}
	};
})();
