class CreateMessages < ActiveRecord::Migration
  def self.up
    create_table :messages do |t|
      t.string :content, :limit => 120, :null => false
      t.boolean :read, :null => false
      t.references :user, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :messages
  end
end
