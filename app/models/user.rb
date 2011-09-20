class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
	validates_presence_of :email, :password
	validates_length_of :name, :maximum => 80
	validates_length_of :email, :maximum => 120
	validates_length_of :status, :maximum => 80
	
	has_many :messages
	
	has_and_belongs_to_many(:contacts,
		:class_name => "User",
		:join_table => :contacts,
		:foreign_key => :user_id,
		:association_foreign_key => :contact_id)
	
	has_many :income_statement_users
	has_many :income_statements, :through => :income_statement_users
	
	has_many :items
end
