class ProjectionsController < ApplicationController
	layout "frontend"
	before_filter :authenticate_user!
	
	def index
		
	end
	
	# ------ Step One ------
	def new_step_one
	  if params[:id].nil?
	    @projection = IncomeStatement.new
	  else
	    @projection = IncomeStatement.find(params[:id])
	  end
	  
	  @templates = IncomeStatement.where("classification = ?", IncomeStatement::TEMPLATE)
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
	
	# ------ Step Two ------
	def new_step_two
	  @projection = IncomeStatement.find(params[:id])
	  
	  @id = params[:id]
	end
	
	def save_step_two
	  render :text => params
	end
	
	def new_step_three
	  
	end
	
	
	
	def create
	  @projection = IncomeStatement.new(params[:projection])
	  @projection.save
	end
	
	def edit
	  @projection = IncomeStatement.find(params[:id])
	end
	
	def update
	  @projection = IncomeStatement.find(params[:id])
	  @projection.update_attributes(params[:projection])
	end
	
	def destroy
	  @projection = IncomeStatement.find(params[:id])
	  @projection.destroy
	end
	
	
	# ------ JSON Actions ------
	
	def list_item_history
	  render :json => IncomeStatementItem.list_values_by_date(params[:id])
	end
	
	def save
	  id     = params[:id]
	  items  = params[:items]
	  
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
	end
	
	def destroy
	  Comment.destroy_all(:income_statement_id => params[:id])
	  IncomeStatementItem.destroy_all(:income_statement_id => params[:id])
	  IncomeStatementUser.destroy_all(:income_statement_id => params[:id])
	  IncomeStatement.destroy_all(:parent_id => params[:id])
	  
	  if IncomeStatement.destroy(params[:id])
	    render :json => {status: "success"}
	  else
	    render :json => {status: "error"}
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
  
	def list_my_projections
    @user = current_user

	  columns = ["title", "start_date", "end_date", "", "", "created_at", "id", ""]
		prepare = prepare_data_table(params, columns)
		
		@projections = @user.my_projections(prepare["order"], prepare["limit"], prepare["offset"])

		list = Array.new

		@projections.each do |p|
			list.push([
			  p.title,
			  p.start_date,
			  p.end_date,
			  p.comments.count,
			  p.childrens.count,
			  p.created_at,
			  p.id,
			  p.classification
			])
		end

		render :json => data_table(params, @projections.count, @projections.count, list)
	end
	
  def list_shared_projections
    @user = current_user

    columns = ["title", "start_date", "end_date", "", "", "created_at", "id"]
    prepare = prepare_data_table(params, columns)
    
    @projections = @user.shared_projections(prepare["order"], prepare["limit"], prepare["offset"])

    list = Array.new

    @projections.each do |p|
      list.push([p.title, p.start_date, p.end_date, @user.name, p.childrens.count, p.created_at, p.id])
    end

    render :json => data_table(params, @projections.count, @projections.count, list)
  end
  
end
