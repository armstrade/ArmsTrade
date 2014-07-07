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

function getCategoryName( id ) {

	categories = {
		"ML 1":"Smooth-bore weapons with a calibre of less than 20mm",
		"ML 2":"Smooth-bore weapons with a calibre of 20 mm or more",
		"ML 3":"Ammunition and fuse setting devices",
		"ML 4":"Explosive devices and charges",
		"ML 5":"Fire control and warning equipment",
		"ML 6":"Ground vehicles and components",
		"ML 7":"Chemical, biological, toxic or radioactiv agents, riot control agents",
		"ML 8":"Energetic materials",
		"ML 9":"Vessels of war (surface or underwater)",
		"ML 10":"Aircrafts, Unmanned Aerial Vehicles",
		"ML 11":"Electronic equipment",
		"ML 12":"High velocity kinetic energy weapon systems",
		"ML 13":"Armoured or protective equipment",
		"ML 14":"Specialised equipment for military training and/or simulations",
		"ML 15":"Imaging or countermeasure equipment",
		"ML 16":"Unfinished products (forgings, castings, ...)",
		"ML 17":"Miscellaneous equipment, materials and libraries",
		"ML 18":"Production equipment",
		"ML 19":"Directed Energy Weapon systems",
		"ML 20":"Cryogenic and superconductive equipment",
		"ML 21":"Software",
		"ML 22":"Technology",
			
	};
	
	if( typeof categories[ id ] === "undefined" )
		return "Miscellaneous";
	else
		return categories[ id ];
	
}
function updateDataTable() {
	if(selected_country_id === -1) return false;
	
	console.log( selected_country_id );
	console.log( year );
	
	var yearData = data.years[FILTERS.year][selected_country_id];
	
	var cName = $('#country' + selected_country_id).attr('title');
	
	var table = $('#dataTable tbody').empty();
	
	if(yearData.exportDetails != null) {
		$.each(yearData.exportDetails, function(key, value) {
			var c2Name = $('#country' + value.country_id).attr('title');
			
			var tr = $('<tr>');
			tr.append($('<td>').text(cName));
			tr.append($('<td>').text(c2Name));
			tr.append($('<td>').text(getCategoryName(value.type)) );
			
			tr.append($('<td>').text(formatMoney(value.value, 0, ".", ",") + ' €'));
			
			table.append(tr);
		});
	}
	
	if(yearData.importDetails != null) {
		$.each(yearData.importDetails, function(key, value) {
			var c2Name = $('#country' + value.country_id).attr('title');
			
			var tr = $('<tr>');
			tr.append($('<td>').text(c2Name));
			tr.append($('<td>').text(cName));
			tr.append($('<td>').text(getCategoryName( value.type ) ));
			tr.append($('<td>').text(formatMoney(value.value, 0, ".", ",") + ' €'));
			
			table.append(tr);
		});
	}
}