/**
* This file contains the custom classes which extend Kiwi GameObjects to bring additional functionality.
* 
**/


/*
* The GameObject of an InGameProduct, this contains the price, name and description for the product
* 
*/
var InGameProduct = function(state, pTexture, pX, pY, iTexture, iX, iY, price, name, description, amount) {

    var textOffsetX = 110;

    this.product = new Kiwi.GameObjects.Sprite(state, pTexture, pX, pY, true);
    this.inventory = new Kiwi.GameObjects.StaticImage(state, iTexture, iX, iY);
    this.text = new Kiwi.GameObjects.Textfield(state, String(amount), textOffsetX, iY + this.inventory.height - 6, '#fff', 12);
    this.text.textAlign = 'right';


    this.price = price;
    this.name = name;
    this.description = description;
    this.state = state;
    this.amount = amount;

    this.inventory.visible = (this.amount > 0);

}

//Executed when the amount of an item increases.
InGameProduct.prototype.changeAmount = function(newAmount) {
    //Increase the amount
    this.amount = newAmount;
    this.inventory.visible = (this.amount > 0);

    //Change the text
    this.text.text = String(this.amount);

}

InGameProduct.prototype.addToState = function() {
    this.state.addChild(this.inventory);
    this.state.addChild(this.text);
    this.state.addChild(this.product);
}


/**
* The GameObject of an Product for purchase off the Platforms Store.
* Contains the product information.
*/
var ProductPurchaseButton = function(state, texture, x, y, product) {
    Kiwi.GameObjects.Sprite.call(this, state, texture, x, y, true);
    this.product = product;
}

Kiwi.extend(ProductPurchaseButton, Kiwi.GameObjects.Sprite);


/**
* The GameObject for StencilText. 
* A custom gameobject, so that we can easily remap the cells used.
*/
var StencilText = function(state, texture, text, x, y) {
    Kiwi.Plugins.GameObjects.BitmapText.call(this, state, texture, text, x, y);

    this.alphabeticalCells = { 
        a:0,    A:0,
        b:1,    B:1,
        c:2,    C:2,
        d:3,    D:3,
        e:4,    E:4,
        f:5,    F:5,
        g:6,    G:6,
        h:7,    H:7,
        i:8,    I:8,
        j:9,    J:9,
        k:10,    K:10,
        l:11,    L:11,
        m:12,    M:12,
        n:13,    N:13,
        o:14,    O:14,
        p:15,    P:15,
        q:16,    Q:16,
        r:17,    R:17,
        s:18,    S:18,
        t:19,    T:19,
        u:20,    U:20,
        v:21,    V:21,
        w:22,    W:22,
        x:23,    X:23,
        y:24,    Y:24,
        z:25,    Z:25,
        "0":26,  "1":27,
        "2":28,  "3":29,
        "4":30,  "5":31,
        "6":42,  "7":32,
        "8":33,  "9":34,
        ".":35,  "$":36,
        ",":37,  "!":38,
        "#":39,  ' ':40,
        '&':41
    };

    this.defaultCell = 41;
}

Kiwi.extend(StencilText, Kiwi.Plugins.GameObjects.BitmapText); 


/**
* The GameObject for StencilText. 
* A custom gameobject, so that we can easily remap the cells used.
*/
var CourierText = function(state, texture, text, x, y) {
    Kiwi.Plugins.GameObjects.BitmapText.call(this, state, texture, text, x, y);

}

Kiwi.extend(CourierText, Kiwi.Plugins.GameObjects.BitmapText); 