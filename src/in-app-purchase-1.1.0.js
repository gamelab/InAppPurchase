/**
* The InAppPurchase plugin is designed to help make intergrating the CocoonJS IAP with Kiwi easier. 
* When a game is created, a new manager will be added to the 'game' root which is a instanted version of this class, under the property 'inAppPurchase'. You can then access that object to make a purchase or fetch purchases from the store.  
* 
* @module Kiwi
* @submodule Plugins
* @namespace Kiwi.Plugins
* @class InAppPurchase
*/
Kiwi.Plugins.InAppPurchase = {

    /**
    * The name of this plugin.
    * @property name
    * @type String
    * @public
    */
	name: 'InAppPurchase',

    /**
    * The version of this plugin in semver (semantic versioning) format
    * @property version
    * @type String
    * @public
    */
    version: '2.0.0',

    /**
    * The minimum version of Kiwi.js required to run this plugin in semver (semantic versioning) format
    * @property minimumKiwiVersion
    * @type String
    * @public
    */
    minimumKiwiVersion:'1.3.0',

    /**
    * If the device is ready to be used or not. 
    * @property deviceReady
    * @type Boolean
    * @default false
    * @public
    */
    deviceReady: false,

};
   

Kiwi.PluginManager.register(Kiwi.Plugins.InAppPurchase);

document.addEventListener('deviceready', function() {

	/**
	* Waits for the device ready event to be executed.
	* 
	* At this point we can execute IAP code without errors occuring as 
	* the appropriate code will now be accessible. 
	*/

	Kiwi.Plugins.InAppPurchase.deviceReady = true;
});


/**
* The create method is executed automatically by the PluginManager when it is included in a game. Internal Use ONLY.
* @method create
* @param game {Game} The game that this plugin belongs to.
* @protected
*/
Kiwi.Plugins.InAppPurchase.create = function(game) {

	game.inAppPurchase = new Kiwi.Plugins.InAppPurchase.InAppPurchase(game);
	
	return game.inAppPurchase; //Boot method here...
}



Kiwi.Plugins.InAppPurchase.InAppPurchase = function(game) {

	/**
	* The game this belongs to.
	* @property game
	* @type Game
	* @public
	*/
	this.game = game;

}



/**
* Executed when the game's DOM has been loaded and all assets have been set-up. Internal Use only.
* @method boot
* @protected
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.boot = function() {

	/**
	* Your unique Identifier for your app. Not required. 
	* Generally follows the convetion of com.yourcompany.appname
	* @property bundleId
	* @type string
	* @public
	*/
	this.bundleId = null;
	
	/**
	* The API version of the app that is being developed. Not required.
	* @property apiVersion
	* @type string
	* @public
	*/
	this.apiVersion = null;
	
	//Create the callbacks
	this._createCallbacks(); 

}

