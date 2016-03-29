var bootcamp = new Kiwi.State('BootCamp');

var productURL = 'products.php';

bootcamp.preload = function() {

    //Backgrounds
    this.addImage('blackOverlay', 'images/blackOverlay.png', false);
    this.addImage('iapBackground', 'images/background.jpg', false);
    this.addImage('storeBackground', 'images/store-background.png', false);

    this.addImage('inventoryBackground', 'images/inventory.png', false);
    this.addImage('sign', 'images/signs.png', false);

    //Buttons    
    this.addImage('doneButton', 'images/done-button.png', false);
    this.addImage('closeButton', 'images/close-button.png', false);
    this.addImage('buyProdButton', 'images/buy-button.png', false);

    //Text
    this.addTextureAtlas('stencil', 'images/stencil-text.png', 'stencilJson', 'images/stencil-text.json', false);
    this.addSpriteSheet('courier', 'images/courier-text.png', 10, 14, false);

    //Purchase-ables
    this.addSpriteSheet('bombProd', 'images/bomb-sprite.png', 141, 121, false);
    this.addSpriteSheet('firstAidProd', 'images/first-aid-sprite.png', 164, 106, false);
    this.addSpriteSheet('flamerProd', 'images/flamer-sprite.png', 220, 151, false);
    this.addSpriteSheet('molotovProd', 'images/molotov-sprite.png', 105, 104, false);
    this.addSpriteSheet('rocketProd', 'images/rocket-sprite.png', 249, 114, false);

    //Products
    this.addSpriteSheet('credits', 'images/credits-buttons.png', 119, 64, false);
    this.addImage('prices', 'images/prices.png', false);
    this.addSpriteSheet('posters', 'images/posters.png', 177, 243, false);

    //Inventory
    this.addImage('flamerInventory', 'images/flamethrower-inventory.png', false);
    this.addImage('molotovInventory', 'images/molotov-inventory.png', false);
    this.addImage('rpgInventory', 'images/rpg-inventory.png', false);
    this.addImage('healthInventory', 'images/health-inventory.png', false);
    this.addImage('bombInventory', 'images/bomb-inventory.png', false);


    //Request product information for the platform we are using. 
    this.addJSON('products', productURL, false);
}




/**
* The init method only gets call once. This is the first time the state is switched to. 
**/
bootcamp.init = function() {
	this.purchasing = false;

    this.game.inAppPurchase.onPurchaseFailed.add(this.purchaseFailed, this);
    this.game.inAppPurchase.onPurchaseComplete.add(this.purchaseComplete, this);

    //The ids of the products we will have on the store...
    this.productIds = [];
    this.productInfo = [];

    //Initalise the store... managed mode - sandbox enviroment
    this.game.inAppPurchase.init(false, true);
}




