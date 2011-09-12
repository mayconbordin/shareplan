class CreateIncomeStatementResults < ActiveRecord::Migration
  def self.up
    create_table :income_statement_results do |t|
      t.integer :income_statement_id, :null => false
      t.integer :result_id, :null => false
      t.integer :order, :null => false
      t.float :value, :null => true
      t.string :function, :limit => 150, :null => true

      t.timestamps
    end
  end

  def self.down
    drop_table :income_statement_results
  end
end
