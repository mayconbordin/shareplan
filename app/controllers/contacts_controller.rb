class ContactsController < ApplicationController
  layout "frontend"
  before_filter :authenticate_user!
  
  def index
    # pegar id na session e carregar os contatos
    # @contacts = User.find(id??).contacts
  end
  
  def list
    contacts = current_user.contacts
    list = []
    
    contacts.each do |c|
      list.push({value: c.email, label: c.name})
    end
    
    render :json => list
  end
end
