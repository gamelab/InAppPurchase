<?php
	
	/**
	* For this script we are only going to send back the products if the app has sent us what platforms store they are implementing.
	* We are then going to check to see if we support that platform, and if we dont will send a error message. 
	**/

	if( isset($_GET['s']) ) {

		$productIDs = array();

		switch($_GET['s']) {

			//The AppStore
			case 0:
				$productIDs['first'] = array('id' => 'com.companyname.appname.appstore.firstproduct', 'amount' => 1500);
				$productIDs['second'] = array('id' => 'com.companyname.appname.appstore.secondproduct', 'amount' => 6000);
				$productIDs['third'] = array('id' => 'com.companyname.appname.appstore.thirdproduct', 'amount' => 12000);
				break;


			//PlayStore
			case 1:
				$productIDs['first'] = array('id' => 'com.companyname.appname.android.firstproduct', 'amount' => 1500);
				$productIDs['second'] = array('id' => 'com.companyname.appname.android.secondproduct', 'amount' => 6000);
				$productIDs['third'] = array('id' => 'com.companyname.appname.android.thirdproduct', 'amount' => 12000);
				break;

			//Mock Store
			case 2:
				$productIDs['first'] = array('id' => 'com.companyname.appname.firstproduct', 'amount' => 1500);
				$productIDs['second'] = array('id' => 'com.companyname.appname.secondproduct', 'amount' => 6000);
				$productIDs['third'] = array('id' => 'com.companyname.appname.thirdproduct', 'amount' => 12000);
				break;

			default:
				die( json_encode( array('error'=> 'Sorry, the platform your are on is not supported.') ) );
				break;
		}

		echo json_encode( $productIDs );

	} 

?>