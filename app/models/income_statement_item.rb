class IncomeStatementItem < ActiveRecord::Base
  belongs_to :income_statement
  belongs_to :item
  belongs_to :parent, :class_name => "IncomeStatementItem", :foreign_key => :parent_id
  has_many :childrens, :class_name => "IncomeStatementItem", :foreign_key => :parent_id
end
