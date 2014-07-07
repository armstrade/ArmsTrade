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


var play = function() {};

function toggleHelp() {
	$('#help').toggle();
}

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
	
	$('#currYear').attr('min', SETTINGS.minYear).attr('max', SETTINGS.maxYear).val(SETTINGS.defaultYear).on('change keyup', function() {
		$('#yearsSlider').slider('setValue', $(this).val());
		setYear($(this).val());
		
		updateDataTable();
	});
	
	/*$('#filterMinValue').val(SETTINGS.defaultMinValue).on('change keyup', function() {
		//updatedFilters();
	});*/
	
	
	
	
	$('#pres1Continue').on('click', function() {
		$('#presentation1').hide();
		$('#presentation2').show();
	});

	$('#pres2Continue').on('click', function() {
		$('#presentation2').hide();
		$('#presentation3').show();
	});	
	
	
	$('#pres3Continue').on('click', function() {
		$('#presentation3').hide();
		$('#presentation4').show();
	});	
	
	
	$('.presClose').on('click', function() {
		$('.presentationSlide').hide();
		
	});
	
	$('#presCloseAndPlay, #sliderPlay').on('click', function() {
		$('.presentationSlide').hide();
		
		play = setTimeout(playMap, 2000);
	});
});


function playMap() {
	var i = 0;
	var max = SETTINGS.maxYear - SETTINGS.minYear;
	
	$({i: 0}).animate({i: max}, {
		duration: 40000,
		easing: 'linear',
		step: function() {
			var currYear = SETTINGS.minYear + Math.ceil(this.i);
			
			$('#yearsSlider').slider('setValue', currYear);
			
			$('#currYear').val(currYear);
			setYear(currYear);
		}
	});
}


function updateDataTable() {
	if(selected_country_id === -1) return false;
	
	var yearData = data.years[FILTERS.year][selected_country_id];
	
	var cName = $('#country' + selected_country_id).attr('title');
	
	var table = $('#dataTable tbody').empty();
	
	if(yearData.exports != null) {
		$.each(yearData.exports, function(key, value) {
			var c2Name = $('#country' + value.country_id).attr('title');
			
			var tr = $('<tr>');
			tr.append($('<td>').text(cName));
			tr.append($('<td>').text(c2Name));
			tr.append($('<td>').text(formatMoney(value.value, 0, ".", ",") + ' €'));
			
			table.append(tr);
		});
	}
	
	if(yearData.imports != null) {
		$.each(yearData.imports, function(key, value) {
			var c2Name = $('#country' + value.country_id).attr('title');
			
			var tr = $('<tr>');
			tr.append($('<td>').text(c2Name));
			tr.append($('<td>').text(cName));
			tr.append($('<td>').text(formatMoney(value.value, 0, ".", ",") + ' €'));
			
			table.append(tr);
		});
	}
}