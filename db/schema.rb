# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20110915144247) do

  create_table "comments", :force => true do |t|
    t.text     "content",             :null => false
    t.integer  "income_statement_id", :null => false
    t.integer  "user_id",             :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "contacts", :id => false, :force => true do |t|
    t.integer  "user_id",    :null => false
    t.integer  "contact_id", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "income_statement_items", :force => true do |t|
    t.integer  "income_statement_id", :null => false
    t.integer  "item_id",             :null => false
    t.integer  "order",               :null => false
    t.float    "value"
    t.string   "function"
    t.integer  "parent_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "income_statement_users", :force => true do |t|
    t.integer  "income_statement_id",               :null => false
    t.integer  "user_id",                           :null => false
    t.string   "classification",      :limit => 45, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "income_statements", :force => true do |t|
    t.string   "title",          :limit => 100
    t.date     "start_date"
    t.date     "end_date"
    t.string   "classification", :limit => 30,  :null => false
    t.text     "comment"
    t.integer  "parent_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "items", :force => true do |t|
    t.string   "name",           :limit => 120, :null => false
    t.string   "classification", :limit => 30,  :null => false
    t.integer  "user_id"
    t.string   "item_type",      :limit => 30
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "messages", :force => true do |t|
    t.string   "content",    :limit => 120, :null => false
    t.boolean  "read",                      :null => false
    t.integer  "user_id",                   :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "name",       :limit => 80
    t.string   "email",      :limit => 120, :null => false
    t.string   "password",   :limit => 64,  :null => false
    t.string   "status",     :limit => 80
    t.string   "key",        :limit => 45
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
