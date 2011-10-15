class AddUrlMessage < ActiveRecord::Migration
  def self.up
    add_column :messages, :url, :string
  end

  def self.down
    remove_column :messages, :url
  end
end
