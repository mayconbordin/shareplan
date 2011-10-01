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
 * View Formula Object - Deal with the income statement calculations of each item.
 *
 * @constructor
 * @param {View.Item} item The item to get his value controlled
 */
View.Formula = function(item) {
	this.item		= item;
	this.input 		= null;
	this.button		= null;
	this.value 		= null;
	this.formula	= null;
	this.newFormula = false;
	
	this.initialize();
};

View.Formula.prototype = {
	/**
	 * @property {RegExp} The regular expression to extract parameters from a formula
	 */
	pattern: /(\$[a-z\_]*[0-9]*)/g,
	
	/**
	 * Initialize the formula, getting the value, formula string, button and 
	 * registering the listeners of change.
	 */
	initialize: function() {
		this.input 		= (this.item.type == "group") ? null : $(this.item.element).find('.value');
		this.button		= $(this.item.element).find('.function');
		this.value 		= (isNaN(this.item.value) || !this.item.value) ? 0 : this.item.value;
		this.formula 	= this.item.funct;
		
		if (this.input) {
			this.input.val(this.value);
			
			if (this.formula) {
				this.input.addClass("active")
						  .attr("disabled", true);
			}
		
			this.registerEvents();
		}
	},
	
	/**
	 * Register the event listeners so the formula can be applied to the items
	 */
	registerEvents: function() {
		var thisObj = this;
		
		this.input.keyup(function() {
			if (parseFloat($(this).val()) != thisObj.value)
				thisObj.onChangeValue($(this).val());
		});
		
		this.button.click(function(e) {
			View.Formula.Editor.open(thisObj.item);
			return false;
		});
	},
	
	/**
	 * Handle value changes, parsing the string and calling every item to check
	 * if its value has changed too
	 *
	 * @param {string} newValue
	 */
	onChangeValue: function(newValue) {
		this.value = parseFloat(newValue);
		if (isNaN(this.value))
			this.value = 0;
			
		// precisa atualizar valor via ajax
		Model.IncomeStatement.save({id: this.item.id, value: this.value, type: "update"});
			
		View.Formula.reloadAll(this.item.incomeStatement.items);
	},
	
	/**
	 * Reload this item formula only. If it has a formula, reload it. If it is
	 * a group, resum all children values. Otherwise does nothing.
	 */
	reload: function() {
		var value = this.value;
		
		if (this.formula) {
			this.processFormula();
			this.input.addClass("active")
					  .attr("disabled", true);
		} else if (this.input) {
			this.input.removeClass("active")
					  .removeAttr("disabled");
		}
			
		if (this.item.type == "group")
			this.sumAllItems();
			
		if (this.input)
			this.input.val(parseFloat(this.value));
			
		// Verifica se valor foi modificado na atualização
		if (value != this.value) {
			Model.IncomeStatement.save({id: this.item.id, value: this.value, type: "update"});
		}
		
		if (this.newFormula) {
			// precisa atualizar valor e/ou formula via ajax
			Model.IncomeStatement.save({id: this.item.id, value: this.value, funct: this.formula, type: "update"});
			
			this.newFormula = false;
		}
	},
	
	/**
	 * Getter for the attribute value, the value holded by the item
	 *
	 * @return {float}
	 */
	getValue: function() {
		return this.value;
	},
	
	/**
	 * Setter for the formula attribute, should be used instead of direct inserting values
	 *
	 * @param {String} f The formula string
	 */
	setFormula: function(f) {
		this.formula = f;
		this.newFormula = true;
		this.reload();
	},
	
	/**
	 * Sum all the childrens values and set the sum to the value attribute.
	 * Will only work for groups, since they are the only ones that have childrens.
	 */
	sumAllItems: function() {
		var items = this.item.items;
		var sum = 0;
		
		//console.log(this.item.items);
		for (i in items) {
			sum += items[i].formula.getValue();
		}
		
		this.value = sum;
	},
	
	/**
	 * Process the formula string, if exists, replacing the variables by their 
	 * values and executes it to retrieve the result and set on the value attribute.
	 *
	 * @param {string} f The formula to be processed, if undefined will use the object formula (Optional)
	 * @param {boolean} saveValue If true will save the value in the object, default is true (Optional)
	 */
	processFormula: function(f, saveValue) {
		if (!f && !this.formula)
			return;
			
		if (saveValue == undefined)
			saveValue = true;
		
		var formula = f ? f : this.formula;
		var vars 	= formula.match(this.pattern);
		var funct 	= '(function calculate(){';
		var error	= false;
		
		for (i in vars) {
			var v   = vars[i].replace("$", "");
			var i   = this.item.incomeStatement.getItem(v);
			
			if (i)
				formula = formula.replace('\$' + v, '(' + i.formula.getValue() + ')');
			else {
				error = true;
				break;
			}
		}
		
		if (!error) {
			funct += 'return ' + formula + ';})();';
			
			try {
				if (saveValue)
					this.value = eval(funct);
				else
					return eval(funct);
			} catch(e) {
				console.log(e);
				return false;
			}
		} else {
			if (saveValue)
				this.input.addClass("error");
			else
				return false;
		}
	}
};

