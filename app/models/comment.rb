class Comment < ActiveRecord::Base
  belongs_to :income_statement
  belongs_to :user
end
