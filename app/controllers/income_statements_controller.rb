class IncomeStatementsController < ApplicationController
  before_filter :authenticate_user!
  
  def list_item_history
    render :json => IncomeStatementItem.list_values_by_date(params[:id])
  end
  
  def save
    @user  = current_user
    id     = params[:id]
    items  = params[:items]
    type   = params[:type]
    
    if IncomeStatementUser.can_edit(id, @user)
      inc_stmt = IncomeStatement.find(id)
      if (inc_stmt.classification != type)
        inc_stmt.classification = type
        inc_stmt.save
      end
      
      if items
        items.each do |i|
          if i[1]["type"] == "delete"
            @item = IncomeStatementItem.where(:income_statement_id => id, :item_id => i[1]["id"]).first
            IncomeStatementItem.destroy_all(:parent_id => @item.id)
            @item.destroy
          elsif i[1]["type"] == "update" or i[1]["type"] == "create"
            @item = IncomeStatementItem.from_hash(id, i[1])
            @item.save
          end
        end
        
        render :json => params
      else
        render :json => {status: "empty"}
      end
    else
      render :json => {status: "no_rights"}
    end
  end
  
  def destroy
    @user  = current_user
    id     = params[:id]
    
    if IncomeStatementUser.can_edit(id, @user)
      Comment.destroy_all(:income_statement_id => id)
      IncomeStatementItem.destroy_all(:income_statement_id => id)
      IncomeStatementUser.destroy_all(:income_statement_id => id)
      IncomeStatement.destroy_all(:parent_id => id)
      
      if IncomeStatement.destroy(id)
        render :json => {status: "success"}
      else
        render :json => {status: "error"}
      end
    else
      render :json => {status: "no_rights"}
    end
  end
  
  def show
    @user = current_user
    @projection = IncomeStatement.find_by_id_and_user(params[:id], @user)
            
    if @projection.nil?
      render :json => {status: "error"}
    else
      render :json => @projection.to_hash(@user)
    end
  end
end
