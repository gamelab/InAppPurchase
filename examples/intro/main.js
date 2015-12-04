

/* 
* Create a new Kiwi State which we are going ot use for our shop.
*/
var introShop = new Kiwi.State('introShop');


/*
* Preload method is executed each tiem the state is switched to.
* Controls the loading of images/assets and will be executed each time this state is switched to.
*/
introShop.preload = function() {
	//Background Image
	this.addImage('bg', 'images/background.png', false);
	
	//Product Images
	this.addImage('default', 'images/default.png', false);
	this.addImage('bow', 'images/bow.png', false);
	this.addImage('mace', 'images/mace.png', false);

	//Status Bars
	this.addImage('statusFailed', 'images/statusBarFailed.png', false);
	this.addImage('statusInProgress', 'images/statusBarInProgress.png', false);
	this.addImage('statusSuccess', 'images/statusBarSuccess.png', false);
	this.addImage('statusFFailed', 'images/statusBarFetchFailed.png', false);
	this.addImage('buyBtn', 'images/buy-now.png', false);
}


/*
* The init method will only be executed once, which is the first time the state is switched to. 
* In this case we are going to let it handle the initalisation of the store and adding events. 
*/
introShop.init = function() {

	/**
	* For this example we are going to 'hard code' the productIDs into our APP, 
	* Now this isn't the best way, and if you add products to it in the future you would have to update your app.
	**/
	this.products = [
		{
			'productId': 'com.companyName.app.firstproduct',
			'image': 'mace'
		}, 
		{
			'productId': 'com.companyName.app.secondproduct',
			'image': 'bow'
		}
		//Plus more
	];

	//The default image
	this.defaultImage = 'default';


	//Callbacks
	this.game.inAppPurchase.onFetchFailed.add(this.fetchFailed, this);
	this.game.inAppPurchase.onFetchComplete.add(this.fetchCompleted, this); 

	this.game.inAppPurchase.onPurchaseStarted.add(this.purchaseStarted, this);
	this.game.inAppPurchase.onPurchaseFailed.add(this.purchaseFailed, this);
	this.game.inAppPurchase.onPurchaseComplete.add(this.purchaseComplete, this);

	
	//Initialise the store, Here we are going to launch into the managed mode and a sandbox enviroment
	this.game.inAppPurchase.init(true, true);
	this.game.addProducts = true; //When products have been fetched, 

}


/*
* Is executed each time the state is switched to and after all the assets have been loaded.
* Here we are going to initialise our shop with all the information needed.
*/
introShop.create = function() {

	//Create the background image.
	this.bg = new Kiwi.GameObjects.StaticImage(this, this.textures.bg, 0, 0);
	this.addChild( this.bg ); 


	//Create the status bars/events and hide them. Ready for when they do appear.
	this.statusFailed = new Kiwi.GameObjects.StaticImage(this, this.textures.statusFailed, 0, 0);
	this.statusFFailed = new Kiwi.GameObjects.StaticImage(this, this.textures.statusFFailed, 0, 0);
	this.statusSuccess = new Kiwi.GameObjects.StaticImage(this, this.textures.statusSuccess, 0, 0);
	this.statusInProgress = new Kiwi.GameObjects.StaticImage(this, this.textures.statusInProgress, 0, 0);
	this.statusFailed.visible = false;
	this.statusFFailed.visible = false;
	this.statusSuccess.visible = false;
	this.statusInProgress.visible = false;
	this.addChild(this.statusFFailed);
	this.addChild(this.statusSuccess);
	this.addChild(this.statusInProgress);
	this.addChild(this.statusFailed);


	//Loop through the 'products' we want and get just the product ids.
	//This is so that we can then fetch all the valid products off the store.
	var prodIds = [];
	for(var i = 0; i < this.products.length; i++ ) {
		prodIds.push( this.products[i].productId );
	}


	//Query the store to see if any of the products are valid or not.
	this.game.inAppPurchase.loadProducts( prodIds );


	//Controls whether this is the current state or not.
	//We have this because the callbacks for the IAP events could happen at anytime.
	this.isCurrentState = true; 
}