/**
 * The Formula Editor Window - create, edit and run the item's formulas
 */
View.Formula.Editor = (function() {
	var item, html, formula;
	
	if ($.facebox) {
		$.facebox.settings.loadingImage = 'images/facebox/loading.gif';
		$.facebox.settings.closeImage 	= 'images/facebox/closelabel.png';
	}
	
	return {
		/**
		 * Open the editor
		 *
		 * @param {View.Item} i The item to have its formula edited
		 */
		open: function(i) {
			item = i;
			
			// Build the editor html
			this.build(item.incomeStatement.getPlainItems());
			
			// Set the formula on the input
			formula = html.find("textarea.formula");
			formula.val(item.formula.formula);
			this.executeFormula();
			
			// Register the events
			this.registerEvents();
			
			// Start facebox
			jQuery.facebox(html);
			
			// Set focus to formula input
			formula.putCursorAtEnd();
	
			// Start scrollbar
			$("#formulator").tinyscrollbar();
		},
	
		/**
		 * Build the editor's html and item list
		 *
		 * @param {Array} items The array of items to be shown in the list
		 */
		build: function(items) {
			// Build the html
			html = '<div id="formulator">'
				 + '<h3>Clique na conta para adicionar a fórmula</h3>'
				 + '<div class="body">'
				 + '<div class="header">'
				 + '<span class="account">Conta</span>'
				 + '<span class="id">ID</span>'
				 + '</div>'
				 + '<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>'
				 + '<div class="viewport"><div class="overview">'
				 + '<ul>';
					 
			for (i in items)
				// Removes the edited item from the list to avoid self reference
				if (items[i] != item)
					html += '<li class="item" id="fx_' + items[i].type + '_' + items[i].id + '">'
					  	  + '<span style="float:left;">' + items[i].name + '</span>'
					  	  + '<span style="float:right;">' + items[i].type + '_' + items[i].id + '</span>'
					  	  + '</li>';
					 
			html += '</ul>'
				  + '</div></div></div>'
				  + '<div id="formulator-formula"><h3>Fórmula:</h3>'
				  + '<textarea class="formula"></textarea>'
				  + '<div class="run"><h3>Resultado:</h3>'
				  + '<a class="button" href="#" title="Executar fórmula">&raquo;</a>'
				  + '<input type="text" readonly="readonly" />'
				  + '</div>'
				  + '<p>Ex.: ($group_1 + $group_2 - 2500) / ($result_3 * 0.5)</p></div>'
				  + '<p class="error">Ops! Sua fórmula contém erros, verifique e execute novamente</p>'
				  + '<div id="formulator-buttons"><a class="help" href="#" title="Veja como criar fórmulas">ajuda?</a>'
				  + '<a class="button cancel" href="" title="">Cancelar</a>'
				  + '<a class="button save" href="" title="">Salvar</a></div>'
				  + '</div>';
				  
			html = $(html);
		},
		
		/**
		 * Register all the events of the editor so it can work
		 */
		registerEvents: function() {
			var thisObj = this;
			
			// On click on item
			html.find("li.item").each(function() {
				$(this).click(function() {
					thisObj.selectItem(this);
				});
			});
	
			// On cancel
			html.find(".cancel").click(function() {
				jQuery(document).trigger('close.facebox');
				return false;
			});
			
			// On save
			html.find(".save").click(function() {
				thisObj.saveFormula();
				return false;
			});
			
			// On execute formula
			html.find(".run a").click(function() {
				thisObj.executeFormula();
				return false;
			});
		},
		
		/**
		 * Method called when an item is selected in the list
		 *
		 * @param {object} item The selected DOM item
		 */
		selectItem: function(item) {
			var id = '$' + $(item).attr("id").replace("fx\_", "");
			formula.val(formula.val() + id + " ");
			$(formula).putCursorAtEnd();
		},
		
		/**
		 * Method called to save the formula in the item object
		 */
		saveFormula: function() {
			this.hideError();
			if (this.validateFormula() === false) {
				this.showError();
			} else {
				jQuery(document).trigger('close.facebox');
				item.formula.input.fadeTo(1000, 0, function() {
					item.formula.setFormula(formula.val());
					View.Formula.reloadAll(item.incomeStatement.items);
				}).fadeTo(1000, 1);
			}
		},
		
		/**
		 * Validates the formula
		 *
		 * @return {boolean} True if valid or false otherwise
		 */
		validateFormula: function() {
			var value = item.formula.processFormula(formula.val(), false);
			return (value === false) ? false : true;
		},
		
		/**
		 * Executes the formula and show the result to the user
		 */
		executeFormula: function() {
			var value = item.formula.processFormula(formula.val(), false);
			this.hideError();
			
			if (value !== false)
				html.find(".run input").val(value);
			else {
				this.showError();
			}
		},
		
		/**
		 * Just show the error message
		 */
		showError: function() {
			html.find(".error").fadeIn("slow");
		},
		
		/**
		 * Hide the error message
		 */
		hideError: function() {
			html.find(".error").fadeOut("slow");
		}
	};
})();

