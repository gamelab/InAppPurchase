YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Kiwi.Plugins.InAppPurchase"
    ],
    "modules": [
        "Kiwi",
        "Plugins"
    ],
    "allModules": [
        {
            "displayName": "Kiwi",
            "name": "Kiwi"
        },
        {
            "displayName": "Plugins",
            "name": "Plugins",
            "description": "The InAppPurchase plugin is designed to help make intergrating in-app purchase's using CocoonJS with Kiwi easier. \nWhat happens is that when a game that use's this plugin is created, a new manager is added to the 'game' root which is a instanted version of this class, under the property 'inAppPurchase'. You can then access that object to make a purchase or fetch purchases from the store."
        }
    ]
} };
});