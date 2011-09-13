class IncomeStatement < ActiveRecord::Base
  # ---- Constants ----
  PROJECTION = "projection"
  HISTORY = "history"
  TEMPLATE = "template"
  
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
end
