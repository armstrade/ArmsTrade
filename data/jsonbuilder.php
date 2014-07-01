<?php

ini_set("auto_detect_line_endings", true);


$json = array(
	'helper' => array(
			'max_trade_value' => 0,
			),
	'years' => array(),
	'countries' => array(),
	);

// countries
// http://data.okfn.org/data/core/country-codes

// conflicts (flo)
// countries in ??? -> numeric

// arms trade
// https://github.com/caatdata/eu-arms-export-data
// countries in ?? -> numeric

// latitude longitude
// https://developers.google.com/public-data/docs/canonical/countries_csv

// iso mapping

$iso_alpha2 = array();
$iso_alpha3 = array();

$handle = fopen( 'country-names.csv', "r");

if ($handle) {
	while (($line = fgets($handle, 1024)) !== false) {	
	
		$cols = explode(";", $line);
		
		#print_r($cols);
		if( count($cols) > 3) {
			$iso_alpha2[ trim($cols[0]) ] = trim($cols[2]);
			$iso_alpha3[ trim($cols[1]) ] = trim($cols[2]);	
		}
	}
}


$handle = fopen( 'country-location.csv', "r");

if ($handle) {
	while (($line = fgets($handle, 1024)) !== false) {
		$cols = explode(";", $line);

		if( count($cols) >= 3
				&& isset($iso_alpha2[ $cols[ 0 ]]) ) {
				
			$country_id = $iso_alpha2[ $cols[ 0 ]];

			$json['countries'][ $country_id ] = array(
					'imports' => array(),
					'exports' => array(),
					'location' => array(
							(double) $cols[ 1 ],
							(double) $cols[ 2 ]
					)
			);
		}
	}
}



$handle = fopen( 'eu-armsexport.csv', "r");

if ($handle) {
	while (($line = fgets($handle, 1024)) !== false) {
		$cols = explode("; ", $line);
		array_walk($cols, 'trim');
		
		
		if( count($cols) >= 8) {

			
			
			if( $cols[7] !== "c" ) // filter by category
				continue;
			
			if( empty( $cols[2] ) || empty( $cols[4] ))
				continue;
			
			if( !isset($iso_alpha2[ $cols[ 2 ]]) || !isset($iso_alpha2[ $cols[ 4 ]]) )
				continue;
			
			$from_id = $iso_alpha2[ $cols[ 2 ]];
			$to_id = $iso_alpha2[ $cols[ 4 ]];
			
			#print_r($cols);
				
			
			$year = $cols[0];
			
			if( $cols[8] > $json['helper']['max_trade_value'] )
				$json['helper']['max_trade_value'] = $cols[8];
			
			// sum exports/imports per year
			
			if(isset($json['countries'][ $from_id ]['exports'][ $year ]))
				$json['countries'][ $from_id ]['exports'][ $year ] += $cols[8];
			else
				$json['countries'][ $from_id ]['exports'][ $year ] = $cols[8];
			
			if(isset($json['countries'][ $to_id ]['imports'][ $year ] ))
				$json['countries'][ $to_id ]['imports'][ $year ] += $cols[8];
			else
				$json['countries'][ $to_id ]['imports'][ $year ] = $cols[8];
			
			//
			
			$json['years'][ $year ][ $from_id ]['exports'][] = array('country_id' => $to_id, 'value' => $cols[8]);
			$json['years'][ $year ][ $to_id ]['imports'][] = array('country_id' => $from_id, 'value' => $cols[8]);
		
		}
	}
}

$handle = fopen( 'conflicts.csv', "r");

if ($handle) {		
	while (($line = fgets($handle, 1024)) !== false) {
		
		$cols = explode(";", $line);
		
		if( count($cols) >= 4 && isset($iso_alpha3[ $cols[ 2 ]]) ) {
		
			$country_id = $iso_alpha3[ $cols[ 2 ]];

			$year = $cols[0];
			$json['years'][ $year ][ $country_id ]['conflict'] = $cols[4];
		
		}
	}
}



echo "years: " . count($json['years']);

file_put_contents('armstrade.json', json_encode($json) );