/*
* Is executed when the fetching process for a product fails.
* We are then only displaying the 'fetch failed' status bar if this is the current state.
*/
introShop.fetchFailed = function() {
	if(this.isCurrentState) {
		introShop.displayStatus(2);
	}
}


/*
* Is executed when the fetch process for valid products is a success.
* This method is passed an array of valid products 
*/
introShop.fetchCompleted = function(products) {


	//If this is not the current state then don't bother to do anything.
	//Products fetch are automatically added to the local database. 
	if(this.isCurrentState == false) return;


	//Loop through the products that are available and match them up-to products that are on the stop
	for(var prods = 0; prods < this.game.inAppPurchase.products.length; prods++) {

		var currentProduct = this.game.inAppPurchase.products[prods];
		var image = this.defaultImage;

		for(var j = 0; j < this.products.length; j++) {

			//If the product matches one we have saved
			if(this.products[j].productId == currentProduct.productId) {
				image = this.products[j].image;
				break;
			}

		}

		//Calculate where the game objects should be located should be 
		var x = 20;
		var y = 80 + prods * 160;


		//Create the game objects
		var go = new Kiwi.GameObjects.StaticImage(this, this.textures[image], x, y);
		var gt = new Kiwi.GameObjects.Textfield(this, currentProduct.productAlias, x + 170, y, '#ffffff');
		var btn = new Kiwi.GameObjects.Sprite(this, this.textures.buyBtn, x + 170, y + 50, true);
		

		// Add the productID, to the button. 
		// This is so that when the user goes to 'buy' the product, we can then detect which button they clicked
		btn.productId = currentProduct.productId;
		btn.input.onUp.add(this.purchase, this);

		//Add the gameobjects to the stage
		this.addChild(go);			
		this.addChild(gt);
		this.addChild(btn);

	}

}


/**
* Controls which status should be displayed by a number which is passed.
* 1 - Failed to purchase
* 2 - Fetching products failed
* 3 - Purchase is in progress
* 4 - Purhcase was successful
**/
introShop.displayStatus = function(number) {
	this.statusFailed.visible = false;
	this.statusFFailed.visible = false;
	this.statusSuccess.visible = false;
	this.statusInProgress.visible = false;
	
	switch(number) {
		case 1:
			this.statusFailed.visible = true;
			break;

		case 2:
			this.statusFFailed.visible = true;
			break;

		case 3:
			this.statusInProgress.visible = true;
			break;

		case 4:
			this.statusSuccess.visible = true;
			break;
	}

}


/**
* Is executed when the user 'clicks' on one of the buttons, and thus wants to 'purchase' it.
**/
introShop.purchase = function(btnOwner) {
	if(this.isCurrentState) {
		this.game.inAppPurchase.purchaseProductModalWithPreview( btnOwner.productId );
	}
}


/**
* When a product purchase starts.
**/
introShop.purchaseStarted = function() {
	if(this.isCurrentState) {
		introShop.displayStatus(3);
	}
}


/**
* When a product purchase fails.
**/
introShop.purchaseFailed = function(error) {
	if(this.isCurrentState) {
		introShop.displayStatus(1);
	}
}


/**
* The product has been succesfully purchased.
**/
introShop.purchaseComplete = function(purchase) {
	if(this.isCurrentState) {
		introShop.displayStatus(4);

		//Consume the purchase, so that we can purchase it again.
		//In this shop all purchases are assumed to be 'consumables', and so we can buy them again.
		this.game.inAppPurchase.consume( purchase );
	}
}


//The options that we are going to have for this game.
var gameOptions = { 
	deviceTarget: Kiwi.TARGET_COCOON,	
 	plugins: [ 'InAppPurchase'],
 	scaleType: Kiwi.Stage.SCALE_FIT
 };

var game = new Kiwi.Game(null, 'IntroShop', introShop, gameOptions);
