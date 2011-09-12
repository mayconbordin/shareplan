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

ActiveRecord::Schema.define(:version => 20110912183940) do

  create_table "account_groups", :force => true do |t|
    t.string   "name",       :limit => 120, :null => false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "account_types", :force => true do |t|
    t.string   "name",       :limit => 20, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "accounts", :force => true do |t|
    t.string   "name",            :limit => 120, :null => false
    t.integer  "account_type_id",                :null => false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

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

  create_table "income_statement_accounts", :force => true do |t|
    t.integer  "income_statement_id",                :null => false
    t.integer  "account_id",                         :null => false
    t.integer  "order",                              :null => false
    t.float    "value"
    t.string   "function",            :limit => 150
    t.integer  "account_group_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "income_statement_results", :force => true do |t|
    t.integer  "income_statement_id",                :null => false
    t.integer  "result_id",                          :null => false
    t.integer  "order",                              :null => false
    t.float    "value"
    t.string   "function",            :limit => 150
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "income_statement_users", :force => true do |t|
    t.integer  "income_statement_id"
    t.integer  "user_id"
    t.string   "classification"
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

  create_table "messages", :force => true do |t|
    t.string   "content",    :limit => 120, :null => false
    t.boolean  "read",                      :null => false
    t.integer  "user_id",                   :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "results", :force => true do |t|
    t.string   "name",       :limit => 120, :null => false
    t.integer  "user_id"
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
