
// no resize
// d3.select(window).on("resize", throttle);

var max_trades_per_country = 15;
var width = 1140;
var height = 950;

var color_country_hover = '#999';
var color_country = '#CCC';

var armstrade;
var year = 2001;
var selected_country_id = -1;

var topo,
	projection,
	path,
	svg,
	g_map,
	g_overlay,
	tooltip,
	data;

function initMap() {
	

	tooltip = d3.select("#map").append("div").attr("class", "overlay-tooltip overlay-hidden");

	setupMap(width, height);
	loadData();
	
	
}




function setupMap(width, height){
	projection = d3.geo.mercator()
		.translate([0, 0])
		.scale(width / 2 / Math.PI);
	path = d3.geo.path().projection(projection);
	svg = d3.select("#map").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      //.call(zoom)
      .on("mouseenter", function() {
    	  //console.log("x");
      } )
      ;

	g_map = svg.append("g").attr("id", "map");
	g_overlay = svg.append("g").attr("id", "overlay");  
}


function loadData() {
	d3.json("data/world-topo.json", function(error, world) {
	
	  var countries = topojson.feature(world, world.objects.countries).features;
	
	  
	  
	  d3.json("data/armstrade.json", function(error, json) {
			data = json;
			
			  draw(countries);
			  //console.log(data);
			  if( error !== null) {
				  alert(error);
			  }
			  
			  
			  
			  // paint conflict scores
			  setCountriesColor();
			  
			for(y in data.years) {
			  
				for(country_id in data.years[y]) {
					  var country = data.years[y][ country_id ];
					  		
					  //console.log(country_id);
					  
					  // paint arcs
					  //drawTrades(country_id, country.imports || [], "import", y);
					  //drawTrades(country_id, country.exports || [], "export", y);
					  //console.log(  );
					  
					  // set data attributes
					  d3.select("#country" + country_id).attr("data-imports-" + y, JSON.stringify(country.imports || []) );
					  d3.select("#country" + country_id).attr("data-exports-" + y, JSON.stringify(country.exports || []) );
					  
				}
			}
			
			d3.selectAll(".container").style("visibility", "visible");
			d3.select("#loading").style("visibility", "hidden");
			  		  
		});
	
	
	});
}
	


function drawTrades(country_id, trades, type, y) {

	  if(typeof trades === "undefined" || trades === null)
		  return;

	  
	for(var j=0; j < trades.length; j++) {
			if(j > max_trades_per_country)
				break;
			
		  // arc + circle for each trade
		  
		  var from = data.countries[ country_id ].location;
		  var to = data.countries[ trades[j].country_id ].location;

		  g_overlay.append("path")
			  .datum({type: "LineString", coordinates: [[ from[1], from[0]], [to[1], to[0] ]]})
			  .attr("class", type + " year" + y + " country" + country_id)
			  //.style("visibility", "hidden")
			  .style("stroke-width", "1.0px")					  
			  .attr("d", path);
		  
		  
		  g_overlay.append("circle")
		  .attr("transform", function(d) {return "translate(" + projection([to[1], to[0]]) + ")";})
		  .attr("class", type + " year" + y + " country" + country_id)
		  .attr("r", getRadiusByTradeValue(trades[j].value) )
		  //.style("visibility", "hidden")
		  ;
		  
	  }	
	
}
function setYear(y) {
	
	updateDataTable();
	
	// remove old arcs
	//hideArcs(selected_country_id, false);
	//d3.selectAll(".country" + selected_country_id).remove();
	
	year = y;
	
	// repaint arcs
	if(selected_country_id > 0) {
		d3.selectAll(".country" + selected_country_id).remove();
		
		showArcs(selected_country_id);
	}

	// repaint countries
	setCountriesColor();
	
}
function setCountriesColor() {
	d3.selectAll(".country").style("fill", color_country);
	
	for(country_id in data.years[year]) {
		
		
		var country = data.years[year][ country_id ];

		d3.select("#country" + country_id).style("fill", getColorByConflictScore(country.conflict) );
	 }
	
}

function getColorByConflictScore(score) {
	if(score < 1) {
		return 'orange';
	} else if(score < 2) {
		return 'lightgreen';
	} else if(score < 5) {
		return '#EB7878';
	} else if(score >= 5) {
		return '#DE3A3A';
	}
}

