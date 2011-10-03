var Model = {};
Model.Contact = (function() {
	
	return {
		// a id do usuário pega pela session
		list: function(callback) {
			var data = [
				{value: "cadam21@verizon.net", label: "ADAMO, Charles"},
				{value: "kbaker4640@aol.com", label: "BAKER, Kenneth"},
				{value: "mtbecks@centurytel.net", label: "BECK, William"},
				{value: "eburket1@cox.net", label: "BURKETT, Fred"},
				{value: "james9398@att.net", label: "CARTER, James"}
			];
			
			if (callback) callback(data);
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
		buffer = {},
		lastSaved = new Date().getTime(),
		delay = 1000 * 10,
		beforeSave = null,
		afterSave = null;
	
	return {
		get: function(id, callback) {
			$.ajax({
  				url: "http://localhost:3000/projections/show/" + id,
  				dataType: 'json',
  				success: callback
			});
		},
		
		destroy: function(id, callback) {
			$.ajax({
			  type: 'DELETE',
			  url: "http://localhost:3000/projections/destroy/" + id,
			  success: success,
			});
		},
		
		getItemHistory: function(itemId, callback) {
			var data;
			
			if (itemId <= 3)
				data = [
					[ new Date("2009/07/12"), 100 ],
					[ new Date("2009/07/19"), 150 ],
					[ new Date("2009/07/20"), 160 ],
					[ new Date("2009/07/21"), 170 ],
					[ new Date("2009/07/22"), 180 ],
					[ new Date("2009/07/23"), 190 ],
					[ new Date("2009/07/24"), 200 ],
					[ new Date("2009/07/25"), 300 ],
					[ new Date("2009/07/26"), 400 ],
					[ new Date("2009/07/27"), 450 ],
					[ new Date("2009/07/28"), 460 ],
					[ new Date("2009/07/29"), 470 ],
					[ new Date("2009/07/30"), 480 ]
				];
			else
				data = [
					[ new Date("2009/07/15"), 400 ],
					[ new Date("2009/07/16"), 600 ],
					[ new Date("2009/07/17"), 620 ],
					[ new Date("2009/07/18"), 630 ],
					[ new Date("2009/07/19"), 640 ],
					[ new Date("2009/07/20"), 650 ],
					[ new Date("2009/07/21"), 660 ],
					[ new Date("2009/07/25"), 700 ],
					[ new Date("2009/07/26"), 720 ],
					[ new Date("2009/07/27"), 730 ],
					[ new Date("2009/07/28"), 740 ],
					[ new Date("2009/07/29"), 750 ],
					[ new Date("2009/07/30"), 760 ]
				];
			
			if (callback) callback(data);
		},
		
		// vai devolver sucesso ou erro e a hora que foi salvo (se foi)
		setSaveCallbacks: function(b, a) {
			beforeSave = b;
			afterSave = a;
		},
		
		setId: function(isId) {
			id = isId;
		},
		
		save: function(item) {
			if (buffer[item.id])
				$.extend(buffer[item.id], item);
			else
				buffer[item.id] = item;
				
			var now = new Date().getTime();
			
			if (lastSaved && (now - lastSaved) > delay)
				this.sendData();
		},
		
		sendData: function() {
			if (beforeSave)
				beforeSave();
		
			console.log("buffer:");
			console.log(buffer);
			
			// set the income statement id
			buffer.id = id;
			
			/*
			$.ajax({
			  type: 'POST',
			  url: url,
			  data: buffer,
			  success: success,
			  dataType: "json"
			});
			*/
		
			// só em caso de sucesso
			var date = new Date();
			lastSaved = date.getTime();
			
			if (afterSave)
				afterSave({date: date, success: true});
			
			// e limpa o buffer
			buffer = {};
		}
	};
})();