/**
 * Reload all the item's formulas, it must be used when a value is changed so
 * the change can be propagated to all items.
 */
View.Formula.reloadAll = function(items) {
	for (i in items) {
		var item = items[i];
		
		if (item.type == "group") {
			var childs = item.items;
			
			for (j in childs)
				childs[j].formula.reload();
				
			item.formula.reload();
			//console.log("grupo " + item.name + ": " + item.formula.value);
		} else
			item.formula.reload();
	}
	
	//console.log("all reloaded");
};

/**
 * Item View Model Object
 *
 * @constructor
 * @param {object} item The object with item data
 * @param {object} parent The parent of this item or null if doesn't exists
 * @param {View.IncomeStatement} incomeStatement The income statement object
 */
View.Item = function(item, parent, incomeStatement) {
	// Values
	this.id 		= item.id;
	this.type 		= item.type;
	this.name 		= item.name;
	this.order		= item.order;
	
	// The item object
	//this.item		= item;
	this.value 		= item.value ? item.value : null;
	this.funct 		= item.funct ? item.funct : null;
	
	// The formula object
	this.formula	= null;
	
	// DOM
	this.element 	= null;
	this.parent		= parent;
	this.list		= null;
	
	// The main object
	this.incomeStatement = incomeStatement;
	
	// His childrens
	this.items = item.items;
	
	this.initialize();
};

