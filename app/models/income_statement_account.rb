class IncomeStatementAccount < ActiveRecord::Base
  belongs_to :account_group
  belongs_to :income_statement
	belongs_to :account
end
