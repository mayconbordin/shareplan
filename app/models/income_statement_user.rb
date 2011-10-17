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
  
  def self.can_create_version(id, user)
    user = where("income_statement_id = ? AND user_id = ?", id, user.id).limit(1).first
        
    if user.nil?
      return false
    elsif user.classification == CREATOR_CLASS or user.classification == EDITOR_CLASS
        return true
    else
      return false
    end
    
  end
  
  def self.can_see(id, user)
    user = where("income_statement_id = ? AND user_id = ?", id, user.id).limit(1).first
        
    if user.nil?
      return false
    else
      return true
    end
    
  end
  
  def self.new_version(old_id, new_id, owner)
    users = where(["income_statement_id = ?", old_id])

    users.each do |u|
      new_user = u.dup
      new_user.id = nil
      new_user.income_statement_id = new_id
      
      if new_user.classification == CREATOR_CLASS
        owner = new_user.dup
        owner.save
        
        new_user.classification = EDITOR_CLASS
      end
      
      new_user.save
    end
    
  end
  
end
