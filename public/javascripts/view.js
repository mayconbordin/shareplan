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
			console.log("update formula");
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
	this.parentId	= null;
	
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
	this.items = item.items ? item.items : [];
	
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
		var chooser = new View.Item.Chooser(obj.list, obj);
		chooser.show(obj.list, obj);
		
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
			var parentId = (parent instanceof View.IncomeStatement) ? null : parent.id;
			
			Model.IncomeStatement.save({id: this.id, parent: parentId, type: "update"});
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

View.Item.Chooser = function(target, obj) {
	this.target 	= target;
	this.obj		= obj;
	this.chooser 	= null;
	this.data 		= null;
};
		
View.Item.Chooser.prototype = {
	show: function() {
		thisObj = this;
		
		Model.Item.list(function(r) {
			thisObj.data	= r;
			thisObj.chooser = thisObj.createCombobox();
			
			// Add the item selector to the target with super fancy effects
			thisObj.chooser.hide().appendTo(thisObj.target).fadeIn("slow", function(){
				thisObj.obj.incomeStatement.sortUpdate();
			});
		
			// Applies the combobox ui component
			thisObj.chooser.find('.combobox').combobox();
			
			// Call event registrations
			thisObj.registerOnSubmit();
			thisObj.registerOnCancel();
			thisObj.registerOnNewAccount();
			
		});
	},
	
	showError: function(message) {
		this.chooser.find('.message').show().html(message);
	},
	
	registerOnSubmit: function() {
		var thisObj = this;
		this.chooser.find('.submit').click(function() {
			var s = thisObj.data[ thisObj.chooser.find('.combobox').val() ];
			var m = thisObj.chooser.find('.message');
		
			if (!s)
				thisObj.showError("Escolha uma conta para adicionar");
			else if ($(thisObj.target).parent().hasClass("group") && (s.type == "group" || s.type == "result"))
				thisObj.showError("Não é permitido adicionar grupos de contas aqui");
			else if (thisObj.obj.incomeStatement.getItem(s.type + "_" + s.id))
				thisObj.showError("Esta conta já existe no DRE");
			else {
				View.Item.addItem(thisObj.obj, s, thisObj.chooser);
			}
			return false;
		});
	},
	
	registerOnCancel: function() {
		var thisObj = this;
		this.chooser.find('.cancel').click(function() {
			thisObj.chooser.fadeOut("slow", function() {
				$(this).remove();
			});
			return false;
		});
	},
	
	registerOnNewAccount: function() {
		var thisObj = this;
		this.chooser.find('.newAccount').click(function() {
			View.Item.NewAccountBox.show(thisObj.chooser, thisObj.data);
			return false;
		});
	},
	
	createCombobox: function() {
		// Creates the combobox with the resulting data array
		var html = '<li class="new"><label>Esolha a conta a ser adicionada: </label>'
				 + '<select class="combobox"><option value=""></option>';

		for (var i = 0; i < this.data.length; i++)
			html += '<option value="' + i + '">' + this.data[i].name + '</option>';
		
		html += '</select><a class="button submit" href="#" title="">OK</a>'
			  + '<a class="button cancel" href="#" title="">Cancelar</a>'
			  + '<label class="labelNewAccount">ou crie uma</label>'
			  + '<a class="green-button newAccount" href="#" title="">nova conta</a>'
			  + '<p class="message"></p></li>';
			  
		return $(html);
	}
};

