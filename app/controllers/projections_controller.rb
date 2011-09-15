class ProjectionsController < ApplicationController
	layout "frontend"
	
	def index
		
	end
	
	def new_step_one
	  
	end
	
	def new
	  
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
