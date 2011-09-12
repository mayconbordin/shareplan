class Result < ActiveRecord::Base
  belongs_to :user
  
  has_many :income_statement_results
  has_many :income_statements, :through => :income_statement_results
end
