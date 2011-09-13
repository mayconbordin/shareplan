class IncomeStatementAccount < ActiveRecord::Base
	validates_presence_of :income_statement_id, :account_id, :order
	validates_length_of :function, :maximum => 150
	validates_associated :account_group, :account, :income_statement
	
  belongs_to :account_group
  belongs_to :income_statement
	belongs_to :account
end