View.Item.prototype = {
	/**
	 * Initialize the item, setting up his childrens and building the html element
	 */
	initialize: function() {
		for (i in this.items)
			this.items[i] = new View.Item(this.items[i], this, this.incomeStatement);
			
		this.element = this.createHtml(this);
		this.formula = new View.Formula(this);
	},
	
	/**
	 * Creates the html of an item based on the givin object
	 *
	 * @param {View.Item} obj The item to have his html created
	 * @return {HTMLLIElement} The created element
	 */
	createHtml: function(obj) {
		// Create the li item
		var li 			= document.createElement('li');
		li.id 			= obj.type + '_' + obj.id;
		li.className 	= obj.type;
		li.onclick		= function(e){obj.onClick(e, obj)};
		
		// Create the item title
		var title 		= document.createElement('span');
		title.className = 'title';
		title.innerHTML = obj.name;
		
		// Create the item container of buttons and/or inputs
		var container 	= document.createElement('div');
		container.className = 'container';
		
		// The delete button appears always
		var del			= document.createElement('a');
		del.className 	= 'delete deleteGroup';
		del.href 		= '#';
		del.title 		= 'Remover Conta';
		del.innerHTML	= '<span>Deletar</span>';
		del.onclick		= function(e) {
			obj.onDelete(e, obj);
			return false;
		};
		
		// Deal with groups
		if (obj.type == 'group') {
			var add 		= document.createElement('a');
			add.className 	= 'add';
			add.href 		= '#';
			add.title 		= 'Adicionar Conta ao Grupo';
			add.innerHTML 	= '<span>Adicionar</span>';
			add.onclick		= function(e) {
				obj.onAdd(e, obj);
				return false;
			};
			
			this.list = document.createElement('ul');
			
			if (obj.items)
				for (i in obj.items)
					this.list.appendChild( obj.items[i].element );
					
			var unmovable 		= document.createElement('li');
			unmovable.className = 'unmovable';
			this.list.appendChild(unmovable);
		
			container.appendChild(add);
			container.appendChild(del);
		}
		// Deal with accounts and results
		else {
			var value 		= document.createElement('input');
			value.className = 'value';
			value.type 		= 'text';
			/*
			value.onpaste = function() {
				console.log("Handler for .onpaste() called.");
			};
			$(value).keypress(function() {
  				console.log("Handler for .keypress() called.");
			});
			*/
			
			var formula 		= document.createElement('input');
			formula.className 	= 'formula';
			formula.type 		= 'hidden';
			
			var funct 		= document.createElement('a');
			funct.className = 'button function';
			funct.href 		= '#';
			funct.title 	= 'Editar fórmula de cálculo';
			funct.innerHTML = 'f(x)';
			
			container.appendChild(value);
			container.appendChild(formula);
			container.appendChild(funct);
			container.appendChild(del);
		}
		
		li.appendChild(title);
		li.appendChild(container);
		if (this.list) li.appendChild(this.list);
		
		return li;
	},
	
	/**
	 * Method fired when the add button is clicked
	 *
	 * @param {object} e The fired event
	 * @param {object} obj The object in wich the event has been applied
	 */
	onAdd: function(e, obj) {
		View.Item.showItemChooser(obj.list, obj);
	},
	
	/**
	 * Method fired when the delete button is clicked
	 *
	 * @param {object} e The fired event
	 * @param {object} obj The object in wich the event has been applied
	 */
	onDelete: function(e, obj) {
		$(e.target).parent().parent().css({'background':'#f93a07', 'color':'#fff'})
		.fadeOut("slow", function() {
			$(this).remove();
			
			if (obj.parent) {
				// Remove this item from the old parent
				View.Item.remove(obj.parent, obj.id, true);
			}
			
			obj.incomeStatement.sortUpdate();
			View.Formula.reloadAll(obj.incomeStatement.items);
		});
	},
	
	/**
	 * Method fired when the item is clicked
	 *
	 * @param {object} e The fired event
	 * @param {object} obj The object in wich the event has been applied
	 */
	onClick: function(e, obj) {
		if (e.target.id == obj.element.id && this.incomeStatement.sorting == false) {
			var el = $(obj.element);
			var selected = el.hasClass('selected');
			
			if (selected) {
				el.removeClass('selected');
			} else {
				el.addClass('selected');
			}
			
			//call someone to send info to load something
			if (obj.incomeStatement.opt.onItemClick)
				obj.incomeStatement.opt.onItemClick(obj, selected);
		}
	},
	
	/**
	 * Removes the element from the income statement using an ajax call
	 */
	removeMe: function() {
		//atualiza via ajax o novo item
		console.log("removed item");
		Model.IncomeStatement.save({id: this.id, type: "delete"});
	},
	
	/**
	 * Used to set the order in the item, always set the order through this method
	 * because it checks if something changed, and if it did, it makes an ajax call
	 * to update the order value
	 *
	 * @param {integer} order The item order
	 */
	setOrder: function(order) {
		if (order != this.order) {
			this.order = order;
			
			//atualiza via ajax a nova ordem
			console.log("changed item order");
			Model.IncomeStatement.save({id: this.id, order: this.order, type: "update"});
		}
	},
	
	/**
	 * This method should be called after moving an item to update his location
	 * in the model
	 *
	 * @param {View.Item} target The new parent of the item, if any
	 */
	moveTo: function(target) {
		if (target) {
			// Add the item to the new location
			target.items.push(this);
			
			if (this.parent) {
				// Remove this item from the old parent
				//this.parent.removeItem(this.id, false);
				View.Item.remove(this.parent, this.id, false);
			}
			
			// This is the new father
			this.parent = target;
			
			// Atualiza valores de todos items
			View.Formula.reloadAll(this.incomeStatement.items);
			
			//atualiza via ajax o novo pai
			console.log("moved item");
			Model.IncomeStatement.save({id: this.id, parent: target.id, type: "update"});
		} else {
			Model.IncomeStatement.save({id: this.id, parent: null, type: "update"});
		}
	}
};

/**
 * Removes an item from a object
 *
 * @param {object} obj The object with items to be removed
 * @param {integer} id The id of the item that will be removed
 * @param {boolean} remove True if you want to call the removeMe method
 */
