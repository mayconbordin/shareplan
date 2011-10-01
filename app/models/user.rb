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
    income_statements.where('(income_statements.classification = ? OR income_statements.classification = ?) AND income_statement_users.classification = ?',
                       IncomeStatement::PROJECTION, IncomeStatement::TEMP, IncomeStatementUser::CREATOR_CLASS)
                     .order(order).limit(limit).offset(offset)
  end
  
  def shared_projections(order = nil, limit = nil, offset = nil)
    income_statements.where('income_statements.classification = ? AND (income_statement_users.classification = ? OR income_statement_users.classification = ?)',
                       IncomeStatement::PROJECTION, IncomeStatementUser::EDITOR_CLASS, IncomeStatementUser::READER_CLASS)
                     .order(order).limit(limit).offset(offset)
  end
end
