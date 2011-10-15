class CommentsController < ApplicationController
  before_filter :authenticate_user!
  
  def save
    @user = current_user
    id    = params[:id]
    
    if IncomeStatementUser.can_see(id, @user)
      comment = Comment.new(params[:comment])
      comment.income_statement_id = id
      comment.user_id = @user.id
      
      if comment.save
        render :json => {
          status: "success",
          comment: {
            id: comment.id,
            content: comment.content,
            author: @user.name,
            created_at: comment.created_at
          }
        }
      else
        render :json => {status: "error"}
      end
    else
      render :json => {status: "no_rights"}
    end
  end
  
  def list
    if params[:id].nil?
      render :json => {status: "error"}
    else
      comments = Comment.find_by_income_statement(params[:id])
      
      data = []
      comments.each do |c|
        data.push({id: c.id, content: c.content, author: c.name, created_at: c.created_at})
      end
      
      render :json => data
    end
  end

end
