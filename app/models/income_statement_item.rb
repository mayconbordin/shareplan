class IncomeStatementItem < ActiveRecord::Base
  validates_presence_of :income_statement, :item, :order
  validates_length_of :function, :maximum => 255
  validates_associated :income_statement, :item
  validates_numericality_of :order, :value, :parent_id
  
  belongs_to :income_statement
  belongs_to :item
  belongs_to :parent, :class_name => "IncomeStatementItem", :foreign_key => :parent_id
  has_many :childrens, :class_name => "IncomeStatementItem", :foreign_key => :parent_id
end
