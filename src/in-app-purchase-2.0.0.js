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
};



Kiwi.Plugins.InAppPurchase.InAppPurchase = function(game) {

	/**
	* The game this belongs to.
	* @property game
	* @type Game
	* @public
	*/
	this.game = game;

};


Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype = {

	boot: function() {

		/**
		* Executed when the game's DOM has been loaded and all assets have been set-up. Internal Use only.
		* @method boot
		* @protected
		*/

		/**
		* If the IAPs are ready to be purchased or not. 
		* Will be false if the `init` method is yet to be executed.
		* 
		* @property active
		* @type boolean
		* @default false
		* @readOnly
		* @public
		*/
		this.active = false;

		/**
		* Executed when a purchase is being made.
		*
		* @property onPurchaseStartedCallback
		* @type Function
		* @default null
		* @public
		*/
		this.onPurchaseStarted = new Kiwi.Signal();

		/**
		* Executed when a purchase failed to complete.
		* 
		* @property onPurchaseFailedCallback
		* @type Function
		* @default null
		* @public
		*/
		this.onPurchaseFailed = new Kiwi.Signal();

		/**
		* Executed when a purchase was successful.
		* 
		* @property onPurchaseCompleteCallback
		* @type Function
		* @default null
		* @public
		*/
		this.onPurchaseComplete = new Kiwi.Signal();

	},

	objType: function() {

		/**
		* The type of object that this is.
		* @method objType
		* @return {String}
		* @public
		*/

		return 'inAppPurchase';
	},

	log: function( message ) {

		/**
		* Shortcut to log a message with fixed information related to this plugin added.
		* 
		* @method log
		* @param message {String}
		*/

		if( this.game.debugOption === Kiwi.DEBUG_ON ) {
			Kiwi.Log.log( 'IAP:', message, '#inAppPurchase' );
		}

	},

	available: function() {

		/**
		* Returns a flag indicating if IAP methods can be executed or not.
		* 
		* @method available
		* @return {Boolean}
		*/

		return ( 
			Kiwi.Plugins.InAppPurchase.deviceReady && 
			this.active &&
			Cocoon.InApp.canPurchase() );

	},

	init: function(productIds, callback, context) {

		/**
		* Initalises the store if it is avaiable. 
		* Starts fetching products from the store if an array of productIds were passed. 
		* 
		* @method init
		* @param [productIds] {Array} 
		* @param [callback] {Function} 
		* @param [context] {Any} 
		* @return {Boolean}
		*/

		if( !Kiwi.Plugins.InAppPurchase.deviceReady ) {
			this.log('Could not initialise store. Device not ready yet');
		 	return false; 
		}

		if( typeof Cocoon == "undefined" || typeof Cocoon.InApp == "undefined" ) {
			this.log("Could not initialise store. Cocoon Namespaces not found");
			return false; 
		}

		this.log( 'Initialisation Starting' );
		this._startEvents();

		var self = this;
		Cocoon.InApp.initialize( {
	    	autofinish: true
		}, function( error ) {

			self.active = !!(error);

			if( !productIds || error ) {

				if( callback ) {
					callback.call(context, error );
				}

				return;
			} 

			self.log("Store successfully started");
			self.fetchProducts( productIds, callback, context );

		} );

		return true;
	},

	fetchProducts: function(productIds, callback, context) {

		/**
		* Validates the productIds passed.
		* 
		* @method fetchProducts
		* @param productIds {Array}
		* @param [callback] {Function}
		* @param [context] {Any}
		*/

		if( !this.available() ) {
			this.log( "Fetch can't be performed" );
			if( callback ) {
				callback.call( context, "Device doesn't support IAP" );
			}
			return;
		}

		this.log("Fetching products from store");

		Cocoon.InApp.fetchProducts( productIds, function( products, error ) {

			if( error ) {
				this.log("Fetch products failed:" + error);
			}

			if( callback ) {
				callback.call( context, error, products );
			}

		} );

	},

	purchase: function( productId, quantity, callback, context ) {

		/**
		* Request a product purchase given it's product id. 
		* 
		* @method purchase
		* @param productId {String} 
		* @param [quantity=1] {Number}
		* @param [callback] {Function}
		* @param [context] {Any} 
		*/

		if( !this.available() ) {
			this.log( "Purchase of a product can't be performed" );
			if( callback ) {
				callback.call( context, "Device doesn't support IAP" );
			}
			return;
		}

		this.log( 'Purchase of a product started' );

		if( typeof quantity === "undefined" ) {
			quantity = 1;
		}

		Cocoon.InApp.purchase( productId, quantity, function( error ) {

			if( callback ) {
				callback.call( context, error );
			}

		});
	}, 

	isPurchased: function( productId ) {

		/**
		* Returns a boolean indicating whether or not a product has been purchased or not. 
		* 
		* @method isPurchased
		* @param productId {string} The id of the product you are wanting to purchase.
		* @return {Boolean} Returns a boolean indicating whether the product has been brought or not
		*/

		if( !this.available() ) {
			this.log( "isPurchase can't be performed" );
			return false;
		}

		return Cocoon.InApp.isPurchased( productId );

	},

	consume: function(productId, quantity, callback, context) {

		/**
		* Consumes a product so that it can be purchased again. Android only.
		* 
		* @method consume
		* @param productId {String}
		* @param [quantity=1] {Number}
		* @param [callback] {Function}
		* @param [context] {Any}
		*/

		if( !this.available() ) {
			this.log( 'Purchase comsume process failed.' );
			if( callback ) {
				callback.call( context, 0, "Device doesn't support IAP" );
			}
			return;
		}

		if( typeof quantity === "undefined" ) {
			quantity = 1;
		}

		this.log("Consuming " + quantity + " " + productId );

		Cocoon.InApp.consume( productId, quantity, function(consumed, error) {

			if( callback ) {
				callback.call( context, error, consumed );
			}

		});

	},

	restore: function() {

		/**
		* Starts the purchase restoration process
		* 
		* @method restore
		*/

		if( !this.available() ) {
			this.log("Purchase restore process failed.");
			return;
		}

		this.log("Restore process starting.");

		Cocoon.InApp.restorePurchases();

	},

	productForId: function(productId) {

		/**
		* Returns the product information relating to the productId passed. 
		* 
		* @method productForId
		* @param productId {string} The id of the product you wanting to get.
		* @return {Object} 
		*/

		if( !this.available() ) {
			this.log( "isPurchase can't be performed" );
			return false;
		}

		return Cocoon.InApp.productForId( productId );

	},

	setValidationHandler: function(callback, context) {

		/**
		* Sets a the validation handler callback to be executed 
		* when products need validation 
		* 
		* @method setValidationHandler
		* @param callback {Function} Will be passed 
		* @param [context] {Any}
		*/

		if( !this.available() ) {
			this.log( "setValidationHandler can't be performed" );
			return false;
		}

		Cocoon.InApp.setValidationHandler(function(receipt, productId, completion){

			this.log("Validation needed for " + receipt);
			callback.call( context, receipt, productId, completion );
			
		});

	},

	_startEvents: function() {

		/**
		* Adds event listeners to the store. 
		* This is applyed during the init method of the app and is a internal method only.
		* @method _startEvents
		* @private
		*/

		var self = this;

		Cocoon.InApp.on("purchase", {
			start: function(productId) {
				self.log("Purchase started: " + productId );
				self.onPurchaseStarted.dispatch( productId );
			},
			error: function(productId, error) {
				console.log("purchase failed " + productId + " error: " + JSON.stringify(error));
				self.log("Purchase failed: " + productId + " " + error );
				self.onPurchaseFailed.dispatch(error, productId);
			},
			complete: function(purchase) {
				self.log("Purchase completed: " + purchase.producyId );
				self.onPurchaseComplete.dispatch(purchase);
			}
		});


	},

};