/**
* The create method is executed each time this state is switched to. 
**/
bootcamp.create = function() {

    //Has the user been to the shop before, and so does he have any money?
    if( this.game.saveManager.exists('dollars') ) {
    	//Get the amount of dollars he has.
        this.dollars = this.game.saveManager.getData('dollars');
        if(this.dollars === null) this.dollars = 0;

    } else {
    	//No, so set the amount they have
        this.dollars = 1500; //Default amount
        this.game.saveManager.add('dollars', this.dollars, true);
    }

    //Has the user purchased any weapons/items before?
    if( this.game.saveManager.exists('items') ) {
    	//If so, then get them.
    	this.items = this.game.saveManager.getData('items');

    } else {
    	//No, so lets create it now.
    	this.items = { 
    		'First Aid': 0,
    		'Bomb': 0,
    		'Flamer': 0,
    		'Molotov': 0,
    		'Rocket': 0
    	};
    	this.game.saveManager.add('items', this.items, true);

    }


    //Create the background items 
    this.bg = new Kiwi.GameObjects.StaticImage(this, this.textures.iapBackground, 0, 0);    
    this.doneBtn = new Kiwi.GameObjects.Sprite(this, this.textures.doneButton, 584, 425, true);
    this.buyCredits = new Kiwi.GameObjects.Sprite(this, this.textures.sign, 10, 0, true);
    this.buyProd = new Kiwi.GameObjects.Sprite(this, this.textures.buyProdButton, 589, 187, true);
    this.dollarText = new StencilText(this, this.textures.stencil, String(this.dollars), 105, 34);
    this.inventory = new Kiwi.GameObjects.StaticImage(this, this.textures.inventoryBackground, 35, 100);

    //Make the text a bit smaller when displaying the text
    this.dollarText.scaleX = 0.6;
    this.dollarText.scaleY = 0.6;

    //Title / Credit GameObjects 
    this.titleText = new StencilText(this, this.textures.stencil, '', 460, 55);
    this.creditText = new StencilText(this, this.textures.stencil, '', 460, 190);
    this.creditUnderneathText = new StencilText(this, this.textures.stencil, 'Credits', 460, 225);
    this.courierText = new CourierText(this, this.textures.courier, '', 460, 100);

    this.creditUnderneathText.visible = false;
    this.creditUnderneathText.transform.scale = 0.5;
    this.courierText.maxWidth = 280;


    // A list of all the 'In Game' Products which users can buy using their 'war bonds'.
    this.products = [
        new InGameProduct(this, this.textures.firstAidProd, 25, 390, this.textures.healthInventory, 51, 136, 100, 'First Aid', 'A well stocked first-aid kit will help you handle an emergency at a moments notice.', this.items['First Aid']),
        new InGameProduct(this, this.textures.bombProd, 610, 285, this.textures.bombInventory, 59, 244, 200, 'Bomb', 'This ranged explosive weapon will go as far as you can throw it! Note, We are not responsible for your lack of throwing ability.', this.items['Bomb']),
        new InGameProduct(this, this.textures.flamerProd, 425, 305, this.textures.flamerInventory, 51, 353,  2000, 'Flamer', 'This mechanical incendiary device projects a long stream of controllable fire.', this.items['Flamer']),
        new InGameProduct(this, this.textures.molotovProd, 250, 300, this.textures.molotovInventory, 63, 297,  150, 'Molotov', 'Set your foes ablaze with this easy to use throwing implement.', this.items['Molotov']),
        new InGameProduct(this, this.textures.rocketProd, 200, 380, this.textures.rpgInventory, 46, 196, 1500, 'Rocket', 'Blast enemies to pieces with this hi-tech explosives delivery mechanism. Destruction guaranteed!', this.items['Rocket'])
    ];


    //Shop Overlap gameobjects, which are displayed when the user wants to buy more 'war-bonds'.
    this.black = new Kiwi.GameObjects.StaticImage(this, this.textures.blackOverlay, 0, 0);
    this.shopGroup = new Kiwi.Group(this, 0, 0);
    this.storeBg = new Kiwi.GameObjects.StaticImage(this, this.textures.storeBackground, 50, 0);
    this.closeButton = new Kiwi.GameObjects.Sprite(this, this.textures.closeButton, 666, 45);

    //Misc Variables
    this.activeProduct = null;
    this.purchaseAreaBtns = [];


    //Tweens
    this.shopGroupTween = this.game.tweens.create(this.shopGroup);
    this.blackTween = this.game.tweens.create(this.black);
    this.fadeoutTweenBlack = this.game.tweens.create(this.black);
    this.fadeoutTweenBlack.onComplete(this.vanish, this);


    //General Callbacks
    this.doneBtn.input.onUp.add(this.switchBackHome, this);
    this.buyCredits.input.onUp.add(this.buyMoreMoney, this);
    this.closeButton.input.onUp.add(this.closeMoneyScreen, this);


    //Disable the buy button
    this.buyProd.input.onUp.add(this.buyCurrentProduct, this);
    this.buyProd.visible = false;
    this.buyProd.input.enabled = false;


    //Disable the 'overlap' items.
    this.black.visible = false;
    this.closeButton.visible = false;
    this.storeBg.visible = false;
    this.closeButton.input.enabled = false;


    //Add the gameobjects to the to Stage.
    this.addChild(this.bg);
    this.addChild(this.doneBtn);
    this.addChild(this.inventory);
    this.addChild(this.buyCredits);
    this.addChild(this.buyProd);
    this.addChild(this.dollarText);

    this.addChild(this.titleText);
    this.addChild(this.courierText);
    this.addChild(this.creditText);
    this.addChild(this.creditUnderneathText);


    //Add the products to the stage, plus add callbacks for when they are clicked
    for(var i = 0; i < this.products.length; i++) {
        this.products[i].addToState(); 
        //We will change the context to the product class when it is clicked.
        this.products[i].product.input.onUp.add(this.activateProduct, this.products[i]);
    }

    
    //Store Overlaps
    this.addChild(this.black);
    this.addChild(this.shopGroup);
    this.shopGroup.addChildAt(this.storeBg, 0);
    this.shopGroup.addChildAfter(this.closeButton, this.storeBg);   


    //If the store is available and the products were loaded successfully loaded then we can continue.
    if(this.data.products.hasError == false) {

    	//Retrieve the data.
    	var data = JSON.parse(this.data.products.data);

    	//If the server has returned to us an error, then we cannot continue, so kill the script and end.
    	if(typeof data.error !== "undefined") {
			alert( data.error );
			return;
		}
		
		//Otherwise we have the product information
		this.productInfo = data;
		this.productIds = [];

		//Create productID list
		for(var i in this.productInfo) {
			this.productIds.push( this.productInfo[i].id );
		}

        if( this.game.inAppPurchase.init( this.productIds, this.fetchComplete, this ) ) {
            return;
        }
    } 

	//Error management code, generic error inbound.
	alert('Sorry, the store is not available at the moment. Please try again later.');
	return;
    
}


