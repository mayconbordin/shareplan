class Comment < ActiveRecord::Base
	validates_presence_of :content, :income_statement_id, :user_id
	validates_associated :income_statement, :user

  belongs_to :income_statement
  belongs_to :user
  
  def self.find_by_income_statement(id)
    find(
      :all,
      :conditions => {:income_statement_id => id},
      :joins => :user,
      :select => "comments.id, comments.content, comments.created_at, users.name",
      :order => "comments.created_at desc"
    )
  end
  
  def self.find_by_inc_stmt_and_newer_than(id, date)
    find(
      :all,
      :conditions => ["comments.income_statement_id = ? AND comments.created_at > ?", id, date],
      :joins => :user,
      :select => "comments.id, comments.content, comments.created_at, users.name",
      :order => "comments.created_at desc"
    )
  end
  
end
