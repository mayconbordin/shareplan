class ProjectionsController < ApplicationController
	layout "frontend"
	before_filter :authenticate_user!
	
	def index
		
	end
	
	def edit
	  if params[:id].nil?
	    redirect_to :action => "error", :type => "not_found"
	  else
	    @projection = IncomeStatement.find(params[:id])
	    
	    @user = current_user
      @can_edit = IncomeStatementUser.can_edit(params[:id], @user)
	  end
	end
	
	def error
	  @type = params[:type]
	end
	
	def new_step_one
	  if params[:id].nil?
	    @projection = IncomeStatement.new
	  else
	    @projection = IncomeStatement.find(params[:id])
	  end
	  
	  @templates = IncomeStatement.where("classification = ?", IncomeStatement::TEMPLATE)
	  @id = params[:id]
	end
	
  def new_step_two
    if params[:id].nil?
      redirect_to :action => "error", :type => "not_found"
    else
      @projection = IncomeStatement.find(params[:id])
      @id = params[:id]
    end
  end
  
  def new_step_three
    if params[:id].nil?
      redirect_to :action => "error", :type => "not_found"
    else
      @projection = IncomeStatement.find(params[:id])
      @id = params[:id]
      @status = params[:status]
    end
  end
	
	def save_step_one
	  @projection = IncomeStatement.new(params[:projection])
	  @projection.classification = IncomeStatement::TEMP
	  
    if @projection.save
      IncomeStatementUser.new(
        :income_statement => @projection,
        :user             => current_user,
        :classification   => IncomeStatementUser::CREATOR_CLASS
      ).save
      
      redirect_to :action => :new_step_two, :id => @projection.id
    else
      render :action => :new_step_one
    end
	end
	
	# ---- JSON Actions ----
	def list_my_projections
    @user = current_user

	  columns = ["title", "start_date", "end_date", "", "", "created_at", "id", ""]
		prepare = prepare_data_table(params, columns)
		
		count = @user.count_my_projections
		@projections = @user.my_projections(prepare["order"], prepare["limit"], prepare["offset"])

		list = Array.new

		@projections.each do |p|
			list.push([
			  p.title,
			  p.start_date.strftime("%d/%m/%Y"),
			  p.end_date.strftime("%d/%m/%Y"),
			  p.comments_count,
			  p.childrens_count,
			  p.created_at.strftime("%d/%m/%Y"),
			  p.id,
			  p.classification
			])
		end

		render :json => data_table(params, count, count, list)
	end
	
  def list_shared_projections
    @user = current_user

    columns = ["title", "start_date", "end_date", "", "", "created_at", "id"]
    prepare = prepare_data_table(params, columns)
    
    count = @user.count_shared_projections
    @projections = @user.shared_projections(prepare["order"], prepare["limit"], prepare["offset"])

    list = Array.new

    @projections.each do |p|
      list.push([
        p.title,
        p.start_date.strftime("%d/%m/%Y"),
        p.end_date.strftime("%d/%m/%Y"),
        @user.name,
        p.childrens_count,
        p.created_at.strftime("%d/%m/%Y"),
        p.id
      ])
    end

    render :json => data_table(params, count, count, list)
  end
  
end
