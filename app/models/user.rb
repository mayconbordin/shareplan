class User < ActiveRecord::Base
	validates_presence_of :email, :password
	validates_length_of :name, :maximum => 80
	validates_length_of :email, :maximum => 120
	validates_length_of :password, :maximum => 64
	validates_length_of :status, :maximum => 80
	validates_length_of :key, :maximum => 45
	
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
