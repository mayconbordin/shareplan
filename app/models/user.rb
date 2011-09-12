class User < ActiveRecord::Base
	has_many :messages
	
	has_and_belongs_to_many(:contacts,
		:class_name => "User",
		:join_table => :contacts,
		:foreign_key => :user_id,
		:association_foreign_key => :contact_id)
	
	has_many :income_statement_users
	has_many :income_statements, :through => :income_statement_users
	
	has_many :results
	has_many :account_groups
	has_many :account
end
