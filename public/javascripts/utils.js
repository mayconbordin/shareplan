/**
 * JavaScript Date.Format
 *
 * @author Jacob Wright
 * @link http://jacwright.com/projects/javascript/date_format/
 * @license MIT
 * @version 9/25/2010
 */
Date.prototype.format = function(format) {
    var returnStr = '';
    var replace = Date.replaceChars;
    for (var i = 0; i < format.length; i++) {       var curChar = format.charAt(i);         if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
            returnStr += curChar;
        }
        else if (replace[curChar]) {
            returnStr += replace[curChar].call(this);
        } else if (curChar != "\\"){
            returnStr += curChar;
        }
    }
    return returnStr;
};

Date.replaceChars = {
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    // Day
    d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
    D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
    j: function() { return this.getDate(); },
    l: function() { return Date.replaceChars.longDays[this.getDay()]; },
    N: function() { return this.getDay() + 1; },
    S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
    w: function() { return this.getDay(); },
    z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
    // Week
    W: function() { var d = new Date(this.getFullYear(), 0, 1); return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); }, // Fixed now
    // Month
    F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
    m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
    M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
    n: function() { return this.getMonth() + 1; },
    t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate() }, // Fixed now, gets #days of date
    // Year
    L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },   // Fixed now
    o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
    Y: function() { return this.getFullYear(); },
    y: function() { return ('' + this.getFullYear()).substr(2); },
    // Time
    a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
    A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
    B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
    g: function() { return this.getHours() % 12 || 12; },
    G: function() { return this.getHours(); },
    h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
    H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
    i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
    s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
    u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?
'0' : '')) + m; },
    // Timezone
    e: function() { return "Not Yet Supported"; },
    I: function() { return "Not Yet Supported"; },
    O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
    P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
    T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
    Z: function() { return -this.getTimezoneOffset() * 60; },
    // Full Date/Time
    c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
    r: function() { return this.toString(); },
    U: function() { return this.getTime() / 1000; }
};


//==============================================================================
 
var DependencyManager = {
	plugins: {
		facebox: {script: 'js/facebox.js', style: 'css/facebox.css'},
		tipsy: {script: 'js/jquery.tipsy.js', style: 'css/jquery.tipsy.css'},
		selectSkin: {script: 'js/jquery.select_skin.js', style: 'css/jquery.select_skin.css'},
		dataTables: {script: 'js/jquery.dataTables.min.js', style: 'css/jquery.dataTables.css'},
		gritter: {script: 'js/jquery.gritter.min.js', style: 'css/jquery.gritter.css'}
	},
	addPlugin: function(name) {
		var plugin = this.plugins[name];
		this.addScript(plugin.script);
		this.addStyle(plugin.style);
	},
	
	addScript: function(url) {
		var head = document.getElementsByTagName("head")[0];
		
		var newScript 	= document.createElement('script');
		newScript.type 	= 'text/javascript';
		newScript.src 	= url;
		
		head.appendChild(newScript);
	},
	addStyle: function(url) {
		var head = document.getElementsByTagName("head")[0];
		   
		var cssNode 	= document.createElement('link');
		cssNode.type 	= 'text/css';
		cssNode.rel 	= 'stylesheet';
		cssNode.href 	= url;
		cssNode.media 	= 'screen';
		
		head.appendChild(cssNode);
	},
	
	/*
	 * source: http://www.ejeliot.com/blog/109
	 */
	onFunctionAvailable: function(sMethod, oCallback, oObject, bScope) {
		if (typeof(eval(sMethod)) === 'function') {
			bScope ? oCallback.call(oObject) : oCallback(oObject);
		} else {
			setTimeout(function () {
				onFunctionAvailable(sMethod, oCallback, oObject, bScope);
			}), 50
		}
	}
	
	/*
	onFunctionAvailable: function(sMethod) {
		var a = sMethod.split('(');
		
		if( a.length < 1 )
			return;
			
		var funcName = a[0];

		if( typeof(eval(funcName)) === 'function' ) {
			eval(sMethod);
		} else {
			setTimeout( function () { onFunctionAvailable(sMethod ); }, 1000 );
		}
	}
	*/
};
 
 
////////////////////////////////////////////////////////////////////////////////
// VIEW
////////////////////////////////////////////////////////////////////////////////
var View = {};
 
