class CreateAccountTypes < ActiveRecord::Migration
  def self.up
    create_table :account_types do |t|
      t.string :name, :limit => 20, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :account_types
  end
end
