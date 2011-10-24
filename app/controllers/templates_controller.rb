class TemplatesController < ApplicationController
  layout "frontend"
  before_filter :authenticate_user!
  
  def index
    @status = params[:status]
  end
  
  def error
    @type = params[:type]
  end
  
  def edit
    if params[:id].nil?
      redirect_to :action => "error", :type => "not_found"
    else
      @template = IncomeStatement.find(params[:id])
      
      @user = current_user
      @can_edit = IncomeStatementUser.can_edit(params[:id], @user)
    end
  end
  
  def new_step_one
    if params[:id].nil?
      @template = IncomeStatement.new
    else
      @template = IncomeStatement.find_by_id(params[:id])
    end
    
    @id = params[:id]
  end
  
  def new_step_two
    if params[:id].nil?
      redirect_to :action => "error", :type => "not_found"
    else
      @templates = IncomeStatement.find(params[:id])
      @id = params[:id]
    end
  end
  
  def save_step_one
    @template = IncomeStatement.new(params[:template])
    @template.classification = IncomeStatement::TEMPLATE
    
    if @template.save
      IncomeStatementUser.new(
        :income_statement => @template,
        :user             => current_user,
        :classification   => IncomeStatementUser::CREATOR_CLASS
      ).save
      
      redirect_to :action => :new_step_two, :id => @template.id
    else
      render :action => :new_step_one
    end
  end
  
  def list
    @user = current_user

    columns = ["title", "created_at", "id"]
    prepare = prepare_data_table(params, columns)
    
    count = @user.count_templates
    @templates = @user.templates(prepare["order"], prepare["limit"], prepare["offset"])

    list = Array.new

    @templates.each do |t|
      list.push([
        t.title,
        t.created_at.strftime("%d/%m/%Y"),
        t.id
      ])
    end

    render :json => data_table(params, count, count, list)
  end
end
