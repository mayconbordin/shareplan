class CreateIncomeStatements < ActiveRecord::Migration
  def self.up
    create_table :income_statements do |t|
      t.string :title, :limit => 100, :null => true
      t.date :start_date, :null => true
      t.date :end_date, :null => true
      t.string :type, :limit => 30, :null => false
      t.text :comment, :null => true
      t.integer :parent_id

      t.timestamps
    end
  end

  def self.down
    drop_table :income_statements
  end
end
