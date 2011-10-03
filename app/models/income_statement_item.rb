class IncomeStatementItem < ActiveRecord::Base
  validates_presence_of :income_statement, :item, :order
  validates_length_of :function, :maximum => 255
  validates_associated :income_statement, :item
  validates_numericality_of :order
  validates_numericality_of :value, :parent_id, :allow_nil => true
  
  belongs_to :income_statement
  belongs_to :item
  belongs_to :parent, :class_name => "IncomeStatementItem", :foreign_key => :parent_id
  has_many :childrens, :class_name => "IncomeStatementItem", :foreign_key => :parent_id
  
  def to_hash
  	hash = {
  		"id" 		=> item.id,
  		"order" => order,
  		"value" => value,
  		"funct" => function,
  		"type" 	=> item.classification,
  		"name" 	=> item.name,
  		"items" => []
  	}
  	return hash
  end
  
  def set_from_hash(hash)
    if hash["order"]
      write_attribute(:order, hash["order"].to_i)
    end
    
    if hash["parent"]
      p = where(:income_statement_id => income_statement_id, :item_id => hash["parent"]).first
      logger.info(p)
      write_attribute(:parent_id, p.id)
    end
    
    if hash["value"]
      write_attribute(:value, hash["value"].to_i)
    end
    
    if hash["funct"]
      write_attribute(:function, hash["funct"])
    end
  end
end
