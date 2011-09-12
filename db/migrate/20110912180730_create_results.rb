class CreateResults < ActiveRecord::Migration
  def self.up
    create_table :results do |t|
      t.string :name, :limit => 120, :null => false
      t.references :user, :null => true

      t.timestamps
    end
  end

  def self.down
    drop_table :results
  end
end
