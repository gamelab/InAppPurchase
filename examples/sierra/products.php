<?php
	
	//Can do custom detection if wanted through the $_GET or $_POST for what platform they are on, or version, e.t.c.

	//Your own custom serverscript to deal with management of products can go here.
    //But for now we are just going to display an array.
	$productIDs = array();

	$productIDs[] = 'com.companyname.appname.firstproduct';
	$productIDs[] = 'com.companyname.appname.secondproduct';
	$productIDs[] = 'com.companyname.appname.thirdproduct';
	$productIDs[] = 'com.companyname.appname.fourthproduct';
	

	echo json_encode( $productIDs );

?>