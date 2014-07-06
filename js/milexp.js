var SETTINGS = {
	minYear: 2001,
	maxYear: 2012,
	defaultYear: 2001,
	defaultMinValue: 100000
}

var FILTERS = {
	types: [],
	minValue: SETTINGS.defaultMinValue,
	year: SETTINGS.defaultYear
};

$(function() {
	$('#yearsSlider').slider({
		min: SETTINGS.minYear,
		max: SETTINGS.maxYear,
		value: SETTINGS.defaultYear
	}).on('slide', function(ev) {
		$('#currYear').val(ev.value);
		setYear(ev.value);
	}).on('slideStop', function(ev) {
		updateDataTable();
	});
	
	$('#currYear').val(SETTINGS.defaultYear).on('change keyup', function() {
		$('#yearsSlider').slider('setValue', $(this).val());
		setYear($(this).val());
		
		updateDataTable();
	});
	
	/*$('#filterType').multiselect({
		buttonClass: 'btn btn-link', // btn-primary
		includeSelectAllOption: true,
		includeSelectAllDivider: true,
		selectedClass: null,
		numberDisplayed: 2,
		onChange: function(element, checked) {
			//updatedFilters();
			return false;
		}
	});*/
	
	/*$('#filterMinValue').val(SETTINGS.defaultMinValue).on('change keyup', function() {
		//updatedFilters();
	});*/
});



/*function updatedFilters() {
	if($('#filterType').val() == null) FILTERS.types = [];
	else FILTERS.types = $.grep($('#filterType').val(), function(value) {
		return value != 'multiselect-all';
	});
	
	FILTERS.year = $('#currYear').val();
	FILTERS.minValue = $('#filterMinValue').val();
	
	
	var map = $('#map').empty();
	
	map.append('Types: ' + FILTERS.types + '<br />');
	map.append('Minimal value: ' + FILTERS.minValue + '<br />');
	map.append('Year: ' + FILTERS.year);
}*/



function updateDataTable() {
	if(selected_country_id === -1) return false;
	
	console.log('updating table (' + selected_country_id + '/' + FILTERS.year + ')');
	
	var yearData = data.years[FILTERS.year][selected_country_id];
	console.log(yearData);
	
	var cName = $('#country' + selected_country_id).attr('title');
	
	var table = $('#dataTable tbody').empty();
	
	if(yearData.exports != null) {
		$.each(yearData.exports, function(key, value) {
			var c2Name = $('#country' + value.country_id).attr('title');
			
			var tr = $('<tr>');
			tr.append($('<td>').text(cName));
			tr.append($('<td>').text(c2Name));
			tr.append($('<td>', { style: 'text-align: right;' }).text(formatMoney(value.value, 0, ".", ",") + ' €'));
			
			table.append(tr);
		});
	}
	
	if(yearData.imports != null) {
		$.each(yearData.imports, function(key, value) {
			var c2Name = $('#country' + value.country_id).attr('title');
			
			var tr = $('<tr>');
			tr.append($('<td>').text(c2Name));
			tr.append($('<td>').text(cName));
			tr.append($('<td>', { style: 'text-align: right;' }).text(formatMoney(value.value, 0, ".", ",") + ' €'));
			
			table.append(tr);
		});
	}
}