function getRadiusByTradeValue( value ) {
	var r = value / data.helper.max_trade_value * 165;
	if(r < 3)
		return 3;
	else
		return r;
}



function getTooltipInfo(country_id) {
	if( typeof data.countries[ country_id ] === "undefined") {
		exports = imports = "N/A";		
	} else {		
		var imports = data.countries[ country_id ].imports[ year ];
		var exports = data.countries[ country_id ].exports[ year ];
	}
	
	if(typeof imports === "undefined")
		imports = "N/A";
	else
		imports = formatMoney(imports, 2, ".", ",");
	
	if(typeof exports === "undefined")
		exports = "N/A";
	else
		exports = formatMoney(exports, 2, ".", ",");
	
	return "<br><small><b>Imports</b> " + imports + " &euro;"
		+ "<br><b>Exports</b> " + exports + " &euro;</small>"; 
}

function countryClick(d, i) {
	 // remove old selected
	 d3.selectAll(".country" + selected_country_id ).remove(); //classed("selected_country", false);
	 
	 // set new selection
	 selected_country_id = d.id;
	 d3.selectAll(".country" + d.id).classed("selected_country", true);
	 //d3.selectAll("#country" + d.id).classed("selected_country", true);
	 
	 
	 // country_id = d.id -> data.years[ year ][ d.id ] -> TODO Jonas
	 updateDataTable();
	 
	//showArcs(d.id);	  
}

function countryMouseOver(d, i) {
	// change fill on mouseover
	  d3.select(this).attr('data-color', d3.select(this).style('fill'));    	  
	  d3.select(this).style('fill', color_country_hover ); 
	  
	  showArcs(d.id);
}

function countryMouseLeave(d, i) { 
	d3.select(this).style('fill', d3.select(this).attr('data-color') ); 
	
	hideArcs(d.id, true);
}

function showArcs(country_id) {
	
	drawTrades(country_id, JSON.parse( d3.select("#country" + country_id).attr("data-imports-" + year) ), "import", year);
	drawTrades(country_id, JSON.parse( d3.select("#country" + country_id).attr("data-exports-" + year) ), "export", year);
	
	
	
	//console.log(imports);
	
	//console.log(country_id);	
	//d3.selectAll(".year" + year + ":not(.selected_country)").style("visibility", "hidden");
	//d3.selectAll(".year" + year ).filter(".country" + country_id).style("visibility", "visible");	 
}

function hideArcs(country_id, keep_selected_country) {
	var filter = ".country" + country_id;
	
	if( keep_selected_country == true )
		filter += ":not(.country" + selected_country_id +")";
	
	d3.selectAll(".year" + year ).filter( filter ).remove(); //style("visibility", "hidden");	
}

function draw(topo) {

  var country = g_map.selectAll(".country").data(topo);

  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return "country" + d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
  
      
      .on("click", countryClick)
      .on("mouseover", countryMouseOver )
  	  .on("mouseleave", countryMouseLeave );

  //ofsets plus width/height of transform, plsu 20 px of padding, plus 20 extra for tooltip offset off mouse
  var offsetL = document.getElementById('map').offsetLeft+(width/2)+40;
  var offsetT =document.getElementById('map').offsetTop+(height/2)+20;

  //tooltips
  country
    .on("mousemove", function(d,i) {
    	
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
        tooltip
          .classed("overlay-hidden", false)
          .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
          .html(d.properties.name + getTooltipInfo( d.id ) )
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("overlay-hidden", true)
      }); 
   
}

function zoomEurope() {
	var xy = [0,500]; // projection([9, 51]);
	var scale = 4;
	
	//zoom.translate(xy);
	
	g_map.attr("transform", "translate("+ xy + ")scale(" + scale + ")");
	g_overlay.attr("transform", "translate("+ xy + ")scale(" + scale + ")");
	
}

function redraw() {
  width = document.getElementById('map').offsetWidth-60;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height);
  draw(topo);
}


function move() {

  var t = d3.event.translate;
  var s = d3.event.scale;  
  var h = height / 3;
  
  t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
  t[1] = Math.min(height / 2 * (s - 1) + h * s, Math.max(height / 2 * (1 - s) - h * s, t[1]));

  zoom.translate(t);
  g_map.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
}

var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
}