View.Item.remove = function(obj, id, remove) {
	// Find where in the array is this item
	var index = null;
	var item = null;
	for (i in obj.items)
		if (obj.items[i].id == id) {
			index = i;
			item = obj.items[index];
			obj.items.splice(index, 1);
			break;
		}
			
	if (remove && remove == true) {
		item.removeMe();
	}
};

/**
 * Show the item chooser in the given target
 *
 * @param {object} target
 * @param {object} obj
 */
View.Item.showItemChooser = function(target, obj) {
	Model.Item.list(function(data) {
		// Creates the combobox with the resulting data array
		var html = '<li class="new"><label>Esolha a conta a ser adicionada: </label>'
				 + '<select class="combobox"><option value=""></option>';

		for (var i = 0; i < data.length; i++)
			html += '<option value="' + i + '">' + data[i].name + '</option>';
		
		html += '</select><a class="button submit" href="#" title="">OK</a>'
			  + '<a class="button cancel" href="#" title="">Cancelar</a>'
			  + '<label class="labelNewAccount">ou crie uma</label>'
			  + '<a class="green-button newAccount" href="#" title="">nova conta</a>'
			  + '<p class="message"></p></li>';

		// Add the item selector to the target with super fancy effects
		var newAcc = $(html);
		newAcc.hide().appendTo(target).fadeIn("slow", function(){obj.incomeStatement.sortUpdate()});
	
		// Applies the combobox ui component
		newAcc.find('.combobox').combobox();
	
		// Register the submit event
		newAcc.find('.submit').click(function() {
			var s = data[ newAcc.find('.combobox').val() ];
		
			if (!s)
				newAcc.find('.message').show().html("Escolha uma conta para adicionar");
			else if ($(target).parent().hasClass("group") && (s.type == "group" || s.type == "result"))
				newAcc.find('.message').show().html("Não é permitido adicionar grupos de contas aqui");
			else if (obj.incomeStatement.getItem(s.type + "_" + s.id))
				newAcc.find('.message').show().html("Esta conta já existe no DRE");
			else {
				View.Item.addItem(obj, s, newAcc);
			}
			return false;
		});
	
		// Register the cancel event
		newAcc.find('.cancel').click(function() {
			newAcc.fadeOut("slow", function() {
				$(this).remove();
			});
			return false;
		});
		
		//Precisa lidar com a criação de novas contas, usando facebox
	});
};

/**
 * Add an item to a list
 *
 * @param {object} obj The object with a income statement and a list to add the item to
 * @param {object} item The object with the item information
 * @param {jQuery} toRemove The object to be removed when the item is added
 */
View.Item.addItem = function(obj, item, toRemove) {
	if (!item || !item.id || !item.type || !item.name)
		return false;
		
	var itemObj = new View.Item(item, obj, obj.incomeStatement);
	obj.items.push(itemObj);
	
	var el = $(itemObj.element);
	el.hide().appendTo(obj.list).addClass('selected');
	
	var incStmt = obj.incomeStatement;
		
	toRemove.fadeOut("slow", function() {
		$(this).remove();
		
		el.fadeIn("slow", function() {
			el.removeClass('selected');
			incStmt.sortUpdate();
			incStmt.target.sortable("refresh");
		});
	
	});
	
	View.Formula.reloadAll(obj.incomeStatement.items);

	//atualiza via ajax o novo item
	console.log("added item");
	Model.IncomeStatement.save({id: this.id, type: "create"});
};

/**
 * Income Statement Model View Object
 *
 * @constructor
 * @param {object} options
 */
View.IncomeStatement = function(options) {
	this.opt = {
		target: null,
		addButton: null,
		id: null,
		saveDateTarget: null,
		onItemClick: null,
		beforeSave: null,
		afterSave: null
	};
	
	// Merge das opções
	$.extend(this.opt, options);
	
	if (!this.opt.target)
		return;
	
	this.sorting 	= false;
	this.target 	= $(this.opt.target);
	
	if (this.opt.addButton)
		this.addButton = $(this.opt.addButton);
	if (this.opt.saveDateTarget)
		this.opt.saveDateTarget = $(this.opt.saveDateTarget);
		
	if (this.opt.afterSave)
		Model.IncomeStatement.setSaveCallbacks(this.opt.beforeSave, this.opt.afterSave);
	
	if (this.opt.id)
		Model.IncomeStatement.setId(this.opt.id);
	
	// Data properties
	this.id 	= this.opt.id;
	this.items 	= [];
	this.start_date = null;
	this.end_date = null;

	this.initialize();
};

