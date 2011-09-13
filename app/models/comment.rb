class Comment < ActiveRecord::Base
	validates_presence_of :content, :income_statement_id, :user_id
	validates_associated :income_statement, :user

  belongs_to :income_statement
  belongs_to :user
end
