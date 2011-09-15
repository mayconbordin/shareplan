class CreateItems < ActiveRecord::Migration
  def self.up
    create_table :items do |t|
      t.string :name, :limit => 120, :null => false
      t.string :classification, :limit => 30, :null => false
      t.references :user, :null => true
      t.string :item_type, :limit => 30, :null => true

      t.timestamps
    end
  end

  def self.down
    drop_table :items
  end
end
