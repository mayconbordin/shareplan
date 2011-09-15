class CreateIncomeStatementItems < ActiveRecord::Migration
  def self.up
    create_table :income_statement_items do |t|
      t.references :income_statement, :null => false
      t.references :item, :null => false
      t.integer :order, :null => false
      t.float :value, :null => true
      t.string :function, :null => true
      t.integer :parent_id, :null => true

      t.timestamps
    end
  end

  def self.down
    drop_table :income_statement_items
  end
end