/**
* Initalises the store (if it is avaiable) and starts the retrieval of products and purchases.
* @method init
* @return {Boolean}
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.init = function(callback, context) {

	if( !Kiwi.Plugins.InAppPurchase.deviceReady ) {
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Could not initialise Store.');
	 	return false; 
	}


	if(this.game.debugOption == Kiwi.DEBUG_ON) {
		Kiwi.Log.log( 'Initialisation Starting', '#inAppPurchase' );
	}

	this._startEvents();

	Cocoon.InApp.initialize({
    	autofinish: true
	}, function( error ) {

		if( callback ) {
			callback.call(context, error );
		}

	});

	return true;
}


/**
* Request a product purchase given it's product id. 
* @method purchase
* @param productId {String} The Id of the product that is being requested to be brought.
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.purchase = function(productId) {

	if(typeof productId == "undefined" || this.available == false || Cocoon.Store.canPurchase() == false) {
		if(this.game.debugOption == Kiwi.DEBUG_ON) Kiwi.Log.log('Purchase of a product could not be preformed.', '#inAppPurchase');
		return;
	}
	if(this.game.debugOption == Kiwi.DEBUG_ON) Kiwi.Log.log( 'Purchase of a product started.', '#inAppPurchase' );

	Cocoon.Store.purchase(productId);
}


/**
* Returns a boolean indicating whether or not a product has been purchased or not. 
* @method isPurchased
* @param productId {string} The id of the product you are wanting to purchase.
* @return {Boolean} Returns a boolean indicating whether the product has been brought or not.
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.isPurchased = function(productId) {
	if(this.available == false || typeof productId == "undefined") return false;

	return Cocoon.Store.isProductPurchased(productId);
}


/**
* "Consumes" a purchase, allowing it to be purchased again. Currently only used for the Play Store. 
* Use to prevent 'You already own this product' errors.
* Make sure when you use this method you also add event listeners to the onConsumeStarted, onConsumeCompleted and onConsumeFailed methods.
* Note: When a purchase is consumed that product can no longer be restored.
* @method consume
* @param purchase {Object} The purchase that you want to consume.
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.consume = function(purchase) {
	if(typeof purchase == "undefined" || this.available == false) return;

	if(this.game.debugOption == Kiwi.DEBUG_ON) Kiwi.Log.log( 'Purchase Consumation Process Starting', '#inAppPurchase' );

	Cocoon.Store.consume(purchase.transactionId, purchase.productId);
}


/**
* Restoring the purchases is the way of returning purchased items information from the platform Store.
* Only certain purchases can be restored. See http://wiki.ludei.com/cocoonjs:extensions:store or you platform store for more detail.
* @method restorePurchases
* @public
* @deprecated
* @since 1.1.0
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.restore = function() {
	if(this.available == true) { 
		if(this.game.debugOption == Kiwi.DEBUG_ON) Kiwi.Log.log( 'Purchase Restoration Started.', '#inAppPurchase' );
		Cocoon.Store.restore();
	}
}


/**
* The type of object that this is.
* @method objType
* @return {String}
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.objType = function() {
	return 'inAppPurchase';
}


//-------------------------------------------------------------------------------------------------------------- CALLBACKS AND EVENTS

/**
* Initalises the callbacks that the users have access to through this plugin.
* @method _createCallbacks
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._createCallbacks = function() {

	/**
	* @property onPurchaseStartedCallback
	* @type Function
	* @default null
	* @public
	*/
	this.onPurchaseStarted = new Kiwi.Signal();

	/**
	* @property onPurchaseFailedCallback
	* @type Function
	* @default null
	* @public
	*/
	this.onPurchaseFailed = new Kiwi.Signal();

	/**
	* @property onPurchaseCompleteCallback
	* @type Function
	* @default null
	* @public
	*/
	this.onPurchaseComplete = new Kiwi.Signal();

}



/**
* Adds event listeners to the cocoon store. This is applyed during the init method of the app and is a internal method only.
* @method _startEvents
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._startEvents = function() {
	//Purchase Events 
	Cocoon.Store.onProductPurchaseStarted.addEventListener( this._onProductPurchaseStarted.bind(this) );
	Cocoon.Store.onProductPurchaseFailed.addEventListener( this._onProductPurchaseFailed.bind(this) );
	Cocoon.Store.onProductPurchaseCompleted.addEventListener( this._onProductPurchaseCompleted.bind(this) );
}


//Purchase Events
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductPurchaseStarted = function(productId) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) Kiwi.Log.log('Product Purchase Started: '+productId, '#inAppPurchase');	

	this.onPurchaseStarted.dispatch(productId);
}

Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductPurchaseFailed = function(productId, error) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) Kiwi.Log.log('Product Purchase of '+productId+ ' failed: '+error, '#inAppPurchase');

	this.onPurchaseFailed.dispatch(productId, error);
}

Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductPurchaseCompleted = function(purchase) {

	if(this.game.debugOption == Kiwi.DEBUG_ON) Kiwi.Log.log('Purchase Completed: '+purchase.productId, '#inAppPurchase');
 
	this.onPurchaseComplete.dispatch(purchase);
}
