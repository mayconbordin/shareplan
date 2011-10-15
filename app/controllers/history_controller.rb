class HistoryController < ApplicationController
  before_filter :authenticate_user!
  layout "frontend"
  
  def index
    @status = params[:status]
  end
  
  def error
    @type = params[:type]
  end
  
  def new_step_one
    if params[:id].nil?
      @history = IncomeStatement.new
    else
      @history = IncomeStatement.find(params[:id])
    end
    
    @templates = IncomeStatement.where("classification = ?", IncomeStatement::TEMPLATE)
    @id = params[:id]
  end
  
  def new_step_two
    if params[:id].nil?
      redirect_to :action => "error", :type => "not_found"
    else
      @history = IncomeStatement.find(params[:id])
      @id = params[:id]
    end
  end
  
  def save_step_one
    @history = IncomeStatement.new(params[:history])
    @history.classification = IncomeStatement::HISTORY
    
    if @history.save
      IncomeStatementUser.new(
        :income_statement => @history,
        :user             => current_user,
        :classification   => IncomeStatementUser::CREATOR_CLASS
      ).save
      
      redirect_to :action => :new_step_two, :id => @history.id
    else
      render :action => :new_step_one
    end
  end
  
  def edit
    if params[:id].nil?
      redirect_to :action => "error", :type => "not_found"
    else
      @history = IncomeStatement.find(params[:id])
      
      @user = current_user
      @can_edit = IncomeStatementUser.can_edit(params[:id], @user)
    end
  end
  
  def list
    @user = current_user
    
    columns = ["title", "start_date", "end_date", "created_at", "id"]
    prepare = prepare_data_table(params, columns)

    count = @user.count_history
    @history = @user.history(prepare["order"], prepare["limit"], prepare["offset"])
    
    list = Array.new

    @history.each do |h|
      list.push([
        h.title,
        h.start_date.strftime("%d/%m/%Y"),
        h.end_date.strftime("%d/%m/%Y"),
        h.created_at.strftime("%d/%m/%Y"),
        h.id
      ])
    end

    render :json => data_table(params, count, count, list)
  end
end
