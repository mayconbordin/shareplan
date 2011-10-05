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
			$(this).click(function() {
				window.location = $(this).children('a').attr('href');
			});
			
			$(this).children('.close').click(function() {
				//ajax para marcar notificação como lida
				$(this).parent().fadeOut("slow", function() {
					$(this).remove();
				});
			});
		});
	}
	
	function loadHistoryChart(itemId) {
		var data = null;
		if (!itemId)
			itemId = $("#item-history-select").val();
		
		Model.IncomeStatement.getItemHistory(itemId, function(data) {
			chart = new Dygraph(
				document.getElementById("history-chart"),
				data,
		        {
		        	ylabel: 'R$',
		        	labels: "Item",
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

	function messagesClose() {
		$(".messages .close").each(function() {
			$(this).click(function() {
				$(this).parent().fadeOut("slow", function() {
					$(this).remove();
				});
			});
		});
	}
	
	function validatePeriod(target) {
		var valid = true;
		$(target).find(".datepicker").each(function() {
			if ($(this).val()) {
				$(this).removeClass("invalid");
				if (valid) $("#invalid-period").hide();
			} else {
				$(this).addClass("invalid");
				$("#invalid-period span").html("Você precisa informar um período");
				$("#invalid-period").css("display", "inline");
				valid = false;
			}
		});
		
		var start 	= $("#start-date").datepicker("getDate");
		var end 	= $("#end-date").datepicker("getDate");
		
		if (start && end)
			if (start.getTime() > end.getTime()) {
				$("#invalid-period span").html("A data final precisa ser maior que a data inicial");
				$("#invalid-period").css("display", "inline");
				valid = false;
			} else
				if (valid) $("#invalid-period").hide();
	};
	
	function loadValidations() {
		$("#start-date, #end-date").each(function() {
			$(this).change(function() {
				validatePeriod($(this).parent().parent());
			});
			
			$(this).focusout(function() {
				validatePeriod($(this).parent().parent());
			});
		});
	}
	
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
				Model.IncomeStatement.sendData();
				return false;
			});
		},
		newStepThree: function() {
			var contactList = new View.ContactList("#contacts-list");
		
			messagesClose();
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
