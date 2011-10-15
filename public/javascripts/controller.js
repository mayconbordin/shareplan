var Controller = {};
Controller.Dashboard = (function() {
	var widgetWidth,
		chart;
	
	function resizeWidgets() {
		var width = ($(window).width() - 93.1);
  		
  		if (width != widgetWidth) {
			$('.widget').each(function() {
				$(this).width(width);
				
				if($(this).is(".left, .right"))
					$(this).width(width/2);
				else if($(this).is(".full"))
					$(this).width(width + 32);
			});
			
			widgetWidth = width;
		}
	}
	
	function enableNotifications() {
		$('#notifications .body ul li').each(function() {
			var id = $(this).attr("id").replace("message", "");
			$(this).click(function(e) {
				if (!$(e.target).hasClass("close"))
					Model.Message.setAsRead(id);/*, function() {
						window.location = $(this).children('a').attr('href');
					});*/
			});
			
			$(this).children('.close').click(function() {
				var thisObj = $(this);
				Model.Message.setAsRead(id, function() {
					thisObj.parent().fadeOut("slow", function() {
						$(this).remove();
					});
				});
			});
		});
	}
	
	function loadHistoryChart(itemId) {
		var data = null;
		if (!itemId)
			itemId = $("#item-history-select").val();
		
		Model.IncomeStatement.getItemHistory(itemId, function(data) {
			data.sort(function(a, b) {
				if (a[0].getTime() > b[0].getTime())
					return 1;
				if (a[0].getTime() < b[0].getTime())
					return -1;
				return 0;
			});
			
			chart = new Dygraph(
				document.getElementById("history-chart"),
				data,
		        {
		        	ylabel: 'R$',
		        	labels: ["Data", "Item"],
		        	fillGraph: true,
		        	fillAlpha: 0.8,
		        	colors: ["#ffb400"]
		        }
			);
		});
	}
	
	return {
		index: function() {
			resizeWidgets();
			$(window).resize(resizeWidgets);
			
			$("#item-history-select").select_skin(function(value) {
				loadHistoryChart(value);
			});
			
			enableNotifications();
			loadHistoryChart();
		}
	};
})();

Controller.Projection = (function() {
	var chart,
		chartData = {};

	return {
		index: function() {
			View.Table.loadProjections();
		},
		
		newStepOne: function() {
			// load datepickers
			$(".datepicker").datepicker(DatePickerConfig);
			$(".datepicker").mask('99/99/9999');
			
			// load basic validations
			loadValidations();
			
			// submit form and teste validations
			$("#projection-next").click(function() {				
				if (!$("#start-date").val() || !$("#end-date").val())
					validatePeriod($("#start-date").parent().parent());
				else
					$("#projection-form form").submit();
					
				return false;
			});
			
			// register message close buttons
			messagesClose();
		},
		newStepTwo: function(id) {
			var chart = new View.ProjectionChart("chart");

			var is = new View.IncomeStatement({
				target: "#income-statement .body",
				addButton: "#add-projection-item",
				id: id,
				type: "projection",
				saveDateTarget: "#projection-save-date span",
				onItemClick: function(item, remove) {
					chart.load(item, remove);
				},
				beforeSave: function() {
					$("#projection-save-date").html('<img class="loader" src="/images/loader.gif" alt="loading" /> salvando projeção...');
				},
				afterSave: function(r) {
					if (r.success)
						$("#projection-save-date").html("Salvo automaticamente as " + r.date.format('h:i:s A'));
					else
						$("#projection-save-date").html("Erro ao salvar projeção");
				}
			});
			
			$("#projection-save").click(function() {
				Model.IncomeStatement.setType("projection");
				Model.IncomeStatement.sendData(function(status) {
					if (status == "success")
						$("#step-three-form").submit();
						//window.location = '/projections/new_step_three/' + id;
					else
						alert("Não foi possível salvar a projeção");
				});
				return false;
			});
		},
		newStepThree: function() {
			var contactList = new View.ContactList("#contacts-list");
		
			messagesClose();
		},
		edit: function(id) {
			var chart = new View.ProjectionChart("chart");

			var editor;
			var is = new View.IncomeStatement({
				target: "#income-statement .body",
				addButton: "#add-projection-item",
				id: id,
				type: "projection",
				saveDateTarget: "#projection-save-date span",
				onItemClick: function(item, remove) {
					$("#select-chart-tab").click();
					chart.load(item, remove);
				},
				beforeSave: function() {
					$("#projection-save-date").html('<img class="loader" src="/images/loader.gif" alt="loading" /> salvando projeção...');
				},
				afterSave: function(r) {
					if (r.success)
						$("#projection-save-date").html("Salvo automaticamente as " + r.date.format('h:i:s A'));
					else
						$("#projection-save-date").html("Erro ao salvar projeção");
				},
				onLoad: function() {
					editor = new View.IncomeStatementEditor("#information", is.obj);
				}
			});
			
			var comments = new View.Comments("#comments", id);

			loadTabs({comments: function() {
				comments.loadScrollbar();
			}});
			
			$("#projection-save").click(function() {
				Model.IncomeStatement.setType("projection");
				Model.IncomeStatement.sendData(function(status) {
					if (status == "success")
						$("#step-three-form").submit();
						//window.location = '/projections/new_step_three/' + id;
					else
						alert("Não foi possível salvar a projeção");
				});
				return false;
			});
		}
	};
})();

