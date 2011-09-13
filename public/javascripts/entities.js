//Aplicar padrão no controller e model
var Entity = {};

Entity.Dre = function() {
	this.items 	= [];
};

Entity.Dre.prototype = {
	addItem: function(item) {
		this.items.push(item);
	}
};

Entity.Item = function(id, tipo, nome) {
	this.id 	= id;
	this.tipo 	= tipo;
	this.nome 	= nome;
	this.items = [];
};

Entity.Item.prototype = {
	addItem: function(item) {
		this.items.push(item);
	}
};
