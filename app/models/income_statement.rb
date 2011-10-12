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
  
  # ---- Scopes ----
  scope :has_my_projections, {
    :conditions => ['(income_statements.classification = ? OR income_statements.classification = ?) AND income_statement_users.classification = ?',
                   PROJECTION, TEMP, IncomeStatementUser::CREATOR_CLASS]
  }
  
  scope :has_shared_projections, {
    :conditions => ['income_statements.classification = ? AND (income_statement_users.classification = ? OR income_statement_users.classification = ?)',
                   PROJECTION, IncomeStatementUser::EDITOR_CLASS, IncomeStatementUser::READER_CLASS]
  }
                       
  scope :childrens_count, {
    :select => "(SELECT COUNT(*) FROM income_statements inc_stmt WHERE inc_stmt.parent_id = income_statements.id) AS childrens_count"
  }
  
  scope :comments_count, {
    :select => "(SELECT COUNT(*) FROM comments WHERE comments.income_statement_id = income_statements.id) AS comments_count"
  }
   
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
  
  def to_hash(user = nil)
    hash = {
      "id"          => id,
      "title"       => title,
      "start_date"  => start_date,
      "end_date"    => end_date,
      "type"        => classification,
      "items"       => get_hash_items
    }
    
    if !user.nil?
      hash["role"] = get_user(user).classification
    end
    
    return hash
  end
  
  def get_user(user)
    income_statement_users.each do |u|
      if u.user_id == user.id
        return u
      end
    end
    
    return nil
  end
  
  def self.find_by_id_and_user(id, user)
    self.joins(:income_statement_users)
        .where("income_statements.id = ? AND income_statement_users.user_id = ?", id, user.id)
        .first
  end

end
