class ItemsController < ApplicationController
  def list(user = nil)
    id = user == nil ? nil : user.id
    @items = Item.where("user_id IS NULL OR user_id = ?", id).order('name')
    
    list = []
    
    @items.each do |i|
      list.push(i.to_hash)
    end
    
    render :json => list
  end
end
