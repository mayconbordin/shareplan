class IncomeStatement < ActiveRecord::Base
  # ---- Constants ----
  PROJECTION    = "projection"
  HISTORY       = "history"
  TEMPLATE      = "template"
  TEMP          = "temp"
    
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
    income_statement_items.sort! { |a,b| a.order <=> b.order }
    
    # Get the parent items and its childrens
    income_statement_items.each do |i|
      if i.parent_id == nil
        items.push(i.to_hash)
        
        i.childrens.each do |c|
        	items.last["items"].push(c.to_hash)
        end
      end
    end
    
    return items
  end

end
