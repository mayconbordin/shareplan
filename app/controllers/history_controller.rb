class HistoryController < ApplicationController
  layout "frontend"
  
  def new
    @incomeStatement = IncomeStatement.new
  end
  
  def show
    
  end
  
  def list
    # Columns
    columns = ["title", "start_date", "end_date", "created_at", "id"]
        
    prepare = prepare_data_table(params, columns)

    @projections = IncomeStatement.where('classification = ?', IncomeStatement::HISTORY)
                                  .order(prepare["order"])
                                  .limit(prepare["limit"])
                                  .offset(prepare["offset"])
    list = Array.new

    @projections.each do |p|
      list.push([p.title, p.start_date, p.end_date, p.created_at, p.id])
    end

    json = data_table(params, @projections.count, @projections.count, list)
    render :json => json
  end
end
