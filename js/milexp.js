var SETTINGS = {
	minYear: 2001,
	maxYear: 2012,
	defaultYear: 2012,
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
		
		updateDataTable();
	})
	
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
	console.log('jo');
}