class Account < ActiveRecord::Base
  belongs_to :account_type
  belongs_to :user
  
  has_many :income_statement_accounts
  has_many :income_statements, :through => :income_statement_accounts
end
