
/**
* URL of the JSON file (or in this case PHP script which returns JSON) which can give us a list of productIds.
* If you decide to compile this example through the cloud compliation system, then you will need to make sure the products.php is located on a external server somewhere.
**/
var productURL = 'products.php';


/**
* The sierra shop state
**/
var sierraShop = new Kiwi.State('sierraShop');


/**
* Load the assets in.
**/
sierraShop.preload = function() {
	
	this.addSpriteSheet('adore64', 'images/adore64-atlas.png', 16, 30);

	//UI Elements
	this.addImage('close', 'images/close.png');
	this.addImage('buyNow', 'images/buyNow.png');
	this.addImage('brought', 'images/productBrought.png');
	this.addImage('title', 'images/title.png');
	this.addImage('lineSeperators', 'images/lineSeperators.png');
	
	//Product Images
	this.addImage('doubleSwords', 'images/doubleSwords.png');
	this.addImage('singleSword', 'images/singleSword.png');
	
	//Scroll Elements
	this.addImage('scrollDown', 'images/scrollDown.png');
	this.addImage('scrollUp', 'images/scrollUp.png');
	this.addImage('scroller', 'images/scroller.png');
	this.addImage('scrollbg', 'images/scrollbg.png');

	//Get the product information each time this state is switched to.
	// You can always use a regular AJAX request if wanted
	this.addJSON('products', productURL, false);

}


/**
* The init method is executed is executed once upon this state first being switched to.
* In this method we are going to initalise the store and add callbacks so that they only happen once.
**/
sierraShop.init = function() {

	//Callbacks
	this.game.inAppPurchase.onFetchStarted.add(this.fetchStarted, this);
	this.game.inAppPurchase.onFetchFailed.add(this.fetchFailed, this);
	this.game.inAppPurchase.onFetchComplete.add(this.fetchCompleted, this); 

	this.game.inAppPurchase.onPurchaseStarted.add(this.purchaseStarted, this);
	this.game.inAppPurchase.onPurchaseFailed.add(this.purchaseFailed, this);
	this.game.inAppPurchase.onPurchaseComplete.add(this.purchaseComplete, this);
	
	//Start Store - managed / sandbox
	this.game.inAppPurchase.init(true, true);
}


/**
* The create method is executed each time this state is switched to.
**/
sierraShop.create = function() {

	//Where the products gameobjects will be stored for the user to purchase
	this.prodsGroup = new Kiwi.Group(this, 0, 75);
	this.addChild(this.prodsGroup);


	//The title main title that we are going to display
	this.title = new Kiwi.GameObjects.StaticImage(this, this.textures.title, 0, 0);
	this.addChild(this.title);

	//The close button.
	this.close = new Kiwi.GameObjects.Sprite(this, this.textures.close, this.title.width, 0);
	this.addChild(this.close);

	//Create our scrollbar now.
	this.createScrollBar();


	//Used to allow and disallow the purchase of products in the game.
	//This is mainly to prevent people purchasing products whilst another process is happening.
	this.allowPurchases = false;



	/**
	* After loading using the 'addJson' method, any data will be saved into 'this.data'. Much like how images are added to 'this.textures'.
	* When accessing 'this.data.products' it will return to you the Kiwi File which was generated.
	* Which allows us to have even more useful data about it. 
	**/
	var productFile = this.data.products;


	//If no error was encountered during loading, the we can safely assume the file was loaded and we can get the data 
	if( productFile.hasError == false ) {

		//Get the raw Blob data and transform it into json.
		this.prods = JSON.parse( productFile.data );

		//Fetch the products of iTunes
		this.game.inAppPurchase.fetchProductsFromStore( this.prods );

	} else {
		//Display Error Message
		alert('Information about the products could not be fetched at this time. Please try again later.');

	}

}


