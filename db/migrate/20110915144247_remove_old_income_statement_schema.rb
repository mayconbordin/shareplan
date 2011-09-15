class RemoveOldIncomeStatementSchema < ActiveRecord::Migration
  def self.up
    drop_table :results
    drop_table :account_groups
    drop_table :account_types
    drop_table :accounts
    drop_table :income_statement_results
    drop_table :income_statement_accounts
  end

  def self.down
    create_table :results do |t|
      t.string :name, :limit => 120, :null => false
      t.references :user, :null => true

      t.timestamps
    end
    
    create_table :account_groups do |t|
      t.string :name, :limit => 120, :null => false
      t.references :user, :null => true

      t.timestamps
    end
    
    create_table :account_types do |t|
      t.string :name, :limit => 20, :null => false

      t.timestamps
    end
    
    create_table :accounts do |t|
      t.string :name, :limit => 120, :null => false
      t.references :account_type, :null => false
      t.references :user, :null => true

      t.timestamps
    end
    
    create_table :income_statement_results do |t|
      t.integer :income_statement_id, :null => false
      t.integer :result_id, :null => false
      t.integer :order, :null => false
      t.float :value, :null => true
      t.string :function, :limit => 150, :null => true

      t.timestamps
    end
    
    create_table :income_statement_accounts do |t|
      t.integer :income_statement_id, :null => false
      t.integer :account_id, :null => false
      t.integer :order, :null => false
      t.float :value, :null => true
      t.string :function, :limit => 150, :null => true
      t.references :account_group, :null => true

      t.timestamps
    end
  end
end
