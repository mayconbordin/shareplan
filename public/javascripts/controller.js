var Controller = {};

/**
 * Dashboard Controller
 */
Controller.Dashboard = (function() {
	var widgetWidth,
		chart;
	
	function resizeWidgets() {
		var width = ($(window).width() - 330)/2;
  		
  		if (width != widgetWidth) {
			$('.left, .right').each(function() {
				$(this).width(width);
			});
			
			widgetWidth = width;
		}
	}
	
	function enableNotifications() {
		$('#notificacoes li').each(function() {
			$(this).click(function() {
				window.location = $(this).children('a').attr('href');
			});
			
			$(this).children('.close').click(function() {
				//ajax para marcar notificação como lida
				$(this).parent().fadeOut("slow", function() {
					$(this).remove();
				});
			});
			
			$(this).children('.close').tipsy();
		});
	}
	
	function loadHistoryChart(contaId) {
		var data = null;
		if (!contaId)
			contaId = $("#historico-conta-select").val();
		
		data = Model.Projection.getAllValuesByAccount(contaId);
		
		if (data) {
			Highcharts.setOptions({lang:{resetZoom:""}});
		
			chart = new Highcharts.Chart({
				chart: { renderTo: 'historico-chart', zoomType: 'x', spacingRight: 0 },
				title: { text: null },
				xAxis: { type: 'datetime', maxZoom: 1 * 24 * 3600000, title: { text: null } },
				yAxis: { title: { text: 'R$' }, /*min: 0.6,*/ startOnTick: false, showFirstLabel: false },
				tooltip: { shared: true	},
				legend: { enabled: false },
				plotOptions: {
					area: {
						fillColor: {
							linearGradient: [0, 0, 0, 300],
							stops: [[0, Highcharts.getOptions().colors[0]],[1, 'rgba(2,0,0,0)']]
						},
						lineWidth: 1,
						marker: { enabled: false, states: { hover: { enabled: true, radius: 5 } } },
						shadow: false,
						states: { hover: { lineWidth: 1 } }
					}
				},
				series: [{
					type: 'area',
					name: 'USD to EUR',
					pointInterval: 1 * 3600 * 1000,
					pointStart: Date.UTC(2006, 0, 01),
					data: data
				}]
			}, function(chart) {
				var extremes = chart.xAxis[0].getExtremes();
				$('#reset-zoom').click(function() {
		    		chart.xAxis[0].setExtremes(extremes.min, extremes.max);
				});
			});
		}
	}
	
	function enableLatestProjections() {
		$('#ultimas-projecoes tbody tr').each(function() {
			$(this).click(function() {
				console.log("go to projection " + $(this).attr('id').replace("projecao", ""));
			});
		});
	}
	
	return {
		index: function() {
			resizeWidgets();
			enableNotifications();
			enableLatestProjections();
			loadHistoryChart();
			
			$(window).resize(resizeWidgets);
			
			$("#historico-conta-select").select_skin(function(value) {
				loadHistoryChart(value);
			});
		}
	};
})();

Controller.Sidebar = (function() {
	
	function notifiCounter() {
		$('#notification-counter').tipsy();
	}
	
	return {
		initialize: function() {
			notifiCounter();
		}
	};
})();

Controller.Projection = (function() {
	var chart;

	function loadProjectionsTable() {
		$('#projecoes-table').dataTable({
			"bLengthChange": false,
			"bFilter": false,
			"sPaginationType": "full_numbers",
			"oLanguage": {
				"sInfo": "Exibindo _START_ até _END_ de _TOTAL_",
				"oPaginate": {
					"sFirst": "« Primeira",
					"sLast": "Última »",
					"sNext": "Próxima  &gt;",
					"sPrevious": "&lt; Anterior"
				},
				"sProcessing": "Processando..."
			},
			"aoColumns": [
				{ "sTitle": "Projeção" },
				{
					"sTitle": "Data de Início",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y');
					}
				},
				{
					"sTitle": "Data de Fim",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y');
					}
				},
				{ "sTitle": "Comentários", "sClass": "center", "bSortable": false },
				{
					"sTitle": "Criado em",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y h:i:s A');
					}
				},
				{
					"sTitle": "Ações",
					"sClass": "center",
					"bSortable": false,
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return sReturn;
					}
				}
			],
			
			/* Data Source Configuration */
			"bProcessing": true,
			"bServerSide": true,
			"sAjaxSource": "/projections/list",
			"fnServerData": function( sUrl, aoData, fnCallback ) {
				$.ajax( {
					"url": sUrl,
					"data": aoData,
					"success": fnCallback,
					"dataType": "jsonp",
					"cache": false
				} );
			}
		});
	}
	
	function loadChart() {
		chart = new Highcharts.Chart({
		  chart: {
			 renderTo: 'chart',
			 defaultSeriesType: 'line'
		  },
		  title: {
			 text: 'Monthly Average Temperature'
		  },
		  xAxis: {
			 categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		  },
		  yAxis: {
			 title: {
			    text: 'R$'
			 }
		  },
		  /*
		  tooltip: {
			 enabled: false,
			 formatter: function() {
			    return '<b>'+ this.series.name +'</b><br/>'+
			       this.x +': '+ this.y +'Â°C';
			 }
		  },*/
		  plotOptions: {
			 line: {
			    dataLabels: {
			       enabled: true
			    },
			    enableMouseTracking: false
			 }
		  },
		  series: [{
			 name: 'Tokyo',
			 data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
		  }, {
			 name: 'London',
			 data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
		  }]
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
			loadProjectionsTable();
		},
		newStepOne: function() {
			// load datepickers
			$(".datepicker").datepicker(DatePickerConfig);
			
			// load basic validations
			loadValidations();
			
			// submit form and teste validations
			$("#projecao-next").click(function() {				
				if (!$("#start-date").val() || !$("#end-date").val())
					validatePeriod($("#start-date").parent().parent());
				else
					$("#projecao-form form").submit();
					
				return false;
			});
			
			// register message close buttons
			$(".close").each(function() {
				$(this).click(function() {
					$(this).parent().fadeOut("slow", function() {
						$(this).remove();
					});
				});
			});
		},
		newStepTwo: function(id) {
			$("#datepicker").datepicker(DatePickerConfig);
		
			$("#datepicker").change(function() {
				console.log($(this).val());
				loadChart();
			});
			
			loadChart();
			
			var is = new View.IncomeStatement({
				target: "#dre .body",
				addButton: "#add-conta-dre",
				callback: loadChart,
				id: id,
				autoSave: true,
				saveDateTarget: "#projecao-save-date span"
			});
		}
	};
})();