/**
* Executed upon the State being switched to, this method contains the code for initiallising the scroll wheel assets.
**/
sierraShop.createScrollBar = function() {

	//Scroll Wheels
	this.scrollUp = new Kiwi.GameObjects.Sprite(this, this.textures.scrollUp, this.title.width - 10, this.title.height);
	this.scrollDown = new Kiwi.GameObjects.Sprite(this, this.textures.scrollDown, this.title.width - 10, this.game.stage.height - 33);
	var scrollbg = new Kiwi.GameObjects.StaticImage(this, this.textures.scrollbg, this.title.width - 10, this.scrollUp.y + this.scrollUp.height);
	this.scroller = new Kiwi.GameObjects.Sprite(this, this.textures.scroller, this.title.width - 10, this.scrollUp.y + this.scrollUp.height); 

	//Modify the hitbox for the scroll wheel so that it is a bit wider and higher that normal.
	// This is so that there is a more nicer box for the user.
	this.scroller.box.hitbox = new Kiwi.Geom.Rectangle(-50, -50, this.scroller.width + 100, this.scroller.height + 100);


	//Add events for the scroll wheel
	this.scroller.input.onDown.add(this.manualDrag, this);
	this.scroller.input.onUp.add(this.manualDragExit, this);
	this.scrollDown.input.onUp.add(this.moveDown, this);
	this.scrollUp.input.onUp.add(this.moveUp, this);


	//Various Variables for calculating the scroll percentage. 
	this.scrollHeight = 0;
	this.offsetY = 0;
	this.movingAmount = 50;
	this.currentPointer = null;

    this.game.input.touch.maximumPointers = 1; //Forces the user to use a single finger in the store. 


	//Add the scroll wheel
	this.addChild(this.scrollUp);
	this.addChild(this.scrollDown);
	this.addChild(scrollbg);
	this.addChild(this.scroller);
}


/**
* This method is executed when the user initially presses down on the scroll wheel, and starts the scrolling process.
**/
sierraShop.manualDrag = function(owner, pointer) {
	this.currentPointer = pointer;
	this.offsetY = this.scroller.y - pointer.y;
}


/**
* Executed when the user releases his finger from the scroll wheel. Stops the scrolling.
**/
sierraShop.manualDragExit = function(owner, pointer) {
	if(this.currentPointer != null && pointer.id == this.currentPointer.id) {
		this.currentPointer = null;
	}
}


/**
* Executed when the user has pressed the 'up' button for scrolling. Moves the scroll wheel up.
**/
sierraShop.moveUp = function() {
	this.scroll(this.scroller.y - this.movingAmount);
}


/**
* Executed when the user has pressed the 'down' button for scrolling. Moves the scroll wheel down.
**/
sierraShop.moveDown = function() {
	this.scroll(this.scroller.y +  this.movingAmount);
}


/**
* Executed each frame.
**/
sierraShop.update = function() {

	//Call the 'super' states update method.
	Kiwi.State.prototype.update.call(this);

	//Check to see if the user is currently 'scrolling'
	if(this.currentPointer != null) {
		this.scroll(this.currentPointer.y + this.offsetY);
	}
}


/**
* This method is executed when the user is 'scrolling' or has done some scrolling functionality.
* When called it repositions the group (which all the products are a part of) and moves the scroll bar.
**/
sierraShop.scroll = function(y) {

	//Clamp the scroller in-between the up/down buttons
	var maxY = this.scrollDown.y - this.scroller.height;
	var minY = this.scrollUp.y + this.scrollUp.height;

	this.scroller.y = Kiwi.Utils.GameMath.clamp(y, maxY, minY);

	var scrollDist = this.scrollHeight - this.game.stage.height;

	if(scrollDist > 0) {	
		var percent = (this.scroller.y - minY) / (maxY - minY);

		this.prodsGroup.y = -(scrollDist * percent);
	}
}


/**
* Generates and returns new BitmapText gameobject at the location and with the text passed.
**/
sierraShop.generateText = function(text, x, y, width) {

	//Generate a bitmap text field.
	var bit = new Kiwi.Plugins.GameObjects.BitmapText(this, this.textures.adore64, text, x, y);
	if(width) bit.maxWidth = width; 

	bit.alphabeticalCells['.'] = 63;
	bit.alphabeticalCells['!'] = 62;
	bit.alphabeticalCells['$'] = 64;
	bit.alphabeticalCells['#'] = 65;
	bit.alphabeticalCells[' '] = 66;

	return bit;
}


/**
* Executed when the fetch process has started
**/
sierraShop.fetchStarted = function() {
	this.allowPurchases = false;
}


/**
* Executed when fetching the products from iTunes connect failed.
**/
sierraShop.fetchFailed = function() {
	//Fetch failed. Error management here.
	alert('We could not fetch any product information at this point. Please try again later.');
	
	//You own custom error management code would go here.

}


