class IncomeStatementResult < ActiveRecord::Base
	belongs_to :income_statement
	belongs_to :result
end
