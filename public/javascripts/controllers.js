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
		$('#projecoes-table').dataTable( {
					"bLengthChange": false,
					//"bFilter": false,
					"sPaginationType": "full_numbers",
					"oLanguage": {
						"sInfo": "Exibindo _START_ até _END_ de _TOTAL_",
						"oPaginate": {
							"sFirst": "Primeira",
							"sLast": "Última",
							"sNext": "Próxima",
							"sPrevious": "Anterior"
						}
					},
					"bProcessing": true,
					"bServerSide": true,
					"sAjaxSource": "http://localhost:3000/projections/list",
					"fnServerData": function( sUrl, aoData, fnCallback ) {
						$.ajax( {
							"url": sUrl,
							"data": aoData,
							"success": fnCallback,
							"dataType": "jsonp",
							"cache": false
						} );
					}
				} );
		
		/*
		$('#projecoes-table').dataTable({
			"bLengthChange": false,
			"bFilter": false,
			"sPaginationType": "full_numbers",
			"oLanguage": {
				"sInfo": "Exibindo _START_ até _END_ de _TOTAL_"
			},
			"aaData": [
				['Trident','Internet Explorer 4.0','Win 95+','4','X'],
				['Trident','Internet Explorer 5.0','Win 95+','5','C'],
				['Trident','Internet Explorer 5.5','Win 95+','5.5','A'],
				['Trident','Internet Explorer 6','Win 98+','6','A']
			],
			"aoColumns": [
				{ "sTitle": "Projeção" },
				{ "sTitle": "Criado em" },
				{ "sTitle": "Versões" },
				{ "sTitle": "Comentários", "sClass": "center" },
				{
					"sTitle": "Grade",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						if ( sReturn == "A" ) {
							sReturn = "<b>A</b>";
						}
						return sReturn;
					}
				}
			]
		});
		*/
	}
	
	function loadDatePicker() {
		$( "#datepicker" ).datepicker({
			dateFormat: 'dd/mm/yy',
			dayNames: [
				'Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'
			],
			dayNamesMin: [
				'D','S','T','Q','Q','S','S','D'
			],
			dayNamesShort: [
				'Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'
			],
			monthNames: [
				'Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro',
				'Outubro','Novembro','Dezembro'
			],
			monthNamesShort: [
				'Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set',
				'Out','Nov','Dez'
			],
			nextText: 'Próximo',
			prevText: 'Anterior'
		});
		
		$( "#datepicker" ).change(function() {
			console.log($(this).val());
			loadChart();
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
	
	return {
		index: function() {
			loadProjectionsTable();
		},
		newStepThree: function() {
			loadDatePicker();
			loadChart();
			
			var dre = new View.DRE({
				target: "#dre .body",
				addButton: "#add-conta-dre",
				callback: loadChart,
				id: 1,
				autoSave: true,
				saveDateTarget: "#projecao-save-date span"
			});
		}
	};
})();