View.IncomeStatement.prototype = {
	/**
	 * Initialize the Income Statement view
	 */
	initialize: function() {
		var thisObj = this;
		this.target.sortable({
			items: "li",
			placeholder: "ui-state-highlight",
			scrollSpeed: 10,
			opacity: 0.8,
			delay: 200,
			revert: 400,
			update: function(){thisObj.sortUpdate()},
			start: function(e, ui){thisObj.sortStart(e, ui)},
			stop: function(e, ui){thisObj.sortStop(e, ui)}
		});
		
		if (this.opt.id)
			this.loadFromModel(this.opt.id);
			
		if (this.addButton)
			this.addButton.click(function() {
				View.Item.showItemChooser(thisObj.target, {
					incomeStatement: thisObj,
					items: thisObj.items,
					list: thisObj.target
				});
			});
	},
	
	/**
	 * Function activated when a item starts to be dragged
	 *
	 * @param {object} event
	 */
	sortStart: function(event, ui) {
		this.sorting = true,
			thisObj  = this;
		
		// Change the 'to be sorted' element border and cursor
		//$(event.toElement).css({'cursor':'move', 'border':'1px solid #ff8400'});
		$(ui.item).css({'cursor':'move', 'border':'1px solid #ff8400'});
		
		// Show the unmovable pieces
		this.target.find(".unmovable").each(function() {
			$(this).show();
			thisObj.target.sortable("refresh");
		});
	},
	
	/**
	 * Function activated when a item stops to be dragged
	 *
	 * @param {object} event
	 */
	sortStop: function(event, ui) {
		this.sorting = false;
		//var el = $(event.toElement);
		var el = $(ui.item);
		el.css({'cursor':'', 'border':''});
		
		this.target.find(".unmovable").each(function() {
			$(this).hide();
		});
		
		// Check if the operation is NOT allowed
		if (el.is(".group, .result") && el.parent().parent().is(".group")) {
			this.target.sortable('cancel');
			this.sortUpdate();
		} else {
			// Try to find the target group (if any) where the object has been dragged
			var id = null;
			var parent = el.parent();
			
			if (parent.is(".group"))
				id = parent.attr("id");
			else if (parent.parent().is(".group"))
				id = parent.parent().attr("id");

			// Check if item moved to a group
			if (id) {
				var target = this.getItem(id);
			
				id = el.attr("id") ? el.attr("id") : el.parent().attr("id");
				this.getItem(id).moveTo(target);
			} else
				// In this case the item moved to the body
				if (parent.is(".body") || parent.parent().is(".body")) {
					id = el.attr("id") ? el.attr("id") : el.parent().attr("id");
					this.getItem(id).moveTo(this);
				}
		}
	},
	
	/**
	 * Function activated every time an change occurr in the model structure
	 */
	sortUpdate: function() {
		var counter 	= 1,
			itemOrder 	= 0,
			thisObj 	= this;
		
		this.target.find("li").each(function() {
			// Add odd and even to root list items
			if ($(this).parent().hasClass('body')) {
				$(this).removeClass('even odd');
				(counter%2 == 0) ? $(this).addClass('even') : $(this).addClass('odd');
				
				counter++;
			}
			
			// Set the order of the items
			if ($(this).is(".account, .group, .result")) {
				var item = thisObj.getItem($(this).attr("id"));
				if (item) item.setOrder(itemOrder);
				itemOrder++;
			}
		});
	},
	
	/**
	 * Returns an item from the income statement based on the DOM id
	 *
	 * @param {string} id
	 * @return {View.Item}
	 */
	getItem: function(id) {	
		var get = function(items) {
			for (i in items) {
				if (items[i].element.id == id)
					return items[i];
				if (items[i].items) {
					var item =  get(items[i].items);
					if (item) return item;
				}
			}
			return null;
		}
		
		return get(this.items);
	},
	
	/**
	 * Get all items in the income statement without grouping them (multilevel)
	 *
	 * @return {Array}
	 */
	getPlainItems: function() {
		var plain = [];
		
		var get = function(items) {
			for (i in items) {
				plain.push(items[i]);
				if (items[i].items) {
					get(items[i].items);
				}
			}
		}
		
		get(this.items);
		return plain;
	},
	
	/**
	 * Load an Income Statement from the model with the given id
	 *
	 * @param {integer} id
	 */
	loadFromModel: function(id) {
		var thisObj = this;
		Model.IncomeStatement.get(id, function(is) {
			for (i in is.items) {
				thisObj.items[i] = new View.Item(is.items[i], thisObj, thisObj);
			}
			
			// Copy additional data
			thisObj.start_date 	= new Date(is.start_date);
			thisObj.end_date 	= new Date(is.end_date);
			
			thisObj.toView(thisObj.items);
		});
	},
	
	/**
	 * Put an Income Statement into the view
	 *
	 * @param {array} items The items objects of the income statement
	 */
	toView: function(items) {
		for (i in items)
			this.target.append(items[i].element);
			
		this.sortUpdate();
	}
};


