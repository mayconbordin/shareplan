class AccountGroup < ActiveRecord::Base
	validates_presence_of :name
	validates_length_of :name, :maximum => 120
	validates_associated :user
	
  belongs_to :user
  has_many :income_statement_accounts
end
