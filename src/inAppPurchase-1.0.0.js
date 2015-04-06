/**
* The InAppPurchase plugin is designed to help make intergrating in-app purchase's using CocoonJS with Kiwi easier. 
* What happens is that when a game that use's this plugin is created, a new manager is added to the 'game' root which is a instanted version of this class, under the property 'inAppPurchase'. You can then access that object to make a purchase or fetch purchases from the store.  
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
    version: '1.0.0',

    /**
    * The minimum version of Kiwi.js required to run this plugin in semver (semantic versioning) format
    * @property minimumKiwiVersion
    * @type String
    * @public
    */
    minimumKiwiVersion:'1.0.0'

};
   
    

Kiwi.PluginManager.register(Kiwi.Plugins.InAppPurchase);



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

	/**
	* Indicates if the store is accessible and can be used or not.
	* @property available
	* @type boolean
	* @public
	*/
	this.available = false;
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

	/**
	* The type of store that is being used.
	* Will be -1 if the Cocoon API could not be found.
	* @property storeType
	* @type number
	* @public
	*/
	if( Cocoon && Cocoon.Store ) {
		this.storeType = Cocoon && Cocoon.Store && Cocoon.Store.getStoreType();
	} else {
		this.storeType = -1;
	}

	/**
	* An array holding all of the products that are avaiable on the store.
	* @property _products
	* @type Array
	* @private
	*/
	this._products = [];

	/**
	* An array consisting of all of the purchases that have been saved.
	* @property _purchases
	* @type Array
	* @private
	*/
	this._purchases = [];
	
	/**
	* If the purchase information for products should be automatically saved into the local database or not. 
	* Defaults to true
	* @property addPurchases
	* @type boolean
	* @default true
	* @public
	*/
	this.addPurchases = true;

	/**
	* If the products once fetched from the store, should be automatically added to the localdatabase.
	* @property addProducts
	* @type boolean
	* @default false
	* @public
	*/
	this.addProducts = false;

	/**
	* If when a purchase is made, and the product purchased is a CONSUMABLE, whether it should be automatically consumed to be ready for future purchase.
	* @property autoConsume
	* @type boolean
	* @default false
	* @public
	*/
	this.autoConsume = false;

	/**
	* If the in app purchasing should be managed via the Cocoon Cloud compling service or not.
	* @property _managed
	* @type boolean
	* @private
	*/
	this._managed = null;

	/**
	* If the app is launching in a 'sandbox' mode. 
	* @property _sandbox
	* @type boolean
	* @private
	*/
	this._sandbox = null;

	//Create the callbacks
	this._createCallbacks(); 

	//Initial test to see the store is avaiable or not
	if(Cocoon.Store.nativeAvailable && this.game.deviceTargetOption == Kiwi.TARGET_COCOON && Cocoon.Store.canPurchase() == false) {
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Cannot Use the InAppPurchase Plugin.');
	} else {
		this.available = true;
	}

}