/**
* Executed whn the products have been successfully retrieved.
**/
sierraShop.fetchCompleted = function(products) {

	// If the products in your shop maybe updating all time, with old ones being removed and new ones added, 
	// before you add the products to the local database, you could always remove some of the using the 'removeProduct' method. 
	// This would insure that products that either were not fetched, or no longer exist don't appear
	
	// Example
	
	for(var i = 0; i < this.game.inAppPurchase.products.length; i++) {
		var product = this.game.inAppPurchase.products[i];
		this.game.inAppPurchase.removeProduct(product.productId);
	}
	

	//Loop through the products and add them to the local database
	for(var i = 0; i < products.length; i++) {
		this.game.inAppPurchase.addProduct( products[i] );
	}

	//Allow products to be purchased again
	this.allowPurchases = true;

	this.displayShop();
}


/**
* Updates or Intially displays the shop as well as any products that we want to display on the shop.
**/
sierraShop.displayShop = function() {

	//Destroy all of the products that are currently being displayed.
	for(var i = 0; i < this.prodsGroup.members.length; i++) {
		this.prodsGroup.members[i].destroy();
	}


	//Loop through the database and validate the avaiable products
	var y = 75;
	for(var prods = 0; prods < this.game.inAppPurchase.products.length; prods++) {

		var currentProd = this.game.inAppPurchase.products[prods];

		//Create the GameObjects
		var go = new Kiwi.GameObjects.StaticImage(this, this.textures.singleSword, 20, y);
		var title = this.generateText( currentProd.title, 40 + go.width, y);
		var desc = this.generateText( currentProd.description, 40 + go.width, y + 40, 540 );

		y += 130;

		//Create the price
		var price = this.generateText( currentProd.localizedPrice, 40 + go.width, y);

		// For this example, all the products can only purchase once.
		// So we will first check to see if we have purchased any.
		if(this.game.inAppPurchase.isPurchased( currentProd.productId )) {

			//If we have, then display the 'brought' button
			var btn = new Kiwi.GameObjects.Sprite(this, this.textures.brought, 520, y);

		} else {

			//If not displayed the 'buy now' button
			var btn = new Kiwi.GameObjects.Sprite(this, this.textures.buyNow, 520, y, true);
			btn.productId = this.game.inAppPurchase.products[prods].productId;
			btn.input.onUp.add(this.purchase, this);
		
		}

		y += 60;

		//Add the line seperator to the bottom
		var lineSep = new Kiwi.GameObjects.StaticImage(this, this.textures.lineSeperators, 20, y);
		y += lineSep.height;

		//Add all the gameobjects we have generated to the group.
		this.prodsGroup.addChild(go);			
		this.prodsGroup.addChild(title);
		this.prodsGroup.addChild(desc);
		this.prodsGroup.addChild(price);
		this.prodsGroup.addChild(btn);
		this.prodsGroup.addChild(lineSep);

	}

	this.allowPurchases = true;

	//Calculate how high we have to scroll
	this.scrollHeight = y;
}


/**
* When a product is purchased.
**/
sierraShop.purchase = function(btnOwner) {
	if(this.allowPurchases) {
		this.game.inAppPurchase.purchaseProduct( btnOwner.productId );
	}
}


/**
* When a product purchase starts.
**/
sierraShop.purchaseStarted = function() {
	//Stop other purchases events from going on.
	this.allowPurchases = false;
}


/**
* When a product purchase fails.
**/
sierraShop.purchaseFailed = function(error) {
	//Display an error message, but you may not want to as errors can be returned from the user cancelling the dialog

	//Refresh the screen.
	this.displayShop();
}


/**
* The product has been succesfully purchased.
**/
sierraShop.purchaseComplete = function(purchase) {

	//Display a THANKS message if the purchase was successful
	if(purchase.purchaseState == Kiwi.Plugins.CocoonInAppPurchase.InAppPurchase.PURCHASED) {
		alert('Thanks for purchasing ' + this.game.inAppPurchase.getProductById(purchase.productID).title);
		
		//The rest of your CUSTOM CODE for dealing with purchases would go here.

	}

	//Refresh the screen
	this.displayShop();

}


//The configuration options that we are going to be using for the game
var gameOptions = {
	width: 950, 
	height: 640,
	deviceTarget: Kiwi.TARGET_COCOON,
	plugins: [ 'BitmapText', 'CocoonInAppPurchase'], 
	scaleType: Kiwi.Stage.SCALE_FIT
}

//The main game object.
var game = new Kiwi.Game(null, 'SierraShopGame', sierraShop, gameOptions);	
