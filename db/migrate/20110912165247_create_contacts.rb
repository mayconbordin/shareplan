class CreateContacts < ActiveRecord::Migration
  def self.up
    create_table :contacts, :id => false do |t|
      t.integer :user_id, :null => false
      t.integer :contact_id, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :contacts
  end
end
