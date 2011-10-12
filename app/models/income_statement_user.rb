class IncomeStatementUser < ActiveRecord::Base
  CREATOR_CLASS   = "creator"
  EDITOR_CLASS    = "editor"
  READER_CLASS    = "reader"
  
  
	validates_presence_of :income_statement_id, :user_id, :classification
	validates_length_of :classification, :maximum => 45
	validates_associated :income_statement, :user
	
	belongs_to :income_statement
	belongs_to :user
	
	def self.can_edit(id, user)
    user = where("income_statement_id = ? AND user_id = ?", id, user.id).limit(1).first
        
    if user.nil?
      return false
    elsif user.classification == CREATOR_CLASS
        return true
    else
      return false
    end
    
  end
  
end
