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
 * Message Builder
 */
View.FormValidator = {
	validators: [],
	rangeInput: function(msg, target) {
		$(target).each(function() {
			$(this).focusout(function() {
				$(this).val() ?
					$(this).removeClass("invalid") : $(this).addClass("invalid");
			});
		});
			
		var validate = function() {
			var parent;
			$(target).each(function() {
				$(this).val() ?
					$(this).removeClass("invalid") : $(this).addClass("invalid");
				
				parent = parent ? parent : $(this).parent().parent();
			});
			var html = $('<dt class="invalid"><span class="invalid-message">'+msg+'</span></dt><dd></dd>');
		
			$(parent).find('.invalid-message, .invalid').each(function() {
				//$(this).remove();
			});
			
			$(parent).append(html);
		};
		
		this.validators.push(validate);
	},
	
	validate: function() {
		for (i = 0; i < this.validators.length; i++)
			this.validators[i]();
	}
}
 
/**
 * Componente para visualizar e manipular um DRE
 *
 * @author mayconbordin
 * @constructor
 * @param {object|string} target Onde a estrutura da DRE será criada
 * @param {object|string} addButton Onde está o botão para adicionar novos itens
 * @param {function} callback A função que será quando forem feitas modificações na DRE
 */
View.IncomeStatement = function(options) {
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

View.IncomeStatement.prototype = {
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
			Model.Item.list(function(data) {
				// Cria o combobox com o array de itens recuperados
				var html = '<li class="new"><label>Esolha a conta a ser adicionada: </label>'
						 	  + '<select class="combobox"><option value=""></option>';
			
				for (var i=0; i<data.length; i++)
					html += '<option value="' + i + '">[' + data[i].type + '] ' + data[i].name + '</option>';
					
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
					else if (target.parent().hasClass("group") && (s.type == "group" || s.type == "result"))
						novaConta.find('.message').show().html("Não é permitido adicionar grupos de contas aqui");
					else {
						thisObj.addItem(s, target, novaConta);
						//Model.IncomeStatement.addItem(thisObj.opt.id, {})
					}
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
		
		if (!obj || !obj.id || !obj.type || !obj.name)
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
		var id = obj.type + '_' + obj.id;
		
		var html = '<li id="' + id + '" class="' + obj.type + '">'
				 + '<span class="title">' + obj.name + '</span>'
				 + '<div class="container">';
				   
		if (obj.type == 'group') {
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
		//var type = {account: 'conta', group: 'grupo', result: 'resultado'};
		var id = $(obj).attr("id").split("_");
		
		return {
			id: id[1],
			type: id[0],
			name: $(obj).find('.title').html(),
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
		Model.IncomeStatement.get(id, function(dre) {
			if (dre) {
				thisObj.toView($.extend(thisObj.dre, dre));
				thisObj.dre.id = id;
			}
		});
	},
	
	/**
	 * Lida com as mudanças efetuadas no DRE, salvando-o automaticamente (se autoSave for true)
	 * e exibindo mensagem ao usuário, se esta for informada.
	 *
	 * @param {string} msg A mensagem a ser exibida para o usuário
	 */
	changeHandler: function(msg) {
		//if (this.opt.autoSave === true)
			//this.save();
		
		if (msg)
			View.Notification.show("O DRE foi modificado", msg);
	},
	
	save: function() {
		var thisObj = this;
		var dre = this.toEntity();
		Model.IncomeStatement.save(dre, function() {
			if (thisObj.opt.saveDateTarget)
				thisObj.opt.saveDateTarget.html(new Date().format('h:i:s A'));
		});
	}
};