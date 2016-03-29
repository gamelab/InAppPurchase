<?php
	
	$productIDs['first'] = array('id' => 'com.companyname.appname.firstproduct', 'amount' => 1500);
	$productIDs['second'] = array('id' => 'com.companyname.appname.secondproduct', 'amount' => 6000);
	$productIDs['third'] = array('id' => 'com.companyname.appname.thirdproduct', 'amount' => 12000);
				
	echo json_encode( $productIDs );

?>