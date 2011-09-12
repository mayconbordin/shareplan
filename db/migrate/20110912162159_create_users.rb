class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.string :name, :limit => 80, :null => true
      t.string :email, :limit => 120, :null => false
      t.string :password, :limit => 64, :null => false
      t.string :status, :limit => 80, :null => true
      t.string :key, :limit => 45, :null => true

      t.timestamps
    end
  end

  def self.down
    drop_table :users
  end
end