/**
* Returns the type of store that is being/will be used.
* @method getStoreType
* @return {Number} The number related to the store that is being used.
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.getStoreType = function() {
	return Cocoon.Store.getStoreType();
}



/**
* Initalises the store (if it is avaiable) and starts the retrieval of products and purchases.
* @method init
* @param [managed=false] {boolean} If the product purchase verification should be done through Cocoons Cloud Service or not. If you set this as false then you need to add a callback to the onPurchaseVertification as when it dispatchs a event you will need to veri that the data is correct. 
* @param [sandbox=true] {boolean} If the app should be launched in sandbox mode or not. For testing.  
* @return {Boolean}
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.init = function(managed, sandbox) {
	if(Cocoon.Store.nativeAvailable && this.game.deviceTargetOption == Kiwi.TARGET_COCOON && !Cocoon.Store.canPurchase()) {
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Could not initialise Store.');
	 	return false; 
	}

	if(this.available == false) this.available = true;

	if(typeof sandbox == "undefined") sandbox = true;
	if(typeof managed == "undefined") managed = false;

	if(this.game.debugOption == Kiwi.DEBUG_ON) {
		console.log( 'Initialisation Starting' );
		console.log( 'Sandbox is ' + sandbox.toString() );
		console.log( 'Managed Mode is ' + managed.toString() );
	}

	this._startEvents();

	//save the choosen options
	this._managed = managed;
	this._sandbox = sandbox;

	//Initialise Cocoon.
	Cocoon.Store.initialize( {
  		sandbox: sandbox,
  		managed:managed 
  	} );

	//Get all of the products and the purchases.
	this.retrieveProducts();
	this.retrievePurchases();

	return true;
}



/**
* Updates the purchases array with all of the purchase information stored in the local database. 
* Internal use only.
* @method _retrievePurchases
* @private
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.retrievePurchases = function() {
	if(this.available) {
		
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Retrieveing Purchases' );

		var purchases = Cocoon.Store.getPurchases();
		
		if(typeof purchases != "undefined") {
			console.log('Type of Purchase: ' + typeof purchases);
			this._purchases = purchases;
		} 

	}
}



/**
* Updates the products array with all of the product information store in the local database. 
* Internal use only.
* @method _retrieveProducts
* @private
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.retrieveProducts = function() {
	if(this.available) {
		
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Retrieveing Products' );

		var products = Cocoon.Store.getProducts();
		if(typeof products != "undefined") {
			this._products = products;
		}
	}
}


/**
* Retrieves a product by a productId that is passed. Doesn't update the local database of products first.
* @method getProductById
* @param productId {string}
* @return {Object} Returns an object containing the information for that product if it was found. If not found then returns null. 
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.getProductById = function(productId) {
	if(typeof productId !== "undefined")  {
		for(var i = 0; i < this._products.length; i++) {
			if(this._products[i].productId == productId) {
				return this._products[i];
			}
		}
	}

	return null;
}



/**
* The products that are currently avaiable.
* @property products
* @type Array
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype, "products", {
    get: function () {
        return this._products;
    },
    enumerable: true,
    configurable: true
});



/**
* The purchase's that the user has made.
* @property purchases
* @type Array
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype, "purchases", {
    get: function () {
        return this._purchases;
    },
    enumerable: true,
    configurable: true
});



/**
* Retreives product information off of the Store based on an array of productIds (in a string format) that are passed.
* @method fetchProductsFromStore
* @param productIds {String[]} An array of strings, each of which being a productId.
* @public
* @deprecated
* @since 1.1.0
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.fetchProductsFromStore = function(productIds) {
	console.log( "Use of this method has been deprecated. It will still work, but recommend use of 'loadProducts' instead." );
	this.loadProducts( productIds );
}

/**
* Retreives product information off of the Store based on an array of productIds (in a string format) that are passed.
* @method loadProducts
* @param productIds {String[]} An array of strings, each of which being a productId.
* @public
* @deprecated
* @since 1.1.0
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.loadProducts = function(productIds) {
	if(this.available && typeof productIds !== "undefined") {
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Now trying to fetch the products from the store.' );
		
		Cocoon.Store.loadProducts(productIds);
	}
}



/**
* Creates a new ProductInformation object and then adds it to the local database based on the parameters that are passed.
* @method createProduct
* @param productAlias {String} The alias of the product.
* @param productId {String} The unique productId the product will have
* @param productType {Number} The type of product this is. See the CocoonJS_Store @CocoonJS.Store.ProductType for the numbers.
* @param title {String} The title of this product 
* @param description {String} The description of the product
* @param localizedPrice {String} The localized price of this product
* @param downloadURL {String} The URL of the asset to be downloaded for this purchase.
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.createProduct = function(productAlias, productId, productType, title, description, price, localizedPrice, downloadURL) {
	if(this.available) {
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Addition of a product started' );

		var prod = {
			productId : productId,
			productAlias : productAlias,
			productType : productType,
			title : title,
			description : description,
			price : price,
			localizedPrice : localizedPrice,
			downloadURL : downloadURL
		};

		//Add the product
		this.addProduct( prod );
	}
}

/**
* Adds a ProductInfo object to the local database. 
* @method addProduct
* @param product {object}
* @public 
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.addProduct = function(product) {

	if(this.available && typeof product !== "undefined") {

		if(Kiwi.DEBUG_ON == this.game.debugOption) console.log( 'Product Addition started.' );

		Cocoon.Store.addProduct(product);
		
		//Retrieve the products again
		this.retrieveProducts();
	}

}



/**
* Removes a product from the local database based on the parameters that are passed.
* @method removeProduct
* @param productId {string} The productId of the item that you would like to remove.
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.removeProduct = function(productId) {
	if(this.available) {
	
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Removal of a product started' );

		Cocoon.Store.removeProduct( productId );
	}
}


/**
* Request a product purchase given it's product id. 
* @method purchaseProduct
* @param productId {String} The Id of the product that is being requested to be brought.
* @public
* @deprecated
* @since 1.1.0
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.purchaseProduct = function(productId) {
	console.log("This method has been deprecated. This method will still work, but you should use 'purchase' instead.");
	this.purchase(productId);
}


/**
* Request a product purchase given it's product id. 
* @method purchase
* @param productId {String} The Id of the product that is being requested to be brought.
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.purchase = function(productId) {
	if(typeof productId == "undefined" || this.available == false || Cocoon.Store.canPurchase() == false) {
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Purchase of a product could not be preformed.');
		return;
	}
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Purchase of a product started.' );

	Cocoon.Store.purchase(productId);
}


/**
* Request a product purchase given it's product id showing a modal progress dialog. 
* @method purchaseProductModal
* @param productId {String} The id of the product 
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.purchaseProductModal = function(productId) {
	if(typeof productId == "undefined" || this.available == false) return;

	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Purchase of a product with a progress dialog starting.' );

	Cocoon.Store.puchaseProductModal(productId);
}



/**
* Request the purchase of a product given it's product id showing a dialog with a preview of the product (title and description).
* @method purchaseProductModalWithPreview
* @param productId {string} 
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.purchaseProductModalWithPreview = function(productId) {
	if(typeof productId == "undefined" || this.available == false) return;

	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Purchase of a product with a preview happening.' );

	Cocoon.Store.purchaseProductModalWithPreview(productId);
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
* Adds a purchase to the local database that stores purchase information.
* @method addPurchase
* @param purchase {Object} The purchase that you want to add to the database
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.addPurchase = function(purchase) {
	if(typeof purchase == "undefined" || this.available == false) return;

	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Purchase Addition Process Started' );

	Cocoon.Store.addPurchase(purchase);
}



/**
* Removes a purchase from the local database which stores the purchase information.
* @method removePurchase
* @param transactionId {String} The transactionId of the purchase you want to remove. This can be found on a purchase item.
* @return {Boolean} If the transaction was successfully removed or not.   b
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.removePurchase = function(transactionId) {
	if(typeof transactionId == "undefined" || this.available == false) return;

	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Purchase Removal Process Starting' );

	return Cocoon.Store.removePurchase(transactionId);
}



/**
* "Consumes" a purchase, allowing it to be purchased again. Currently only used for the Play Store. 
* Use to prevent 'You already own this product' errors.
* Make sure when you use this method you also add event listeners to the onConsumeStarted, onConsumeCompleted and onConsumeFailed methods.
* Note: When a purchase is consumed that product can no longer be restored.
* @method consumePurchase
* @param purchase {Object} The purchase that you want to consume.
* @public
* @deprecated
* @since 1.1.0
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.consumePurchase = function(purchase) {
	console.log("This method is deprecated. It will still work but you should use 'consume' instead.");
	this.consume(purchase);
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

	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Purchase Consumation Process Starting' );

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
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.restorePurchases = function() {
	console.log('This method has been deprecated. You should use the \'restore\' method instead.');
	this.restore();
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
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Purchase Restoration Started.' );
		Cocoon.Store.restore();
	}
}


/**
* Restores all of the purchases through the platforms market with a modal dialog.
* @method restorePurchasesModal
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.restorePurchasesModal = function() {
	if(this.available == true) {
		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log( 'Purchase Restoration with Modal Started.' );
		Cocoon.Store.restorePurchasesModal();
	}
}


/**
* Used to finish the a purchase transaction. Tells the store that you can successfully downloaded all of the required assets/e.t.c needed. 
* @method finishPurchase
* @param transactionId {String} The id of the transaction that has been finished.
* @return {Boolean} If the finished method for that transaction was successful or not.
* @public 
* @deprecated
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.finishPurchase = function(transactionId) {
	console.log("This method is deprecated. This method will still work, but you should use the 'finish' method instead.");
	this.finish( transactionId );
}

/**
* Used to finish the a purchase transaction. Tells the store that you can successfully downloaded all of the required assets/e.t.c needed. 
* @method finish
* @param transactionId {String} The id of the transaction that has been finished.
* @return {Boolean} If the finished method for that transaction was successful or not.
* @public 
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.finish = function(transactionId) {
	if(this.available) {
		//Does that transaction already exist?
		if(typeof this._purchases != "undefined") {
			for(var i = 0; i < this._purchases.length; i++) {
				if(this._purchases[i].transactionId == transactionId) {
					return false;
				}
			}
		}

		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('TransactionID ' + transactionId + ' has been finialized');

		//Finish the transaction
		Cocoon.Store.finish(transactionId);
		return true;
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
	* @property onFetchStarted
	* @type Signal
	* @public
	*/
	this.onFetchStarted = new Kiwi.Signal();
	
	/**
	* @property onFetchFailed
	* @type Signal
	* @public
	*/
	this.onFetchFailed = new Kiwi.Signal();

	/**
	* @property onFetchComplete
	* @type Signal
	* @public
	*/
	this.onFetchComplete= new Kiwi.Signal();

	/**
	* @property onRestoreStarted
	* @type Signal
	* @public
	*/
	this.onRestoreStarted = new Kiwi.Signal();

	/**
	* @property onRestoreComplete
	* @type Signal
	* @public
	*/
	this.onRestoreComplete = new Kiwi.Signal();

	/**
	* @property onRestoreFailedCallback
	* @type Signal
	* @public
	*/
	this.onRestoreFailed = new Kiwi.Signal();

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
	* @property onPurchaseVertificationCallback
	* @type Function
	* @default null
	* @public
	*/
	this.onPurchaseVertification = new Kiwi.Signal();

	/**
	* @property onPurchaseCompleteCallback
	* @type Function
	* @default null
	* @public
	*/
	this.onPurchaseComplete = new Kiwi.Signal();

	/**
	* @property onConsumeStartedCallback
	* @type Function
	* @default null
	* @public
	*/
	this.onConsumeStarted = new Kiwi.Signal();
	
	/**
	* @property onConsumeCompleteCallback
	* @type Function
	* @default null
	* @public
	*/
	this.onConsumeComplete = new Kiwi.Signal();
	
	/**
	* @property onConsumeFailedCallback
	* @type Function
	* @default null
	* @public
	*/
	this.onConsumeFailed = new Kiwi.Signal();
}



