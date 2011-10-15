class DashboardController < ApplicationController
  before_filter :authenticate_user!
  layout "frontend"
  
  def index
    @user = current_user
    
    @projections = @user.income_statements.childrens_count().comments_count()
                        .has_my_projections().order("created_at desc").limit(10)
                        
    @messages = @user.messages.where("messages.read = ?", false).order("created_at desc").limit(4)
    
    @items = Item.list_by_user(@user)
  end
end
