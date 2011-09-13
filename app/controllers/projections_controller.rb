class ProjectionsController < ApplicationController
	layout "frontend"
	
	def index
		
	end
	
	def list
		# Columns
		columns = ["title", "start_date", "end_date", "comment", "created_at"]
		
		prepare = prepare_data_table(params, columns)

		@projections = IncomeStatement.order(prepare["order"]).limit(prepare["limit"]).offset(prepare["offset"])
		list = Array.new

		@projections.each do |p|
			list.push([p.title, p.start_date, p.end_date, p.comment, p.created_at])
		end

		json = data_table(params, 57, 57, list)
		
		render :json => json
	end
end
