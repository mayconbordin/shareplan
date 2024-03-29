class Item < ActiveRecord::Base
  CLASS_ACCOUNT   = "account"
  CLASS_RESULT    = "result"
  CLASS_GROUP     = "group"
  
  TYPE_DEBT       = "debt"
  TYPE_CREDIT     = "credit"
  
  validates_presence_of :name, :classification
  validates_length_of :name, :maximum => 120
  validates_length_of :classification, :item_type, :maximum => 30
  validates_associated :user
    
  belongs_to :user
  
  def to_hash
    {
      "id"    => id,
      "type"  => classification,
      "name"  => name
    }
  end
  
  def self.list_by_user(user)
    where("user_id IS NULL OR user_id = ?", user.id).order('name')
  end
end