/**
* Adds event listeners to the cocoon store. This is applyed during the init method of the app and is a internal method only.
* @method _startEvents
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._startEvents = function() {
	//Product Fetch Events
	Cocoon.Store.onProductsFetchStarted.addEventListener( this._onProductsFetchStarted.bind(this) );
	Cocoon.Store.onProductsFetchFailed.addEventListener( this._onProductsFetchFailed.bind(this) );
	Cocoon.Store.onProductsFetchCompleted.addEventListener( this._onProductsFetchCompleted.bind(this) );
	//Restore Purchase Events
	Cocoon.Store.onRestorePurchasesStarted.addEventListener( this._onRestorePurchasesStarted.bind(this) );
	Cocoon.Store.onRestorePurchasesCompleted.addEventListener( this._onRestorePurchasesCompleted.bind(this) );
	Cocoon.Store.onRestorePurchasesFailed.addEventListener( this._onRestorePurchasesFailed.bind(this) );
	//Purchase Events 
	Cocoon.Store.onProductPurchaseStarted.addEventListener( this._onProductPurchaseStarted.bind(this) );
	Cocoon.Store.onProductPurchaseFailed.addEventListener( this._onProductPurchaseFailed.bind(this) );
	Cocoon.Store.onProductPurchaseVerificationRequestReceived.addEventListener( this._onProductPurchaseVerificationRequestReceived.bind(this) );
	Cocoon.Store.onProductPurchaseCompleted.addEventListener( this._onProductPurchaseCompleted.bind(this) );
	//Consume Purchase Events
	Cocoon.Store.onConsumePurchaseStarted.addEventListener( this._onConsumePurchaseStarted.bind(this) );
	Cocoon.Store.onConsumePurchaseCompleted.addEventListener( this._onConsumePurchaseCompleted.bind(this) );
	Cocoon.Store.onConsumePurchaseFailed.addEventListener( this._onConsumePurchaseFailed.bind(this) );
}



//Products Fetch Events
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductsFetchStarted = function() {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Products Fetch has Started.');
	
	this.onFetchStarted.dispatch(); 

}
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductsFetchFailed = function(error) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Products Fetch has Failed: '+error);
	
	this.onFetchFailed.dispatch(error); 
}
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductsFetchCompleted = function(products) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) { 
		console.log('Products Fetch has Succeed.');

		//console.log('Products! '+ typeof products);

		for(var item in products) {
			console.log('Product '+products[item].productId+' Vertified');
		}
	}

	if(this.addProducts == true) {
		for(var item in products) {

			//productAlias, productId, productType, title, description, price, localizedPrice, downloadURL
			this.addProduct( products[item] );
		}
	}
	
	this.onFetchComplete.dispatch(products); 
}



//Restore Purchase Events
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onRestorePurchasesStarted = function() {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Purchase Restoration Started.');

	this.onRestoreStarted.dispatch();
}
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onRestorePurchasesCompleted = function() {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Purchase Restoration Completed.');

	this.onRestoreCompleted.dispatch();
}
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onRestorePurchasesFailed = function(error) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Purchase Restoration Failed: ' + error);

	this.onRestoreFailed.dispatch(error);
}



//Purchase Events
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductPurchaseStarted = function(productId) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Product Purchase Started: '+productId);	

	this.onPurchaseStarted.dispatch(productId);
}
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductPurchaseFailed = function(productId, error) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Product Purchase of '+productId+ ' failed: '+error);

	this.onPurchaseFailed.dispatch(productId, error);
}



/**
* If the user is not using Cocoons Extentions to managed the purchase verification then they are going to have to customise what happens 
* with this callback.
* @method _onProductPurchaseVerificationRequestReceived
* @param productId {string}
* @param data {Object}
* @private
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductPurchaseVerificationRequestReceived = function(productId, data) {
	//Do product verification here.... Perhaps needs to be custom?
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Product '+productId+' Verification Requested');

	console.log( data );

	/*
		The user has to do there own verification against a 'backend' server.
		If it succeeds then they need to executed the finish purchase + add purchase methods.
	*/
	this.onPurchaseVertification.dispatch(productId, data);
}
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onProductPurchaseCompleted = function(purchase) {

	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Purchase Completed: '+purchase.productId);
 	
 	if(this.autoConsume == true && this.getProductById(purchase.productId).productType == Kiwi.Plugins.InAppPurchase.InAppPurchase.CONSUMABLE) { 
 		if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Purchase being Auto Consumed.');
 		this.consumePurchase( purchase );
 	}
	
	this.finishPurchase(purchase.transactionId);
 	if(this.addPurchases) this.addPurchase(purchase);

	this.retrievePurchases();

	this.onPurchaseComplete.dispatch(purchase);
}


