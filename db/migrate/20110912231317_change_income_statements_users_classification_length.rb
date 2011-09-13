class ChangeIncomeStatementsUsersClassificationLength < ActiveRecord::Migration
  def self.up
  	change_column :income_statement_users, :classification, :string, :limit => 45, :null => false
  end

  def self.down
  	change_column :income_statement_users, :classification, :string, :limit => 255, :null => false
  end
end
