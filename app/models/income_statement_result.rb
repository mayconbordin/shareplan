class IncomeStatementResult < ActiveRecord::Base
	validates_presence_of :income_statement_id, :result_id, :order
	validates_length_of :function, :maximum => 150
	validates_associated :result, :income_statement	
	
	belongs_to :income_statement
	belongs_to :result
end