//Consume Purchase Events
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onConsumePurchaseStarted = function(transactionId) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Consume of transaction Started.');

	this.onConsumeStarted.dispatch(transactionId);
}
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onConsumePurchaseCompleted = function(transactionId) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Consume of transaction success');

	this.onConsumeComplete.dispatch(transactionId);
}
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype._onConsumePurchaseFailed = function(transactionId, error) {
	if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Consume of transaction '+transactionId+' has failed: '+error);

	this.onConsumeFailed.dispatch(transactionId, error);
}


//-------------------------------------------------------------------------------------------------------------- PRODUCT TYPES

/**
* A consumable product. 
* @property CONSUMABLE
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "CONSUMABLE", {
	get: function() {
		return Cocoon.Store.ProductType.CONSUMABLE;
	},
    enumerable: true,
    configurable: true
});

/**
* A non-cunsumable product. 
* @property NON_CONSUMABLE
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "NON_CONSUMABLE", {
	get: function() {
		return Cocoon.Store.ProductType.NON_CONSUMABLE;
	},
    enumerable: true,
    configurable: true
});

/**
* An auto-renewable subscription. See platform documentation for further information.
* @property AUTO_RENEWABLE_SUBSCRIPTION
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "AUTO_RENEWABLE_SUBSCRIPTION", {
	get: function() {
		return Cocoon.Store.ProductType.AUTO_RENEWABLE_SUBSCRIPTION;
	},
    enumerable: true,
    configurable: true
});

/**
* A free subscription. See platform documentation for further information.
* @property FREE_SUBSCRIPTION
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "FREE_SUBSCRIPTION", {
	get: function() {
		return Cocoon.Store.ProductType.FREE_SUBSCRIPTION;
	},
    enumerable: true,
    configurable: true
});

/**
* A non-renewable subscription. See platform documentation for further information.
* @property NON_RENEWABLE_SUBSCRIPTION 
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "NON_RENEWABLE_SUBSCRIPTION", {
	get: function() {
		return Cocoon.Store.ProductType.NON_RENEWABLE_SUBSCRIPTION;
	},
    enumerable: true,
    configurable: true
});


//-------------------------------------------------------------------------------------------------------------- STORE TYPES

/**
* The number related to the app store.
* @property APP_STORE
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "APP_STORE", {
	get: function() {
		return Cocoon.Store.StoreType.APP_STORE;
	},
    enumerable: true,
    configurable: true
});



/**
* The number related to the app store.
* @property PLAY_STORE
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "PLAY_STORE", {
	get: function() {
		return Cocoon.Store.StoreType.PLAY_STORE;
	},
    enumerable: true,
    configurable: true
});



/**
* The number related to the app store.
* @property MOCK_STORE
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "MOCK_STORE", {
	get: function() {
		return Cocoon.Store.StoreType.MOCK_STORE;
	},
    enumerable: true,
    configurable: true
});



/**
* The number related to the app store.
* @property CHROME_STORE
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "CHROME_STORE", {
	get: function() {
		return Cocoon.Store.StoreType.CHROME_STORE;
	},
    enumerable: true,
    configurable: true
});



/**
* The number related to the app store.
* @property AMAZON_STORE
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "AMAZON_STORE", {
	get: function() {
		return Cocoon.Store.StoreType.AMAZON_STORE;
	},
    enumerable: true,
    configurable: true
});



/**
* The number related to the app store.
* @property NOOK_STORE
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "NOOK_STORE", {
	get: function() {
		return Cocoon.Store.StoreType.NOOK_STORE;
	},
    enumerable: true,
    configurable: true
});
	   

//-------------------------------------------------------------------------------------------------------------- PURCHASE TYPES

/**
* The number related to a purchaseState that is successful.
* @property PURCHASED
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "PURCHASED", {
	get: function() {
		return Cocoon.Store.PurchaseState.PURCHASED;
	},
    enumerable: true,
    configurable: true
});



/**
* The number related to a purchaseState that is canceled.
* @property CANCELED
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "CANCELLED", {
	get: function() {
		return Cocoon.Store.PurchaseState.CANCELED;
	},
    enumerable: true,
    configurable: true
});



/**
* The number related to a purchaseState that has been refunded.
* @property REFUNDED
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "REFUNDED", {
	get: function() {
		return Cocoon.Store.PurchaseState.REFUNDED;
	},
    enumerable: true,
    configurable: true
});



/**
* The number related to a purchaseState that has expired. Used mainly on subscription based purchases.
* @property EXPIRED
* @number
* @static
* @public
*/
Object.defineProperty(Kiwi.Plugins.InAppPurchase.InAppPurchase, "EXPIRED", {
	get: function() {
		return Cocoon.Store.PurchaseState.EXPIRED;
	},
    enumerable: true,
    configurable: true
});



