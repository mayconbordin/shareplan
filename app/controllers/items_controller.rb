class ItemsController < ApplicationController
  layout "frontend"
  before_filter :authenticate_user!
  
  def create
    @user = current_user
    @item = Item.new(params[:item])
    @item.user = @user
    
    if @item.save
      render :json => @item.to_hash
    else
      render :json => {error: true}
    end
  end
  
  def list
    @user = current_user
    id = @user.id
    @items = Item.list_by_user(@user)
    
    list = []
    
    @items.each do |i|
      list.push(i.to_hash)
    end
    
    render :json => list
  end
end
