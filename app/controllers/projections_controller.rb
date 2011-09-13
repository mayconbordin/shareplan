class ProjectionsController < ApplicationController
	layout "frontend"
	
	def index
		@projections = IncomeStatement.all
		#render :json => @projections
	end
	
	def list
		render :json => IncomeStatement.all
	end
end
