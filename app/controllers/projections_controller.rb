class ProjectionsController < ApplicationController
	layout "frontend"
	
	def index
		
	end
	
	# ------ Step One ------
	def new_step_one
	  if params[:id].nil?
	    @projection = IncomeStatement.new
	  else
	    @projection = IncomeStatement.find(params[:id])
	  end
	end
	
	def save_step_one
	  @projection = IncomeStatement.new(params[:projection])
	  @projection.classification = IncomeStatement::TEMP
	  
    if @projection.save
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
	
	def add_item
	  if params[:id]
	    @projection = IncomeStatement.find(params[:id])
	    
	    render :text => params
	  end
	  
	  #item = IncomeStatementItem.new(params[:item])
	  
	  #@projection.income_statement_items.push(item)
	  #@projection.save
	end
	
	def remove_item
	  
	end
	
	def save_step_two
	  render :text => params
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
	
	def show
    @projection = IncomeStatement.find(params[:id])
            
    hash = {
      "id"    => @projection.id,
      "title" => @projection.title,
      "items" => @projection.get_hash_items
    }
        
    render :json => hash
  end
  
	def list
		# Columns
		columns = ["title", "start_date", "end_date", "", "created_at", "id"]
				
		prepare = prepare_data_table(params, columns)

		@projections = IncomeStatement.where('classification = ?', IncomeStatement::PROJECTION)
		                              .order(prepare["order"])
		                              .limit(prepare["limit"])
		                              .offset(prepare["offset"])
		list = Array.new

		@projections.each do |p|
		  #versões = p.childrens.count
			list.push([p.title, p.start_date, p.end_date, p.comments.count, p.created_at, p.id])
		end

		json = data_table(params, @projections.count, @projections.count, list)
		render :json => json
	end
end
