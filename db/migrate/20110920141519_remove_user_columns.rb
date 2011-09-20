class RemoveUserColumns < ActiveRecord::Migration
  def self.up
    remove_column :users, :password
    remove_column :users, :key
  end

  def self.down
    add_column :users, :password, :string, :null => false, :limit => 64
    add_column :users, :key, :string, :null => true, :limit => 45
  end
end
