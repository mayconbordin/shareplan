class DashboardController < ApplicationController
  before_filter :authenticate_user!
  layout "frontend"
  
  def index
    
  end
end
