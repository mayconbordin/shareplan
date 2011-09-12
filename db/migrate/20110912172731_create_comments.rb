class CreateComments < ActiveRecord::Migration
  def self.up
    create_table :comments do |t|
      t.text :content, :null => false
      t.references :income_statement, :null => false
      t.references :user, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :comments
  end
end