/**
 * Projection Chart
 *
 * @constructor
 * @param {String} id The id of the HTML element where the chart will be ploted
 */
View.ProjectionChart = function(id) {
	this.target = document.getElementById(id);
	this.items 	= {};
	this.chart 	= null;
	this.data 	= null;
	this.labels = null;
};

View.ProjectionChart.prototype = {
	options: {
		ylabel: 'R$',
		legend: 'always',
		labels: ["", "", ""],
		fillGraph: false,		// fill the area below the line
		fillAlpha: 0.8,			// the opacity of the filled area
		drawPoints: true, 		// put a point in each spot
		pointSize: 5, 			// size of the ploted dots
		strokeWidth: 3, 		// size of the line
		highlightCircleSize: 9, // size of the highlight circle
		labelsDivWidth: 400,	// the width of the labels div
		labelsDivStyles: {
			'text-align': 'right',
			'font-size': '14pt',
		},
		labelsDiv: document.getElementById("chart-legend"),
		colors: ["#ffb400", "#00AEFE"]
	},
	
	load: function(item, remove) {
		var thisObj = this;
		if (remove == undefined)
			remove = true;
			
		if (!remove)
			Model.IncomeStatement.getItemHistory(item.id, function(data) {
				thisObj.items[item.id] = {data: data, item: item};
				thisObj.mergeData();
				thisObj.chart = new Dygraph(thisObj.target, thisObj.data, $.extend(thisObj.options, {labels: thisObj.labels}));
			});
		else if (item) {
			delete(this.items[item.id]);
			this.mergeData();
			
			if (this.data.length > 0)
				this.chart = new Dygraph(thisObj.target, thisObj.data, $.extend(thisObj.options, {labels: thisObj.labels}));
			else {
				this.chart.destroy();
				this.emptyChart();
			}
		}
	},

	mergeData: function() {
		var col = 1;
		this.data = [];
		this.labels = ["Data"];
		
		for (attr in this.items) {
			var data = this.items[attr].data;
			
		
			for (i in data)
				this.add(data[i][0], data[i][1], col);
				
			var item = this.items[attr].item;
			this.add(item.incomeStatement.start_date, item.formula.value, col);
			this.add(item.incomeStatement.end_date, item.formula.value, col);
			this.labels[col] = item.name;
	
			col++;
		}
		
		this.fillEmpty(col);
		this.data.sort(this.sortByDate);
	},
	
	add: function(key, value, col) {
		var done = false;
		
		// Verifica se data já existe
		for (i in this.data)
			if (this.data[i][0].getTime() == key.getTime()) {
				this.data[i][col] = value;
				done = true;
				break;
			}
		
		// Se não existe, cria novo array
		if (!done) {
			var row = [key];
			
			for (var i=1; i < col; i++)
				row[i] = null;
			
			row[col] = value;
			this.data.push(row);
		}
	},
	
	fillEmpty: function(cols) {
		for (i in this.data)
			for (var c = 1; c < cols; c++)
				if (this.data[i][c] == undefined)
					this.data[i][c] = null;
	},
	
	sortByDate: function(a, b) {
		if (a[0].getTime() > b[0].getTime())
			return 1;
		if (a[0].getTime() < b[0].getTime())
			return -1;
		return 0;
	},
		
	emptyChart: function() {
		var html = '<div id="empty-chart">'
		         + '<p class="one">Nenhuma conta carregada</p>'
		         + '<p class="two">Clique nas contas para carregá-las no gráfico</p></div>';
		
		$("#chart").html(html);
		$("#chart-legend").html("");
	}
};

View.ContactList = function(id) {
	this.id = id;
	this.initialize();
};