/**
* Called when a product is 'clicked' and the user wants to purchase it. 
*/
bootcamp.activateProduct = function() {

	var owner = this;
	var state = owner.state;

    //Disable currently active product
    if(state.activeProduct !== null) {
        state.activeProduct.product.cellIndex = 0;
    }

    if(owner !== null) {
        state.activeProduct = owner;
        state.activeProduct.product.cellIndex = 1;

        //Move the new 'active' product to the front.
        state.swapChildren(state.products[state.products.length - 1], owner);


        //'Board' Management
        state.buyProd.visible = true;
        state.buyProd.input.enabled = true;
        state.creditUnderneathText.visible = true;

        state.titleText.text = state.activeProduct.name;
        state.courierText.text = state.activeProduct.description;
        state.creditText.text = String( state.activeProduct.price );

    }
}


/**
* When the user wants to buy the current product.
*/
bootcamp.buyCurrentProduct = function() {

    //To make sure they 'can' buy the current product.
    if(this.buyProd.visible == true && this.activeProduct !== null) {

        if(this.dollars - this.activeProduct.price < 0) {
            //No can do little buddy

            //Display 
            alert('Sorry, you dont have enough credit :(' + "\n" + 'Buy some more!');

        } else {

        	//Increment the amount of items the user has by one.
        	this.items[ this.activeProduct.name ]++;

        	//Update the items in the saveManager and in the listing
        	this.game.saveManager.edit('items', this.items, true);
        	this.activeProduct.changeAmount( this.items[this.activeProduct.name] );

            //Spend user credits here....
        	this.updateDollars(this.dollars - this.activeProduct.price);

        }
    }

}


/**
* Updates the amount of money they have.
**/
bootcamp.updateDollars = function(newAmount) {
    this.dollars = newAmount;
    this.dollarText.text = String(this.dollars);
    this.game.saveManager.edit('dollars', this.dollars, true);
}


/**
* Update loop, which is executed each frame. 
*/
bootcamp.update = function() {
    Kiwi.State.prototype.update.call(this);

    if(this.fadeoutTweenBlack.isRunning) {
        for(var i = 0; i < this.shopGroup.members.length; i++) {
            this.shopGroup.members[i].alpha = this.black.alpha;
        }
    }

}


/**
* Shop view for buying more 'war-bonds'.
*/
bootcamp.buyMoreMoney = function() {

    //Enable the 'overlap' items.
    this.black.visible = true;
    this.closeButton.visible = true;
    this.storeBg.visible = true;
    this.closeButton.input.enabled = true;

    for(var i = 0; i < this.purchaseAreaBtns.length; i++) {
        if(typeof this.purchaseAreaBtns[i].input !== "undefined") {
            this.purchaseAreaBtns[i].input.enabled = true;
        }
        this.purchaseAreaBtns[i].visible = true;
    }

    //Disable the underneath inputs.
    this.buyProd.input.enabled = false;
    this.doneBtn.input.enabled = false;
    this.buyCredits.input.enabled = false;
    for(var i = 0; i < this.products.length; i++) {
        this.products[i].product.input.enabled = false;
    }

    //'hide' the items.
    this.black.alpha = 0;
    this.shopGroup.y = -this.storeBg.height;
    for(var i = 0; i < this.shopGroup.members.length; i++) {
        this.shopGroup.members[i].alpha = 1;
    }

    this.shopGroupTween.to({y: 0}, 500, Kiwi.Animations.Tweens.Easing.Bounce.Out, true);
    this.blackTween.to({alpha: 1}, 250, Kiwi.Animations.Tweens.Easing.Linear.None, true);

}


/**
* Closes the 'shop' view.
*/
bootcamp.closeMoneyScreen = function() {

    //Start the fade out tweens. 
    this.fadeoutTweenBlack.to({ alpha: 0 }, 250, Kiwi.Animations.Tweens.Easing.Linear.None, true);

}


/**
* Vanish.
**/
bootcamp.vanish = function() {
    
    //Hide the already invisble items
    this.black.visible = false;
    this.closeButton.visible = false;
    this.storeBg.visible = false;
    this.closeButton.input.enabled = false;

    for(var i = 0; i < this.purchaseAreaBtns.length; i++) {
        if(typeof this.purchaseAreaBtns[i].input !== "undefined") {
            this.purchaseAreaBtns[i].input.enabled = false;
        }
        this.purchaseAreaBtns[i].visible = false;
    }

    //'Re' enable the shop.
    this.buyCredits.input.enabled = true;
    this.doneBtn.input.enabled = true;
    for(var i = 0; i < this.products.length; i++) {
        this.products[i].product.input.enabled = true;
    }

    if(this.activeProduct !== null) 
    	this.activateProduct.call( this.activeProduct );
    
}


