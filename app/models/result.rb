class Result < ActiveRecord::Base
	validates_presence_of :name
	validates_length_of :name, :maximum => 120
	validates_associated :user	
	
  belongs_to :user
  
  has_many :income_statement_results
  has_many :income_statements, :through => :income_statement_results
end