Controller.History = (function() {
	return {
		index: function() {
			View.Table.loadHistory();
			messagesClose();
		},
		newStepOne: function() {
			// load datepickers
			$(".datepicker").datepicker(DatePickerConfig);
			$(".datepicker").mask('99/99/9999');
			
			// load basic validations
			loadValidations();
			
			// submit form and teste validations
			$("#history-next").click(function() {				
				if (!$("#start-date").val() || !$("#end-date").val())
					validatePeriod($("#start-date").parent().parent());
				else
					$("#history-form form").submit();
					
				return false;
			});
			
			// register message close buttons
			messagesClose();
		},
		newStepTwo: function(id) {
			var is = new View.IncomeStatement({
				target: "#income-statement .body",
				addButton: "#add-history-item",
				id: id,
				type: "history",
				saveDateTarget: "#history-save-date span",
				beforeSave: function() {
					$("#history-save-date").html('<img class="loader" src="/images/loader.gif" alt="loading" /> salvando projeção...');
				},
				afterSave: function(r) {
					if (r.success)
						$("#history-save-date").html("Salvo automaticamente as " + r.date.format('h:i:s A'));
					else
						$("#history-save-date").html("Erro ao salvar projeção");
				}
			});
			
			$("#history-save").click(function() {
				Model.IncomeStatement.sendData(function(status) {
					if (status == "success")
						$("#save-form").submit();
						//window.location = '/projections/new_step_three/' + id;
					else
						alert("Não foi possível salvar a projeção");
				});
				return false;
			});
		},
		edit: function(id) {
			$(".datepicker").datepicker(DatePickerConfig);
			$(".datepicker").mask('99/99/9999');
			loadTabs();
			
			var editor;
			var is = new View.IncomeStatement({
				target: "#income-statement .body",
				addButton: "#add-history-item",
				id: id,
				type: "history",
				saveDateTarget: "#history-save-date span",
				beforeSave: function() {
					$("#history-save-date").html('<img class="loader" src="/images/loader.gif" alt="loading" /> salvando projeção...');
				},
				afterSave: function(r) {
					if (r.success)
						$("#history-save-date").html("Salvo automaticamente as " + r.date.format('h:i:s A'));
					else
						$("#history-save-date").html("Erro ao salvar DRE");
				},
				onLoad: function() {
					editor = new View.IncomeStatementEditor("#information", is.obj);
				}
			});
			
			$("#history-save").click(function() {
				Model.IncomeStatement.sendData(function(status) {
					if (status == "success")
						$("#save-form").submit();
					else
						alert("Não foi possível salvar o DRE");
				});
				return false;
			});
		}
	};
})();

Controller.User = (function() {
	return {
		logout: function() {
			$("#sign-out").click(function() {
				$.ajax({
					type: "DELETE",
				   	url: $(this).attr('href'),
				   	success: function() {
				   		window.location = "/users/sign_in";
				   	}
				});
				
				return false;
			});
		}
	};
})();
