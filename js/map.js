d3.select(window).on("resize", throttle);

/*
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", move);*/

var width = 1140;
//var height = 800;
var height = 950;

var color_country_hover = '#999';
var color_country = '#CCC';

var topo,
	projection,
	path,
	svg,
	g_map,
	g_overlay;

var tooltip = d3.select("#map").append("div").attr("class", "tooltipMap hidden");

setup(width,height);

function setup(width,height){
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
      ;

  g_map = svg.append("g").attr("id", "map");

  g_overlay = svg.append("g")
  	.attr("id", "overlay");

  
}
var armstrade;
var countries_latlong;
//var console;
var year = 2011;

d3.json("data/world-topo.json", function(error, world) {

  var countries = topojson.feature(world, world.objects.countries).features;

  d3.json("data/armstrade.json", function(error, data) {
		armstrade = data;
		countries_latlong = data.countries;
		
		  draw(countries);
		  //console.log(data);
		  if( error !== null) {
			  alert(error);
		  }
		  
		  // paint conflict scores
		  setCountriesColor();
		  
		for(y in armstrade.years) {
		  
			for(var i=0; i < armstrade.years[y].length; i++) {
				  var country = armstrade.years[y][i]
				  
				  // paint arcs
				  drawTrades(country, country.imports, "import", y);
				  drawTrades(country, country.exports, "export", y);				  
			}
		}
		  		  
	});
  


});

function drawTrades(country, trades, type, y) {
	
	for(var j=0; j < trades.length; j++) {
		  // arc + circle for each trade
		  
		  var from = countries_latlong[ country.country_id ];
		  var to = countries_latlong[ trades[j].country_id ];
		  
		  g_overlay.append("path")
			  .datum({type: "LineString", coordinates: [[ from.long, from.lat], [to.long, to.lat]]})
			  .attr("class", type + " year" + y + " country" + country.country_id)
			  .style("visibility", "hidden")
			  .style("stroke-width", "1.0px")					  
			  .attr("d", path);
		  
		  g_overlay.append("circle")
		  .attr("transform", function(d) {return "translate(" + projection([to.long,to.lat]) + ")";})
		  .attr("class", type + " year" + y + " country" + country.country_id)
		  .attr("r", 5 * trades[j].width)
		  .style("visibility", "hidden");
		  
	  }	
	
}
function setYear(y) {
	
	d3.selectAll(".year" + year).style("visibility", "hidden");
	
	year = y;
	d3.selectAll(".year" + year).filter(".selected_country").style("visibility", "visible");
	
	
	
	// repaint countries
	setCountriesColor();
	
}
function setCountriesColor() {
	d3.selectAll(".country").style("fill", color_country);
	
	for(var i=0; i < armstrade.years[year].length; i++) {
		  var country = armstrade.years[year][i]
		  
		  d3.select("#country" + country.country_id).style("fill", getColorByConflictScore(country.conflict_score) );
	 }
	
}
function toggleArcs(country_id) {
	//console.log(country_id);
	
	 d3.selectAll(".year" + year + ":not(.selected_country)").style("visibility", "hidden");
	 d3.selectAll(".year" + year ).filter(".country" + country_id).style("visibility", "visible");
	 
}
function getColorByConflictScore(score) {
	if(score < 1) {
		return 'orange';
	} else if(score < 2) {
		return 'lightgreen';
	} else if(score < 3) {
		return 'red';
	} else if(score >= 3) {
		return 'darkred';
	}
}

function countryClick(d, i) {
	 d3.selectAll(".selected_country").classed("selected_country", false);
	 d3.selectAll(".country" + d.id).classed("selected_country", true);
	toggleArcs(d.id);	  
}

function countryMouseOver(d, i) {
	// change fill on mouseover
	  d3.select(this).attr('data-color', d3.select(this).style('fill'));    	  
	  d3.select(this).style('fill', color_country_hover ); 
	  
	  toggleArcs(d.id);
}

function countryMouseLeave(d, i) { 
	d3.select(this).style('fill', d3.select(this).attr('data-color') ); 
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
          .classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
          .html(d.properties.name)
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true)
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

function move2() {
	
	
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