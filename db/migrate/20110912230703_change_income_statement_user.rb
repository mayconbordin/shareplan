class ChangeIncomeStatementUser < ActiveRecord::Migration
  def self.up
  	change_column :income_statement_users, :income_statement_id, :integer, :null => false
  	change_column :income_statement_users, :user_id, :integer, :null => false
  	change_column :income_statement_users, :classification, :string, :null => false
  end

  def self.down
  	change_column :income_statement_users, :income_statement_id, :integer, :null => true
  	change_column :income_statement_users, :user_id, :integer, :null => true
  	change_column :income_statement_users, :classification, :string, :null => true
  end
end
