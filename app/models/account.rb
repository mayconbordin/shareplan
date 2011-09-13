class Account < ActiveRecord::Base
	validates_presence_of :name, :account_type_id
	validates_length_of :name, :maximum => 120
	validates_associated :account_type, :user
	
  belongs_to :account_type
  belongs_to :user
  
  has_many :income_statement_accounts
  has_many :income_statements, :through => :income_statement_accounts
end
