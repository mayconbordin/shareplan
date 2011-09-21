class ChangeUsersSaltPassword < ActiveRecord::Migration
  def self.up
    change_column :users, :password_salt, :string, :null => true
  end

  def self.down
    change_column :users, :password_salt, :string, :null => false
  end
end