View.Item.NewAccountBox = (function() {
	var chooser,
		data,
		accountBox,
		thisObj;
	
	return {
		show: function(c, d) {
			chooser = c;
			data 	= d;
			thisObj = this;
			
			jQuery.facebox(this.createHtml());
			
			accountBox = $("#new-account-box");
			this.registerOnSave();
			this.registerOnCancel();
		},
		
		createHtml: function() {
			var html = '<form id="new-account-box"><h2>Criar nova conta</h2>'
					 + '<div class="container"><label>Nome da conta:</label>'
					 + '<input name="item[name]" class="textfield" type="text" /></div><div class="container"><label>Tipo de conta:</label>'
					 + '<select name="item[classification]"><option value="account">Conta</option><option value="group">Grupo de contas</option><option value="result">Resultado</option></select></div>'
					 + '<div class="container"><label>Débito ou crédito:</label>'
					 + '<select name="item[item_type]"><option value="debt">Débito</option><option value="credit">Crédito</option></select></div>'
					 + '<div class="buttons"><a class="button cancel" href="#" title="Cancelar">Cancelar</a>'
					 + '<a class="button save" href="#" title="Criar">Criar</a></div></form>';
					 
			return html;
		},
		
		registerOnCancel: function() {
			accountBox.find(".cancel").click(function() {
				jQuery(document).trigger('close.facebox');
				return false;
			});
		},
		
		registerOnSave: function() {
			accountBox.find(".save").click(function() {
				var values = {};
				$.each(accountBox.serializeArray(), function(i, field) {
				    values[field.name] = field.value;
				});
				
				Model.Item.save(values, function(r) {
					if (r.error) {
						thisObj.onSaveError();
					} else {
						thisObj.onSaveSuccess(r);
					}
				});
				return false;
			});
		},
		
		onSaveSuccess: function(newItem) {
			jQuery(document).trigger('close.facebox');
						
			chooser.find(".combobox option:selected").removeAttr('selected');
			
			var i = (data.push(newItem) - 1);
			chooser.find(".combobox").append('<option value="' + i + '" selected="selected">' + data[i].name + '</option>');
			
			chooser.find('.ui-autocomplete-input').val(data[i].name);
		},
		
		onSaveError: function() {
			
		}
	};
})();

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
	Model.IncomeStatement.save({id: item.id, parent: obj.id, type: "create"});
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
		type: null,
		saveDateTarget: null,
		onItemClick: null,
		beforeSave: null,
		afterSave: null,
		onLoad: null
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

	// Data properties
	this.id 	= this.opt.id;
	this.items 	= [];
	this.start_date = null;
	this.end_date = null;
	
	// Original object
	this.obj = null;

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
				var chooser = new View.Item.Chooser(thisObj.target, {
					incomeStatement: thisObj,
					items: thisObj.items,
					list: thisObj.target
				});
				chooser.show();
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
		this.loader("show");
		
		Model.IncomeStatement.get(id, function(is) {
			thisObj.obj = is;
			
			for (i in is.items) {
				thisObj.items[i] = new View.Item(is.items[i], thisObj, thisObj);
			}
			
			// Copy additional data
			thisObj.start_date 	= new Date(is.start_date);
			thisObj.end_date 	= new Date(is.end_date);
			Model.IncomeStatement.setId(is.id);
			Model.IncomeStatement.setType(is.type);
			
			// Carrega as fórmulas e valores
			View.Formula.reloadAll(thisObj.items);
			
			thisObj.toView(thisObj.items);
		});
	},
	
	/**
	 * Put an Income Statement into the view
	 *
	 * @param {array} items The items objects of the income statement
	 */
	toView: function(items) {
		this.loader("hide");
		for (i in items)
			this.target.append(items[i].element);
			
		this.sortUpdate();
		
		if (this.opt.onLoad)
			this.opt.onLoad();
	},
	
	loader: function(a) {
		if (a == "show")
			this.target.html('<li class="loader"><img src="/images/loader_grey.gif"></li>');
		else if (a == "hide")
			this.target.html('');
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
	
	loadSharedProjections: function(callback) {
		var options = {
			"sAjaxSource": "/projections/list_shared_projections",
			"aoColumns": [
				{
					"sTitle": "Projeção",
					"sWidth": "30%",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						var html = '<a href="/projections/edit/'+obj.aData[6]+'" title="Visualizar projeção">'+sReturn+'</a>';
						return html;
					}
				},
				{ "sTitle": "Início", "sClass": "center", "sWidth": "15%" },
				{ "sTitle": "Fim", "sClass": "center", "sWidth": "15%" },
				{ "sTitle": "Criado por", "sClass": "center", "sWidth": "15%", "bSortable": false, },
				{ "sTitle": "Versões", "sClass": "center", "sWidth": "10%", "bSortable": false, },
				{ "sTitle": "Criado em", "sClass": "center", "sWidth": "15%" }
			],
			"fnInitComplete": function() {
				$('<div id="shared-projections-table-footer" class="footer"></div>')
					.append($('#shared-projections-table_info'))
					.append($('#shared-projections-table_paginate'))
					.appendTo('#shared-projections-table_wrapper');
					
				$("#shared-projections-table").css("width", "");
					
				if (callback) callback();
			}
		};
		$.extend(options, this.options);
		$('#shared-projections-table').dataTable(options);
	},
	
	loadMyProjections: function() {
		var options = {
			"sAjaxSource": "/projections/list_my_projections",
			"aoColumns": [
				{
					"sTitle": "Projeção",
					"sWidth": "30%",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						sReturn = sReturn == "" ? "(Sem Título)" : sReturn;
						
						var html = '<a href="/projections/edit/'+obj.aData[6]+'" title="Visualizar projeção">'+sReturn+'</a>';
						
						if (obj.aData[7] == "temp")
							html += '<span class="draft"> (Rascunho)</span>';
						return html;
					}
				},
				{ "sTitle": "Início", "sClass": "center", "sWidth": "15%" },
				{ "sTitle": "Fim", "sClass": "center", "sWidth": "15%" },
				{ "sTitle": "Comentários", "sClass": "center", "sWidth": "5%", "bSortable": false, },
				{ "sTitle": "Versões", "sClass": "center", "sWidth": "5%", "bSortable": false, },
				{ "sTitle": "Criado em", "sClass": "center", "sWidth": "15%", },
				{
					"sTitle": "Ações",
					"sClass": "center",
					"sWidth": "15%",
					"bSortable": false,
					"fnRender": function(obj) {
						var id = obj.aData[ obj.iDataColumn ];
						var html = '<a class="delete" href="'+id+'" title="Deletar projeção">deletar</a>';
						return html;
					}
				}
			],
			"fnInitComplete": function() {
				$('<div id="projections-table-footer" class="footer"></div>')
					.append($('#projections-table_info'))
					.append($('#projections-table_paginate'))
					.appendTo('#projections-table_wrapper');
					
				$("#projections-table").css("width", "");
			},
			"fnDrawCallback": function() {
				//on delete
				$("#projections-table .delete").each(function() {
					$(this).click(function() {
						var html = $(
							'<h3>Deseja remover esta projeção?</h3>'
							+ '<a class="button" href="#" title="Não">Não</a>'
							+ '<a class="button" href="#" title="Sim">Sim</a>'
						);
						jQuery.facebox(html);
						return false;
					});
				});
			}
		};
		$.extend(options, this.options);
		$('#projections-table').dataTable(options);
	},
	
	loadHistory: function() {
		var options = {
			"sAjaxSource": "/history/list",
			"aoColumns": [
				{
					"sTitle": "DRE",
					"sWidth": "30%",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						sReturn = sReturn == "" ? "(Sem Título)" : sReturn;
						
						var html = '<a href="/history/edit/'+obj.aData[4]+'" title="Visualizar DRE">'+sReturn+'</a>';
						return html;
					}
				},
				{ "sTitle": "Início", "sClass": "center", "sWidth": "15%" },
				{ "sTitle": "Fim", "sClass": "center", "sWidth": "15%" },
				{ "sTitle": "Criado em", "sClass": "center", "sWidth": "15%" },
				{
					"sTitle": "Ações",
					"sClass": "center",
					"sWidth": "15%",
					"bSortable": false,
					"fnRender": function(obj) {
						var id = obj.aData[ obj.iDataColumn ];
						var html = '<a class="delete" href="'+id+'" title="Deletar DRE">deletar</a>';
						return html;
					}
				}
			],
			"fnInitComplete": function() {
				$('<div id="history-table-footer" class="footer"></div>')
					.append($('#history-table_info'))
					.append($('#history-table_paginate'))
					.appendTo('#history-table_wrapper');
					
				$("#history-table").css("width", "");
			},
			"fnDrawCallback": function() {
				//on delete
				$("#history-table .delete").each(function() {
					$(this).click(function() {
						var html = $(
							'<h3>Deseja remover esta DRE?</h3>'
							+ '<a class="button" href="#" title="Não">Não</a>'
							+ '<a class="button" href="#" title="Sim">Sim</a>'
						);
						jQuery.facebox(html);
						return false;
					});
				});
			}
		};
		$.extend(options, this.options);
		$('#history-table').dataTable(options);
	},
	
	loadProjections: function() {
		var thisObj = this;
		this.loadMyProjections();
		
		$('#select-my-projections').click(function() {
			$(this).parent().addClass("selected");
			$('#projections-table').show();
			$('#projections-table-footer').show();
			
			$('#select-shared-projections').parent().removeClass("selected");
			$('#shared-projections-table').hide();
			$('#shared-projections-table-footer').hide();
		});
		
		$('#select-shared-projections').click(function() {
			var button = $(this);
			function load() {
				button.parent().addClass("selected");
				$('#shared-projections-table').show();
				$('#shared-projections-table-footer').show();
				
				$('#select-my-projections').parent().removeClass("selected");
				$('#projections-table').hide();
				$('#projections-table-footer').hide();
			}
			
			if (!$('#shared-projections-table').html())
				thisObj.loadSharedProjections(load);
			else
				load();
			
		});
	}
};

