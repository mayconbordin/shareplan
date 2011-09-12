class CreateAccounts < ActiveRecord::Migration
  def self.up
    create_table :accounts do |t|
      t.string :name, :limit => 120, :null => false
      t.references :account_type, :null => false
      t.references :user, :null => true

      t.timestamps
    end
  end

  def self.down
    drop_table :accounts
  end
end
