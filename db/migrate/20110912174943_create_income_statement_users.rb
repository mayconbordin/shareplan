class CreateIncomeStatementUsers < ActiveRecord::Migration
  def self.up
    create_table :income_statement_users do |t|
    	t.integer :income_statement_id
      t.integer :user_id
      t.string :classification

      t.timestamps
    end
  end

  def self.down
    drop_table :income_statement_users
  end
end