View.IncomeStatementEditor = function(target, obj) {
	this.target	= $(target);
	this.obj 	= obj;
	
	this.values = [
		this.obj.title,
		this.obj.comment,
		new Date(this.obj.start_date).format("d/m/Y"),
		new Date(this.obj.end_date).format("d/m/Y")
	];
	this.inputs = ["title", "comment", "start-date", "end-date"];
		
	this.initialize();
};

View.IncomeStatementEditor.prototype = {
	initialize: function() {
		var thisObj = this;
		
		this.target.find(".edit").click(function() {
			thisObj.enableEdit();
			return false;
		});
		
		this.target.find(".cancel").click(function() {
			thisObj.disableEdit();
			return false;
		});
		
		this.target.find(".save").click(function() {
			thisObj.save();
			thisObj.disableEdit();
			return false;
		});
	},
	enableEdit: function() {
		var thisObj = this;
		
		this.target.find(".container-text").fadeOut("slow", function() {
			thisObj.target.find(".container-form").fadeIn("slow");
		});
		
		for (i in this.inputs)
			this.target.find(".container-form ."+this.inputs[i]).val(this.values[i]);
	},
	disableEdit: function() {
		var thisObj = this;
		this.target.find(".container-form").fadeOut("slow", function() {
			thisObj.target.find(".container-text").fadeIn("slow");
		});
	},
	save: function() {
		var thisObj = this;
		var data = {id: this.obj.id, values:{}};
		for (i in this.inputs) {
			this.values[i] = this.target.find(".container-form ."+this.inputs[i]).val();
			this.target.find(".container-text ."+this.inputs[i]).html(this.values[i]);
			
			data.values[this.inputs[i].replace("-", "_")] 	= this.values[i];
			this.obj[this.inputs[i].replace("-", "_")] 		= this.values[i];
		}
		
		this.obj.start_date = Date.toDate(this.values[2]);
		this.obj.end_date 	= Date.toDate(this.values[3]);
		
		this.loader("show");
		Model.IncomeStatement.saveInfo(data, function(data) {
			if (data.status = "success")
				thisObj.loader("hide");
			else
				alert("Ocorreu um erro ao salvar o DRE");
		});
	},
	
	loader: function(a) {
		if (a == "show") {
			this.target.find(".save, .cancel").hide();
			this.target.find(".buttons").append('<img class="loader" src="/images/loader_grey.gif" alt="loader">');
		}
		else if (a == "hide") {
			this.target.find(".save, .cancel").show();
			this.target.find(".loader").remove();
		}
	}
};

