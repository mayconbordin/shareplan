class AccountType < ActiveRecord::Base
	validates_presence_of :name
	validates_length_of :name, :maximum => 120
	
	has_many :accounts
end
