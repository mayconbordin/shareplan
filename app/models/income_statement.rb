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
  
  has_many :income_statement_results
  has_many :results, :through => :income_statement_results
  
  has_many :income_statement_accounts
  has_many :accounts, :through => :income_statement_accounts
  
  # ---- Methods ----
  def get_items
    items     = []
    new_items = []
    
    # Arrange accounts in ascendent order
    self.income_statement_accounts.each do |i|
      items[i.order] = i
    end
    
    # Do the same to the results
    self.income_statement_results.each do |i|
      items[i.order] = i
    end

    items.each do |i|
      if i != nil
        # add the accounts
        if i.instance_of? IncomeStatementAccount
          # has a group
          if i.account_group != nil
            # check if last item was a group and the same as this
            if new_items.last["type"] == TYPE_GROUP and new_items.last["id"] == i.account_group.id
              # add the account to an existing group
              new_items.last["items"].push({"id" => i.account.id, "type" => TYPE_ACCOUNT, "name" => i.account.name})
            else
              # create a new group
              new_items.push({"id" => i.account_group.id, "type" => TYPE_GROUP, "name" => i.account_group.name, "items" => []})
              
              # add the account to the group
              new_items.last["items"].push({"id" => i.account.id, "type" => TYPE_ACCOUNT, "name" => i.account.name})
            end
          else
            # add the account without a group
            new_items.push({"id" => i.account.id, "type" => TYPE_ACCOUNT, "name" => i.account.name})
          end
        # add the results  
        else
          new_items.push({"id" => i.result.id, "type" => TYPE_RESULT, "name" => i.result.name})
        end
      end
    end
    
    return new_items
  end

end