View.Comments = function(target, id) {
	this.target = $(target);
	this.id = id;
	this.data = null;
	this.newest = null;
	
	this.initialize();
};

View.Comments.prototype = {
	initialize: function() {
		this.registerTextarea();
		this.registerSend();
		this.registerCancel();
		this.load();
		
		this.update();
	},
	load: function() {
		var thisObj = this;
		Model.Comment.list(this.id, function(data) {
			thisObj.data = data;
			if (data[0]) thisObj.newest = data[0];
			
			thisObj.target.find('.list').html("");
			thisObj.target.find(".comments-inner").tinyscrollbar();
			
			for (i in data)
				thisObj.add(data[i]);
		});
	},
	update: function() {
		var thisObj = this;
		
		if (this.newest) {
			var obj = {id: this.id, date: this.newest.created_at};
			
			Model.Comment.listUpdated(obj, function(data) {
				thisObj.data.push(data);
				if (data[0]) thisObj.newest = data[0];
				
				for (i in data)
					thisObj.add(data[i], true);
			});
		}
		
		setTimeout(function() {
			thisObj.update();
			console.log("update comments");
		}, 15000);
	},
	loadScrollbar: function() {
		this.target.find(".comments-inner").tinyscrollbar_update();
	},
	buildHtml: function(c) {
		var date = new Date(c.created_at).format("d/m/Y h:i:s");
		var html = '<div id="comment_'+c.id+'" class="comment">';
		
		if (c.owner)
			html += '<div class="delete" title="Remover comentário"><img src="/images/facebox/closelabel.png" alt="Deletar comentário" /></div>';
		
		html += '<p class="content">'+c.content+'</p>'
			  + '<p class="info">por <span class="author">'+c.author+'</span> em '+date+'</p>'
			  + '</div>';
			  
		html = $(html);
		
		if (c.owner)
			this.registerDelete(c, html);
		
		return html;
	},
	add: function(c, e) {
		var html = this.buildHtml(c);
		
		if (e)
			$(this.buildHtml(c)).hide().prependTo(this.target.find('.list')).fadeIn("slow");
		else
			this.target.find('.list').append(html);
			
		this.loadScrollbar();
	},
	
	registerDelete: function(c, el) {
		var thisObj = this;
		el.find(".delete").click(function() {
			var p = $(this).parent();
			Model.Comment.destroy(c.id, function(data) {
				if (data.status = "success")
					p.fadeOut("slow", function() {
						$(this).remove();
						thisObj.loadScrollbar();
					});
			});
		});
	},
	
	registerSend: function() {
		var thisObj = this;
		this.target.find('.new .send').click(function() {
			console.log("send");
			var content = $(this).parent().find(".content");
			var message = $(this).parent().find(".message");
			
			if (content.val() == "")
				message.html("Você precisa escrever algo para poder enviar!");
			else {
				message.html("");
				thisObj.loader("show");
				
				var obj = {id: thisObj.id, comment: {content: content.val()}};
				Model.Comment.save(obj, function(data) {
					if (data.status == "success") {
						thisObj.loader("hide");
						thisObj.cancel();
						thisObj.add(data.comment, true);
						thisObj.newest = data.comment;
					} else if (data.status == "no_rights")
						message.html("Você não tem permissão para postar comentários.");
					else
						message.html("Ocorreu um erro ao enviar seu comentário.");
				});
			}
			return false;
		});
	},
	
	registerCancel: function() {
		var thisObj = this;
		this.target.find('.new .cancel').click(function() {
			thisObj.cancel();
			return false;
		});
	},
	
	registerTextarea: function() {
		this.target.find('.new .content').focusin(function() {
			$(this).css({"height":"50px", "color":"#666"});
			$(this).parent().find(".send, .cancel").show();
			
			if ($(this).val() == "Responder...")
				$(this).val("");
		});
	},
	
	cancel: function() {
		var content = this.target.find(".new .content");
		content.css({"height":"20px", "color":"#ccc"})
			   .val("Responder...");
			   
		this.target.find(".new .send, .new .cancel").hide();
		this.target.find(".new .message").html("");
	},
	
	loader: function(a) {
		if (a == "show") {
			this.target.find(".new .send, .new .cancel").hide();
			this.target.find(".message").append('<img class="loader" src="/images/loader.gif" alt="loader">');
		}
		else if (a == "hide") {
			this.target.find(".new .send, .new .cancel").show();
			this.target.find(".loader").remove();
		}
	}
}
