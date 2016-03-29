# InAppPurchase Plugin for [Kiwi.JS](http://www.kiwijs.org)

	Name: InAppPurchase Plugin.
	Version: 2.0.0
	Type: GameObject Plugin
	Author: KiwiJS Team
	Website: www.kiwijs.org
	KiwiJS last version tested: 1.4.0


## Description

Allows easy access of Cocoon IAP functionality in KiwiJS. 

This plugin requires that your App is made using Cordova to successfully work. We recommend using [Cocoon.io](https://cocoon.io/home).

If you have any problems then feel free to contact us via the [www.kiwijs.org](http://www.kiwijs.org/help) help form.


## Versions

2.0.0
- Refactored API to use latest Cocoon.io plugin.

1.1.0
- Updated to work with latest version of CocoonJS
- Updated Kiwi Version

1.0.0
- Initial release


## Dependencies
- Cordova OR Cocoon.io

## How to Use

### Include Cordova

Make sure that your main HTML file you have linked in the `cordova` javascript file. 

```html
<script src="cordova.js"></script>
```

This file handles loading the cocoon plugin dependencies. 

### Include the plugin JavaScript

Copy the `in-app-purchase-x.x.x.js` into your project directory. 

Link in the JavaScript file `in-app-purchase-x.x.x.js` into your main HTML file. Make sure you link it in _underneath_ the link to `kiwi.js`.

### Add to the Kiwi Game

Now that you have linked in the plugin, the next step is to tell the game to use it. To do so, when you create a new Kiwi.Game you need to pass `CocoonInAppPurchase` as a plugin in the game options. You can see an example of the code below.

```js
var game = new Kiwi.Game(
	"domElement", "GameName", "State",
	{ plugins: [ "CocoonInAppPurchase" ] } );
```

If you are using more than one plugin, such as the Save Game manager, make sure you add them to the array alongside this one.

### Create your Cocoon Project

If you haven't done so already, create your project on [Cocoon.io](https://cocoon.io/home).

Alternatively you can also create your project using Cordova.

### Include the Plugins 

Navigate to your project (either using Cordova, or Cocoon.io) and then include the [IAP plugins](http://docs.cocoon.io/article/migration-guide/#InApp_Purchases_Plugins) for your projects supported platforms.

### Compile a Developer App

If you are using Cocoon.io you can test your IAPs by compiling a Developer App. 

To test IAPs you need to have an app with your settings.

### Lastly

Now that you have successfully included the plugin, you can start using it. Just access `game.inAppPurchase`!

