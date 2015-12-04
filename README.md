# In-App Purchase Plugin

	Name: InAppPurchase Plugin.
	Version: 1.0.0
	Type: GameObject Plugin
	Author: Kiwi.js Team
	Website: www.kiwijs.org
	KiwiJS last version tested: 1.0.0


## Description

Bring CocoonJS in-app purchase functionality into KiwiJS. Execute Cocoon code more easily, and access products and purchases across the entire game without having to add your own custom management classes.

We suggest you use the [Save Game plugin](https://github.com/gamelab/Save-Manager-Plugin) alongside the In-App Purchase plugin. This allows you to save purchases and currency to `localstorage` on the user's device.

If you have any problems then feel free to contact us via the [www.kiwijs.org](http://www.kiwijs.org/help) help form.


## Versions

1.0.0
- Initial release


## Dependencies

- CocoonJS Premium Account


## Tutorials:

For examples, tutorials, and more information about the In-App Purchasing plugin, visit the [documentation](http://www.kiwijs.org/documentation/tutorials/in-app-purchase-documentation/) page.


## Examples:

Inside the examples folder you can find three different examples of how you can use the In-App Purchase plugin. Each example functions in a different way to show varying methods of how you can implement IAP in your own game.

Note that these examples are built for use in CocoonJS, and may not display as expected in browsers.

### Intro
This first example is a introductory examples of how you can have intergrate IAP into your game. It is the easiest of the examples codewise. In this example the productIDs are hard-coded into the game, which means each time you want to add a new product to your shop, you would have to update the app. No scrolling is added in this example.

### Sierra
The second example is slightly more complex than the first and demonstrates how you can get productIDs and other information off a external server, which the example then uses to valid the products. This way you could easily add products without having to compile and update the app each time.

### BootCamp
Bootcamp is a more robust example. In this example, we are using the platform's shop to buy 'virtual currency', which users can use to purchase weapons in the game. Like the Sierra shop, we are getting the products from an external server, but in this example we are also sending through the platform for which we are requesting the productIDs.


## How to Include

### First Step

Copy either `cocoonInAppPurchase.js` or `cocoonInAppPurchase.min.js` into your project directory. We recommend that you save the files under a `plugins/` directory that lives inside of your project directory, so that you can easily manage all of your plugins, but that is not required.

Now copy across the `CocoonJSExtensions/` folder. You can either put the Extensions folder inside the plugins folder where we put `cocoonInAppPurchase.js`, or you can put it next to the `plugins/` directory, as the files inside of `CocoonJSExtensions/` are not exclusive to this plugin.


### Second Step

Firstly link in all of the javascript files inside of the `CocoonJSExtensions/` folder in the following order. To be safe include these above `kiwi.js` and your own game code :)

- CocoonJS.js
- CocoonJS_Ad.js
- CocoonJS_App.js
- CocoonJS_App_ForCocoonJS.js
- CocoonJS_Store.js

Link in the JavaScript file (`cocoonInAppPurchase.js` or the min version of the file) into your HTML file. Make sure you link it in _underneath_ the link to `kiwi.js` AND underneath all of the Cocoon files.


### Third Step

Now that you have linked in the plugin, the next step is to tell the game to use it. To do so, when you create a new Kiwi.Game you need to pass `CocoonInAppPurchase` as a plugin in the game options. You can see an example of the code below.

```js
var game = new Kiwi.Game(
	"domElement", "GameName", "State",
	{ plugins: [ "CocoonInAppPurchase" ] } );
```

If you are using more than one plugin, such as the Save Game manager, make sure you add them to the array alongside this one.


### Lastly

Now that you have successfully included the plugin, you can start using it. Just access `game.inAppPurchase`!


## Take Note!

* This app will only work if you are making CocoonJS apps and are targeting Cocoon when creating your games. Otherwise unexpected results will happen and the in app purchasing may not work.

* You will still need to have some knowledge of the various markets with the different types of products, and how they are handled/what they can do. We have tutorials on the Kiwi.JS website to help you with that. [www.kiwijs.org/documentation/tutorials/in-app-purchase-documentation](http://www.kiwijs.org/documentation/tutorials/in-app-purchase-documentation/)

* All callbacks are Kiwi Signals, and so take this into account when you try to add callbacks to each property.


## Technical Data


### Purchase / Product Objects

Throughout the plugin and its process two types of object are consistently used: Purchase and Product objects. The following documents the various indexs/namespaces located on them.

Purchase Object
* transactionId
* purchaseTime
* purchaseState - (See below for documentation)
* productId
* quantity


Product Object
* productId
* productAtlas
* productType - (See below for documentation)
* title
* description
* price
* localizedPrice - The localized price of the product if appropriate.
* downloadURL - The URL of any assets needing to be downloaded, can be blank.


### Product Types

A brief list containing the different types of products. See market/platform documentation for more information.

* CONSUMABLE - 0
* NON-CONSUMABLE - 1
* AUTO_RENEWABLE_SUBSCRIPTION - 2
* FREE_SUBSCRIPTION - 3
* NON_RENEWABLE_SUBSCRIPTION - 4

Note: Each product object contains a "productType" index. That index is a number that relates to one of the following on the list above. You can detiremine what a type of product is through STATIC properties located on "Kiwi.Plugins.CocoonInAppPurchase.InAppPurchase.PRODUCT_TYPE"


### Store Types

When developing your app you may need to change certain implementations depending on the type of store. You can get the store being used through either the "storeType" property or the "getStore" method on the "inAppPurchase" object.

* APP_STORE - 0
* PLAY_STORE - 1
* MOCK_STORE - 2
* CHROME_STORE - 3
* AMAZON_STORE - 4
* NOOK_STORE - 5

You can access these STATIC versions of these numbers with the corresponding store type through "Kiwi.Plugins.CocoonInAppPurchase.InAppPurchase.STORE_TYPE"


### Purchase States

When a purchase is complete a `purchaseState` will be on the `purchase` object containing whether the purchase was a success or not.

* PURCHASED - 0
* CANCELED - 1
* REFUNDED - 2
* EXPIRED - 3

You can access STATIC versions of these numbers with the corresponding numbers through `Kiwi.Plugins.CocoonInAppPurchase.InAppPurchase.PURCHASE_STATE`.


### Testing Methods

While testing out your app, you will want to make sure that if the user declines at any part of the transaction, your app will still work. These methods are there to help out with that.

Note: The following methods are used only in the development/testing stages and will NOT work in a production enviroment.

```js
// Simulates the refunding of a purchase.
this.game.inAppPurchase.refundPurchase( transactionId );

// Simulates the cancelation of a purchase.
this.game.inAppPurchase.cancelPurchase( transactionId );

// Simulates the expiration of a purchase
this.game.inAppPurchase.expirePurchase( transactionId );
```
