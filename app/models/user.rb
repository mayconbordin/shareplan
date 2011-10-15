class User < ActiveRecord::Base
  # ---- Devise ----
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  
  # ---- Validations ----
	validates_presence_of :email
	validates_length_of :name, :maximum => 80
	validates_length_of :email, :maximum => 120
	validates_length_of :status, :maximum => 80
	
	# ---- Relationships ----
	has_many :items
	has_many :messages
	has_many :income_statement_users
  has_many :income_statements, :through => :income_statement_users
	has_and_belongs_to_many(:contacts,
		:class_name => "User",
		:join_table => :contacts,
		:foreign_key => :user_id,
		:association_foreign_key => :contact_id)
		
  # ---- Methods ----
  def my_projections(order = nil, limit = nil, offset = nil)
    income_statements.childrens_count()
                     .comments_count()
                     .has_my_projections()
                     .order(order).limit(limit).offset(offset)
  end
  
  def shared_projections(order = nil, limit = nil, offset = nil)
    income_statements.childrens_count()
                     .has_shared_projections()
                     .order(order).limit(limit).offset(offset)
  end
  
  def history(order = nil, limit = nil, offset = nil)
    income_statements.has_history().order(order).limit(limit).offset(offset)
  end
  
  def count_my_projections
    income_statements.has_my_projections().count()
  end
  
  def count_shared_projections
    income_statements.has_shared_projections().count()
  end
  
  def count_history
    income_statements.has_history().count()
  end
end