View.ContactList.prototype = {
	initialize: function() {
		var thisObj = this;
		Model.Contact.list(function(data) {
			$(thisObj.id).bind( "keydown", function( event ) {
				if ( event.keyCode === $.ui.keyCode.TAB &&
						$( this ).data( "autocomplete" ).menu.active ) {
					event.preventDefault();
				}
			})
			.autocomplete({
				minLength: 0,
				source: function( request, response ) {
					// delegate back to autocomplete, but extract the last term
					response( $.ui.autocomplete.filter(
						data, thisObj.extractLast( request.term ) ) );
				},
				focus: function() {
					// prevent value inserted on focus
					return false;
				},
				select: function( event, ui ) {
					var terms = thisObj.split( this.value );
					// remove the current input
					terms.pop();
					// add the selected item
					terms.push( ui.item.value );
					// add placeholder to get the comma-and-space at the end
					terms.push( "" );
					this.value = terms.join( ", " );
					return false;
				}
			})
			.focus()
			.data( "autocomplete" )._renderItem = function( ul, item ) {
				return $( "<li></li>" )
					.data( "item.autocomplete", item )
					.append( "<a>" + item.label + " &lt;" + item.value + "&gt;</a>" )
					.appendTo( ul );
			};
		});
	},
	
	split: function(val) {
		return val.split( /,\s*/ );
	},
	extractLast: function(term) {
		return this.split( term ).pop();
	}
};

View.Table = {
	options: {
		"bLengthChange": false,
		"bFilter": false,
		"sPaginationType": "full_numbers",
		"oLanguage": {
			"sInfo": "Exibindo _START_ a _END_ de _TOTAL_",
			"oPaginate": {
				"sFirst": "« Primeira",
				"sLast": "Última »",
				"sNext": "Próxima  &gt;",
				"sPrevious": "&lt; Anterior"
			},
			"sProcessing": "Processando...",
			"sInfoEmpty": "Nenhum registro para ser exibido",
			"sLoadingRecords": "Aguarde, carregando..."
		},
		"bProcessing": true,
		"bServerSide": true,
		"fnServerData": function( sUrl, aoData, fnCallback ) {
			$.ajax({
				"url": sUrl,
				"data": aoData,
				"success": fnCallback,
				"dataType": "jsonp",
				"cache": false
			});
		}
	},
	
	loadMyProjections: function() {
		var options = {
			"sAjaxSource": "/projections/list_my_projections",
			"aoColumns": [
				{
					"sTitle": "Projeção",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						var html = '<a href="#'+obj.aData[6]+'" title="Visualizar projeção">'+sReturn+'</a>';
						return html;
					}
				},
				{
					"sTitle": "Início",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y');
					}
				},
				{
					"sTitle": "Fim",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y');
					}
				},
				{ "sTitle": "Comentários", "sClass": "center", "bSortable": false, },
				{ "sTitle": "Versões", "sClass": "center", "bSortable": false, },
				{
					"sTitle": "Criado em",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y');
					}
				},
				{
					"sTitle": "Ações",
					"sClass": "center",
					"bSortable": false,
					"fnRender": function(obj) {
						var id = obj.aData[ obj.iDataColumn ];
						var html = '<a class="delete" href="#'+id+'" title="Deletar projeção">deletar</a>';
						return html;
					}
				}
			],
			"fnInitComplete": function() {
				$('<div id="projections-table-footer" class="footer"></div>')
					.append($('#projections-table_info'))
					.append($('#projections-table_paginate'))
					.appendTo('#projections-table_wrapper');
			}
		};
		$.extend(options, this.options);
		
		$('#projections-table').dataTable(options);
	},
	
	loadSharedProjections: function() {
		var options = {
			"sAjaxSource": "/projections/list_shared_projections",
			"aoColumns": [
				{
					"sTitle": "Projeção",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						var html = '<a href="#'+obj.aData[6]+'" title="Visualizar projeção">'+sReturn+'</a>';
						return html;
					}
				},
				{
					"sTitle": "Início",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y');
					}
				},
				{
					"sTitle": "Fim",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y');
					}
				},
				{ "sTitle": "Criado por", "sClass": "center", "bSortable": false, },
				{ "sTitle": "Versões", "sClass": "center", "bSortable": false, },
				{
					"sTitle": "Criado em",
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						return new Date(sReturn).format('d/m/Y');
					}
				}
			],
			"fnInitComplete": function() {
				$('<div id="shared-projections-table-footer" class="footer"></div>')
					.append($('#shared-projections-table_info'))
					.append($('#shared-projections-table_paginate'))
					.appendTo('#shared-projections-table_wrapper');
			}
		};
		$.extend(options, this.options);
		
		$('#shared-projections-table').dataTable(options);
	}
};
