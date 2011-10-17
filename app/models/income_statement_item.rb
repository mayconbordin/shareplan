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
  
  def self.from_hash(id, hash)
    item = where(:income_statement_id => id, :item_id => hash["id"]).first
        
    if item.nil?
      item = new(:income_statement_id => id, :item_id => hash["id"], :order => 0)
    end

    if hash["order"]
      item.order = hash["order"].to_i
    end
    
    if hash["parent"]
      p = where(:income_statement_id => id, :item_id => hash["parent"]).first
      
      if !p.nil?
        item.parent_id = p.id
      end
    end
    
    if hash["value"]
      item.value = hash["value"].to_i
    end
    
    if hash["funct"]
      item.function = hash["funct"]
    end
    
    return item
  end
  
  def self.list_values_by_date(id)
    items = find(
      :all,
      :conditions => ["income_statement_items.item_id = ? AND income_statements.classification = ?", id, IncomeStatement::HISTORY],
      :joins => :income_statement,
      :select => "income_statement_items.value, income_statement_items.income_statement_id, income_statements.start_date, income_statements.end_date",
      :order => "income_statements.start_date"
    )
    
    list = []
    items.each do |i|
      list.push([i.income_statement.start_date, i.value])
      list.push([i.income_statement.end_date, i.value])
    end
    
    return list
  end
  
  def self.new_version(old_id, new_id)
    items = where(["income_statement_id = ?", old_id])
    new_items = []
    
    items.each do |i|
      new_item = i.dup
      new_item.id = nil
      new_item.income_statement_id = new_id
      new_item.save
      new_items.push(new_item)
    end
    
    new_items.each do |ni|
      if ni.parent_id != nil
        items.each_with_index do |i, index|
          if i.id == ni.parent_id
            ni.parent_id = new_items[index].id
            break
          end
        end
        
        ni.save
      end
    end
    
  end
  
end