/**
* Purchase Callbacks. Used store extension calls them. 
*/
bootcamp.fetchFailed = function() {
    
    //Alert that nothing can be brought...
    alert('Sorry we could not connect to the shop. To purchase more war-bonds, please insure you have a internet connection and try again.');

    //Add 'Sorry overlay on the store'..

}


/**
* When products have been validate from the platforms store.
**/
bootcamp.fetchComplete = function(error, products) {

    if( error ) {
        this.fetchFailed( error );
        return;
    }

	//Loop through the avaiable products
    for(var i = 0; i < products.length; i++) {

    	//Check to see if that products we have available matches one we requested.
        var prod = products[i];
        var index = this.productIds.indexOf( prod.productId );

        //If so, then display the poster for that product
        if(index !== -1) {


            //Create the GameObjects
            var poster = new ProductPurchaseButton(this, this.textures.posters, 96 + 201 * index, 104, prod );
            var price = new ProductPurchaseButton(this, this.textures.credits, 130 + 200 * index, poster.y + poster.height, prod);
            var btn = new ProductPurchaseButton(this, this.textures.prices, 100 + 200 * index, price.y + price.height, prod)
            var text = new StencilText(this, this.textures.stencil, String(prod.localizedPrice), btn.x + 40, btn.y + 26 );


            //Change the cell to be relative to what is being displayed
            poster.cellIndex = index;
            price.cellIndex = index;

            //Add callbacks
            btn.input.onUp.add(this.purchaseCredits, this);
            price.input.onUp.add(this.purchaseCredits, this);
            poster.input.onUp.add(this.purchaseCredits, this);

            //The visiblity of the gameobjects is the inverse value of if the buy-more-credits buttons able to be clicked or not
            poster.visible = !this.buyCredits.input.enabled;
            price.visible = !this.buyCredits.input.enabled;
            btn.visible = !this.buyCredits.input.enabled;
            text.visible = !this.buyCredits.input.enabled;

            //Enable/Disable the buttons
            poster.input.enabled = !this.buyCredits.input.enabled;
            price.input.enabled = !this.buyCredits.input.enabled;
            btn.input.enabled = !this.buyCredits.input.enabled;

            //Add to the 'hit-area' the purchase btns
            this.purchaseAreaBtns.push( poster );
            this.purchaseAreaBtns.push( price );
            this.purchaseAreaBtns.push( btn );
            this.purchaseAreaBtns.push( text );

            //Add them to the screen
            this.shopGroup.addChild( poster );
            this.shopGroup.addChild( price );
            this.shopGroup.addChild( btn );
            this.shopGroup.addChild( text );

        }


    }

}


/**
* This method is called when a purchase has failed.
**/
bootcamp.purchaseFailed = function(error, productId) {

    //Display POP-UP that the purchase failed. 
    //Perhaps not want to do each time as events fire for user cancellation
    alert( productId + ' failed to be purchased. ' );
    this.purchasing = false;

}


/**
* Executed when a purchase is completed.
* Because we set 'autoCosume' to true, the transaction will be automatically consumed for use,
* so all we need to worry about is giving money to the user.
**/
bootcamp.purchaseComplete = function(purchase) {

    //Add the credits 
    switch( purchase.productId ) {

        case this.productInfo.first.id:
            this.updateDollars( this.dollars + this.productInfo.first.amount );
            break;

        case this.productInfo.second.id:
            this.updateDollars( this.dollars + this.productInfo.second.amount );
            break;

        case this.productInfo.third.id:
            this.updateDollars( this.dollars + this.productInfo.third.amount );
            break;

    }

} 


/**
* When the user goes to purchase credits. 
**/
bootcamp.purchaseCredits = function(owner) {
    if(owner.product !== null && this.purchasing == false) {

        //Purchase the product
        this.game.inAppPurchase.purchase( owner.product.productId );

    }
} 


/**
* When the 'done' button has been clicked. Will mean
**/
bootcamp.switchBackHome = function() {
	//Switch back to main game state/screen after store screen.
}


/**
* Create the main game.
**/


var gameOptions = {
	width: 768, 
	height: 512,
	deviceTarget: Kiwi.TARGET_COCOON,
	scaleType: Kiwi.Stage.SCALE_FIT,
	plugins:['SaveGame', 'InAppPurchase', 'BitmapText']
}


var game = new Kiwi.Game(null, 'BootCampGame', bootcamp, gameOptions);