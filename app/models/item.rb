class Item < ActiveRecord::Base
  CLASS_ACCOUNT   = "account"
  CLASS_RESULT    = "result"
  CLASS_GROUP     = "group"
  
  TYPE_DEBT       = "debt"
  TYPE_CREDIT     = "credit"
  
  belongs_to :user
end
