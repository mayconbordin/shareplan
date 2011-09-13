class IncomeStatementUser < ActiveRecord::Base
	validates_presence_of :income_statement_id, :user_id, :classification
	validates_length_of :classification, :maximum => 45
	validates_associated :income_statement, :user
	
	belongs_to :income_statement
	belongs_to :user
end
