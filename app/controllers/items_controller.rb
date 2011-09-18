class ItemsController < ApplicationController
  def list
    @items = Item.order('classification')
    
    list = []
    
    @items.each do |i|
      list.push(i.to_hash)
    end
    
    render :json => list
  end
end
