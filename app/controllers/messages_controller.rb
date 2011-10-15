class MessagesController < ApplicationController
  before_filter :authenticate_user!
  layout "frontend"
  
  def set_as_read
    if params[:id].nil?
      render :json => {status: "error"}
    else
      message = Message.find(params[:id])
      message.read = true
      if message.save
        render :json => {status: "success"}
      else
        render :json => {status: "error"}
      end
    end
  end
  
end
