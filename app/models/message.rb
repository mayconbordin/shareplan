class Message < ActiveRecord::Base
	validates_presence_of :content, :user_id
	validates_length_of :content, :maximum => 120
	validates_associated :user
	
  belongs_to :user
end
