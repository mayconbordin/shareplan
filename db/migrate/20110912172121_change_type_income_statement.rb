class ChangeTypeIncomeStatement < ActiveRecord::Migration
  def self.up
  	rename_column :income_statements, :type, :classification
  end

  def self.down
  	rename_column :income_statements, :classification, :type
  end
end
