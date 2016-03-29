# InAppPurchase Plugin for [Kiwi.JS](http://www.kiwijs.org)

	Name: InAppPurchase Plugin.
	Version: 2.0.0
	Type: GameObject Plugin
	Author: KiwiJS Team
	Website: www.kiwijs.org
	KiwiJS last version tested: 1.4.0


## Description

Allows easier access to the the Cocoon in-app purchase functionality into KiwiJS. Access products and purchases across the entire game without having to add your own custom management classes.

We suggest you use the [Save Game plugin](https://github.com/gamelab/Save-Manager-Plugin) alongside the In-App Purchase plugin. This allows you to save purchases and currency to `localstorage` on the user's device.

If you have any problems then feel free to contact us via the [www.kiwijs.org](http://www.kiwijs.org/help) help form.


## Versions

2.0.0
- Refactored API to use latest Cocoon.io plugins.

1.1.0
- Updated to work with latest version of CocoonJS
- Updated Kiwi Version

1.0.0
- Initial release


## Dependencies

- Cocoon.io Account
- Cordova


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

### Second Step

Link in:

`cordova.js`
`kiwi.js`
`cocoonInAppPurchase.js`

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

