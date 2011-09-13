class ProjectionsController < ApplicationController
	layout "frontend"
	
	def index
		@projections = IncomeStatement.all
		#render :json => @projections
	end
end
