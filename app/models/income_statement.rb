class IncomeStatement < ActiveRecord::Base
  # ---- Constants ----
  PROJECTION    = "projection"
  HISTORY       = "history"
  TEMPLATE      = "template"
  TYPE_ACCOUNT  = "account"
  TYPE_RESULT   = "result"
  TYPE_GROUP    = "group"
  
  # ---- Validations ----
	validates_presence_of :classification
	validates_length_of :title, :maximum => 100
	
	# ---- Relationships ----
  belongs_to :parent, :class_name => "IncomeStatement", :foreign_key => :parent_id
  has_many :childrens, :class_name => "IncomeStatement", :foreign_key => :parent_id
  has_many :comments
  
  has_many :income_statement_users
  has_many :users, :through => :income_statement_users
  
  has_many :income_statement_items
  has_many :items, :through => :income_statement_items
  
  # ---- Methods ----

  def get_hash_items
    items = []
    
    # Put items in order
    self.income_statement_items.sort! { |a,b| a.order <=> b.order }
    
    # Get the parent items and its childrens
    self.income_statement_items.each do |i|
      if i.parent_id == nil
        items.push({"id" => i.item.id, "type" => i.item.classification, "name" => i.item.name, "items" => []})
        
        i.childrens.each do |c|
          items.last["items"].push({"id" => c.item.id, "type" => c.item.classification, "name" => c.item.name})
        end
      end
    end
    
    return items
  end

end