/**
 * Notification System
 */
View.Notification = {
	show: function(title, text) {
		$.gritter.add({
			title: title,
			text: text,
			sticky: false,
			time: ''
		});
	}
};
 
/**
 * Componente para visualizar e manipular um DRE
 *
 * @author mayconbordin
 * @constructor
 * @param {object|string} target Onde a estrutura da DRE será criada
 * @param {object|string} addButton Onde está o botão para adicionar novos itens
 * @param {function} callback A função que será quando forem feitas modificações na DRE
 */
View.DRE = function(options) {
	this.opt = {
		target: null,
		addButton: null,
		callback: null,
		autoSave: false,
		id: null,
		saveDateTarget: null
	};
	
	// Merge das opções
	$.extend(this.opt, options);
	
	if (!this.opt.target)
		return;
	
	this.sorting 	= false;
	this.dre		= {};
	this.target 	= $(this.opt.target);
	
	if (this.opt.addButton)
		this.addButton = $(this.opt.addButton);
	if (this.opt.callback)
		this.callback = this.opt.callback;
	if (this.opt.saveDateTarget)
		this.opt.saveDateTarget = $(this.opt.saveDateTarget);

	this.init();
	
	if (this.opt.id)
		this.loadFromModel(this.opt.id);
};

View.DRE.prototype = {
	/**
	 * Inicializa a DRE
	 */
	init: function() {
		var thisObj = this;
		this.target.sortable({
			items: "li",
			placeholder: "ui-state-highlight",
			scrollSpeed: 10,
			opacity: 0.8,
			delay: 200,
			revert: 400,
			update: function(){thisObj.sortUpdate()},
			start: function(e){thisObj.sortStart(e)},
			stop: function(e){thisObj.sortStop(e)}
		});
		
		this.sortUpdate();
		this.registerAddButton(this.addButton);
	},

	/**
	 * Função acionada quando um item começa a ser movido
	 *
	 * @param {object} event
	 */
	sortStart: function(event) {
		this.sorting = true,
			thisObj  = this;
		
		// Change the 'to be sorted' element border and cursor
		$(event.toElement).css({'cursor':'move', 'border':'1px solid #ff8400'});
		
		// Show the unmovable pieces
		this.target.find(".unmovable").each(function() {
			$(this).show();
			thisObj.target.sortable("refresh");
		});
	},
	
	/**
	 * Função acionada quando um item deixa de ser movido
	 *
	 * @param {object} event
	 */
	sortStop: function(event) {
		this.sorting = false;
		var el = $(event.toElement);
		el.css({'cursor':'', 'border':''});
		
		this.target.find(".unmovable").each(function() {
			$(this).hide();
		});
		
		// Verifica se a operação não é permitida
		if (
			((el.is(".group, .result")) && el.parent().parent().is(".group"))
			||
			(el.is(".title") && el.parent().is(".group") && el.parent().parent().parent().is(".group"))
		) {
			this.target.sortable('cancel');
			this.sortUpdate();
		}
	},
	
	/**
	 * Função acionada toda vez que ocorre uma mudança na estrutura da DRE
	 */
	sortUpdate: function() {
		var counter = 1,
			thisObj = this;
		
		this.target.find("li").each(function() {
			// Bind onclick to select/deselect list items
			$(this).unbind('click');
			$(this).click(function(e) {
				if (e.target.id == $(this).attr('id') && thisObj.sorting === false) {
					var msg = [];
					
					if ($(this).hasClass('selected')) {
						$(this).removeClass('selected');
						msg[0] = msg[1] = "Item removido do gráfico";
					} else {
						$(this).addClass('selected');
						msg[0] = msg[1] = "Item adicionado ao gráfico";
					}
					
					// Callback = ainda é preciso padronizar o objeto, criar métodos para extrair dados do DOM do DRE
					// e fazer as chamadas ajax através do model para obter os valores.
					//thisObj.callback();
					
					View.Notification.show(msg[0], msg[1]);
				}
			});
			
			// Add odd and even to root list items
			if ($(this).parent().hasClass('body')) {
				$(this).removeClass('even odd');
				(counter%2 == 0) ? $(this).addClass('even') : $(this).addClass('odd');
				
				counter++;
			}
		});
		
		// Bind the delete function of each list item
		this.target.find(".delete").each(function() {
			$(this).unbind('click');
			$(this).click(function(e) {
				$(this).parent().parent().css({'background':'#f93a07', 'color':'#fff'}).fadeOut("slow", function() {
					$(this).remove();
					thisObj.sortUpdate();
				});				
				return false;
			});
		});
		
		// Bind the add function of each list item
		this.target.find(".add").each(function() {
			$(this).unbind('click');
			thisObj.registerAddButton($(this), $(this).parent().parent().find('ul'));
		});
		
		// sortUpdate é chamado sempre que ocorre alguma mudança no DRE
		// o changeHandler se encarrega de salvar o DRE
		this.changeHandler();
	},
	
	/**
	 * Carrega o botão responsável por adicionar novos items na DRE
	 *
	 * @param {object} button O botão para adicionar novo item
	 * @param {object} target O elemento que receberá o novo item
	 */
	registerAddButton: function(button, target) {
		var thisObj = this;
		
		if (!target)
			target = this.target;
		
		button.click(function() {
			Model.Account.getFullList(function(data) {
				// Cria o combobox com o array de itens recuperados
				var html = '<li class="new"><label>Esolha a conta a ser adicionada: </label>'
						 	  + '<select class="combobox"><option value=""></option>';
			
				for (var i=0; i<data.length; i++)
					html += '<option value="' + i + '">[' + data[i].tipo + '] ' + data[i].nome + '</option>';
					
				html += '</select><a class="blue-button submit" href="#" title="">OK</a>'
					  + '<a class="blue-button cancel" href="#" title="">Cancelar</a>'
					  + '<label class="labelNewAccount">ou crie uma</label>'
					  + '<a class="green-button newAccount" href="#" title="">nova conta</a>'
					  + '<p class="message"></p></li>';
		
				// Adiciona o seletor de contas ao target com todos os efeitos...
				var novaConta = $(html);
				novaConta.hide()
						 .appendTo(target)
						 .fadeIn("slow", function() {
						 	thisObj.sortUpdate();
						 });
				
				// Aplica o componente combobox
				novaConta.find('.combobox').combobox();
				
				// Registra o evento para submeter criação da nova conta
				novaConta.find('.submit').click(function() {
					var s = data[ novaConta.find('.combobox').val() ];
					
					if (!s)
						novaConta.find('.message').show().html("Escolha uma conta para adicionar");
					else if (target.parent().hasClass("group") && (s.tipo == "grupo" || s.tipo == "resultado"))
						novaConta.find('.message').show().html("Não é permitido adicionar grupos de contas aqui");
					else
						thisObj.addItem(s, target, novaConta);
					return false;
				});
				
				// Registra o evento para cancelar a criação de conta
				novaConta.find('.cancel').click(function() {
					novaConta.fadeOut("slow", function() {
						$(this).remove();
					});
					return false;
				});
			});
			return false;
		});
	},
	
	/**
	 * Adiciona um item (conta, resultado ou grupo) na DRE
	 *
	 * @param {object} obj O item que será adicionado
	 * @param {object} target O elemento onde o item será adicionado
	 * @param {objetc} toRemove O elemento que será removido ao criar o novo item
	 */
	addItem: function(obj, target, toRemove) {
		var thisObj = this;
		var type = {conta: 'account', grupo: 'group', resultado: 'result'};
		
		if (!obj || !obj.id || !obj.tipo || !obj.nome)
			return false;
		
		var html = this.createItem(obj);
		
		html.hide()
			.appendTo(target)
			.addClass('selected');
			
		toRemove.fadeOut("slow", function() {
			$(this).remove();
			
			html.fadeIn("slow", function() {
				html.removeClass('selected');
				thisObj.sortUpdate();
				thisObj.target.sortable("refresh");
			});
		
		});
	},
	
	/**
	 * Cria a estrutura html para um item
	 *
	 * @param {object} obj O item a partir do qual será criado o html
	 * @param {boolean} asJq True para retornar objeto jQuery ou false para retornar string
	 * @return {object|string} O item como objeto jQuery ou em string html
	 */
	createItem: function(obj, asJq) {
		asJq = (asJq == undefined) ? true : asJq;
		var type = {conta: 'account', grupo: 'group', resultado: 'result'};
		var id = obj.tipo + '_' + obj.id;
		
		var html = '<li id="' + id + '" class="' + type[obj.tipo] + '">'
				 + '<span class="title">' + obj.nome + '</span>'
				 + '<div class="container">';
				   
		if (type[obj.tipo] == 'group') {
			html += '<a class="add" href="#" title="Adicionar Conta ao Grupo"><span>Adicionar</span></a>'
				 +  '<a class="delete deleteGroup" href="#" title="Remover Conta"><span>Deletar</span></a>'
				 +  '</div><ul>';
				 
			if (obj.items)
				for (i in obj.items)
					html += this.createItem(obj.items[i], false);
				 
			html += '<li class="unmovable"></li></ul></li>';
		} else
			html += '<input class="value" type="text" /><input class="formula" type="hidden" />'
				 +  '<a class="delete" href="#" title="Remover Conta"><span>Deletar</span></a></div></li>';
		
		return asJq ? $(html) : html;
	},
	
	/**
	 * Extrai as informações de um objeto DOM e cria um item
	 *
	 * @param {object} obj O objeto DOM de onde serão extraídas as informações
	 * @return {object} O item com as informações extraídas
	 */
	itemToObject: function(obj) {
		var type = {account: 'conta', group: 'grupo', result: 'resultado'};
		var id = $(obj).attr("id").split("_");
		
		return {
			id: id[1],
			tipo: type[id[0]],
			nome: $(obj).find('.title').html(),
			items: []
		};
	},
	
	/**
	 * Extrai as informações da DRE da estrutura DOM e passa elas para um objeto
	 *
	 * @return {object} O objeto com as informações da DRE
	 */
	toEntity: function() {
		var thisObj = this;
		var dre = {items: []};
			
		this.target.find('li').each(function() {
			if ($(this).parent().hasClass("body") && !$(this).is(".new")) {
				var item = thisObj.itemToObject(this);
				
				if ($(this).is(".result, .group")) {
					$(this).find("li").each(function() {
						if ($(this).attr("id"))
							item.items.push( thisObj.itemToObject(this) );
					});
				}
				dre.items.push(item);
			}
		});
		
		$.extend(this.dre, dre);
		return this.dre;
	},
	
	/**
	 * Recebe um objeto com as informações da DRE e cria a view através delas
	 *
	 * @param {object} dre O objeto com as informações da DRE
	 */
	toView: function(dre) {
		this.target.html("");
		
		for (i in dre.items)
			this.target.append( this.createItem(dre.items[i]) );
		
		this.sortUpdate();
		this.target.sortable("refresh");
	},
	
	/**
	 * Carrega uma DRE através de um id
	 *
	 * @param {number} id A id da DRE a ser carregada
	 */
	loadFromModel: function(id) {
		var thisObj = this;
		Model.DRE.get(id, function(dre) {
			if (dre)
				thisObj.toView($.extend(thisObj.dre, dre));
		});
	},
	
	/**
	 * Lida com as mudanças efetuadas no DRE, salvando-o automaticamente (se autoSave for true)
	 * e exibindo mensagem ao usuário, se esta for informada.
	 *
	 * @param {string} msg A mensagem a ser exibida para o usuário
	 */
	changeHandler: function(msg) {
		if (this.opt.autoSave === true)
			this.save();
		
		if (msg)
			View.Notification.show("O DRE foi modificado", msg);
	},
	
	save: function() {
		var thisObj = this;
		var dre = this.toEntity();
		Model.DRE.save(dre, function() {
			if (thisObj.opt.saveDateTarget)
				thisObj.opt.saveDateTarget.html(new Date().format('h:i:s A'));
		});
	}
};