//-------------------------------------------------------------------------------------------------------------- TESTING FUNCTIONS
/**
* The following functions are for testing purpose's only and will not work in a production enviroment.
*/



/**
* Simulates the expiration of a purchase for the transactionId you pass.
* @method expirePurchase
* @param transactionId 
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.expirePurchase = function(transactionId) {
	if(this.available && this.getStoreType() == this.MOCK_STORE && typeof transactionId != "undefined") {
		Cocoon.Store.expirePurchase(transactionId)
	}
}



/**
* Simulates the cancelation of a purchase for the transactionId you pass.
* @method cancelPurchase
* @param transactionId 
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.cancelPurchase = function(transactionId) {
	if(this.available && this.getStoreType() == this.MOCK_STORE && typeof transactionId != "undefined") {
		Cocoon.Store.cancelPurchase(transactionId)
	}
}



/**
* Simulates the refunding of a purchase, based on the transactionId you pass.
* @method refundPurchase
* @param transactionId
* @public
*/
Kiwi.Plugins.InAppPurchase.InAppPurchase.prototype.refundPurchase = function(transactionId) {
	if(this.available && this.getStoreType() == this.MOCK_STORE && typeof transactionId != "undefined") {
		Cocoon.Store.refundPurchase(transactionId)
	}
}