class ApplicationController < ActionController::Base
  layout :layout_by_resource
	helper_method :data_table, :prepare_data_table
  protect_from_forgery
  
  def prepare_data_table(params, columns)
  	# Pagination
		if params["iDisplayStart"].nil? and params["iDisplayLength"] == '-1'
			offset = 0
			limit = 15
		else
			offset = params["iDisplayStart"].to_i
			limit = params["iDisplayLength"].to_i
		end
		
		# Ordering
		if params["iSortCol_0"].nil? and params["sSortDir_0"].nil?
			order = "title ASC"
		else
			order = columns[ params["iSortCol_0"].to_i ] + " " + params["sSortDir_0"]
		end
		
		return {"offset" => offset, "limit" => limit, "order" => order}
  end
  
  def data_table(params, total, display, records)
  	if records.nil? || !records.kind_of?(Array)
  		return ""
  	end
  
		json = params["callback"].to_s +
			'({"sEcho":' + params["sEcho"].to_s + ',
			"iTotalRecords":"' + total.to_s + '",
			"iTotalDisplayRecords":"' + display.to_s + '",
			"aaData": ['
			  
		records.each_with_index do |record, i|
		  json += '['
		  
		    record.each_with_index do |column, j|
		      json += (j === (record.length-1)) ? '"' + column.to_s + '"' : '"' + column.to_s + '",'
		    end
		  
		  json += (i == (records.length-1)) ? ']' : '],'
		end
			  
		json += ']});'
		
		return json
	end
	
	
	protected

  def layout_by_resource
    if devise_controller?
      "login"
    else
      "application"
    end
  end
end
