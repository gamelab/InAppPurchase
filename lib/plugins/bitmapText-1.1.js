/**
* A Object that outlines the information related to this BitmapText Plugin. Aka the name and version of it. 
* 
* @module Kiwi
* @submodule Plugins
* @namespace Kiwi.Plugins
* @class BitmapText
*/
Kiwi.Plugins.BitmapText = {
    /**
    * The name of this plugin.
    * @property name
    * @default 'BitmapText'
    * @public
    */
	name: 'BitmapText',
    /**
    * The version of this plugin.
    * @property version
    * @default '1.1'
    */
	version: '1.1'
}
	
Kiwi.PluginManager.register(Kiwi.Plugins.BitmapText);


//Do Kiwi Plugin GameObjects Exist?
if( typeof Kiwi.Plugins.GameObjects == "undefined") {
    Kiwi.Plugins.GameObjects = {}; 
}


/**
* A Kiwi Plugin GameObject that is useful for display bitmap text in a Kiwi Game.
* Works in a very similar fashion to the default 'TextField' GameObject included in the core of Kiwi except this one requires a Texture Atlas passed   
* And you can also set the maximum width of the Text to make them span multiple lines.
* 
* @class BitmapText
* @extends Entity
* @namespace Kiwi.Plugins.GameObjects
* @constructor
* @param state {State} The State that this gameobject belongs to.
* @param atlas {TextureAtlas|SpriteSheet} The spritesheet or textureatlas that holds the font.
* @param text {String} The text to display. Can be changed later.
* @param x {Number} The gameobjects coordinates on the x-axis.
* @param y {Number} The gameobjects coordinates on the y-axis.
*/
Kiwi.Plugins.GameObjects.BitmapText = function(state, atlas, text, x, y) {
    //Call the parent.
    Kiwi.Entity.call(this, state, x, y);

    if(typeof text == "undefined") text = null;

    /**
    * The 'alphabeticalCells' is an object is used to reference which cell of the texture atlas should be used for aech string character.
    * This isn't a 'robust' object by far (doesn't contain every string character there can be) 
    * But you can add those as you needs see fit. 
    *   
    * @property _alphabeticalCells
    * @private 
    * @type Array
    */
    this._alphabeticalCells = { 
        a:26,    A:0,
        b:27,    B:1,
        c:28,    C:2,
        d:29,    D:3,
        e:30,    E:4,
        f:31,    F:5,
        g:32,    G:6,
        h:33,    H:7,
        i:34,    I:8,
        j:35,    J:9,
        k:36,    K:10,
        l:37,    L:11,
        m:38,    M:12,
        n:39,    N:13,
        o:40,    O:14,
        p:41,    P:15,
        q:42,    Q:16,
        r:43,    R:17,
        s:44,    S:18,
        t:45,    T:19,
        u:46,    U:20,
        v:47,    V:21,
        w:48,    W:22,
        x:49,    X:23,
        y:50,    Y:24,
        z:51,    Z:25,
        "0":52,  "1":53,
        "2":54,  "3":55,
        "4":56,  "5":57,
        "6":58,  "7":59,
        "8":60,  "9":61,
        ".":62,  "$":63,
        ",":64,  "!":65,
        "#":66,  ' ':67
    };

    /**
    * An array of Punctation characters that are used to 'seperate' words but stay on at the end of word they are 'attached' to.
    * @property punctionationChars 
    * @type String[]
    * @public
    */
    this.punctionationChars = ['.', '!', '?', ':', ';', ',', '-'];

    /**
    * The default cell that is to be used when a cell could not be found for a particular character.
    * Currently the default is the same as what a 'space' would be.
    * @property defaultCell
    * @default 67
    * @public
    * @type number
    */
    this.defaultCell = 67;
    

    /**
    * The texture atlas that the bitmapText lies on.
    * @property atlas
    * @type TextureAtlas
    * @public
    */
    this.atlas = atlas;
    

    /**
    * The text that is to be rendered in the BitmapTextfield.
    * @property text
    * @type String
    * @private
    */
    this.text = text;


    /**
    * If the atlas used is 'supported' or not.
    * @property supported
    * @type Boolean
    * @public
    */
    this.supported = true;


    /**
    * If the gameobject is 'dirty' and needs 're-rendering' or not.
    * @property _tempDirty
    * @type Boolean
    * @private
    */
    this._tempDirty = true;


    /**
    * The maximum width of the TextField. Set to 'null' if no maximum width is desired.
    * Aka. If the text is to be all on one line.
    * @property maxWidth
    * @type number
    * @public
    */
    this.maxWidth = null;


    /**
    * A INTERNAL plugin property, that is used when desiding which characters should go on which lines.
    * @property _lines
    * @type Array
    * @private
    */
    this._lines = [];


    /**
    * Which way the text should be in alignment.
    * @property _align
    * @type Number
    * @private
    * @default LEFT
    */
    this._align = Kiwi.Plugins.GameObjects.BitmapText.LEFT;


    //Check to see if a valid atlas was passed.
    if(this.atlas.type == Kiwi.Textures.TextureAtlas.SINGLE_IMAGE) {
        
        this.supported = false;
        if(this.game.debugOption == Kiwi.DEBUG_ON) console.log('Single Images will not work with the Bitmap Text GameObject!');
    
    } else {

        //Create a temporary canvas and set-up more gameobject management variables.

        if( this.game.renderOption === Kiwi.RENDERER_WEBGL) {
            this.glRenderer = this.game.renderer.requestSharedRenderer("TextureAtlasRenderer");
        
        } else {
            /**
            * A INTERNAL plugin property, that is used to render the text onto intially. And then this canvas is rendered onto the main one.
            * @property _tempCanvas
            * @type HTMLCanvasElement
            * @private
            */
            this._tempCanvas = document.createElement('canvas');

            //Set the inital width/height to be base2. Will be overriden the first time the text is rendered.
            this._tempCanvas.width = 2;
            this._tempCanvas.height = 2;

            /**
            * A INTERNAL plugin property, the 2d context for the temporary canvas.
            * @property _tempCtx
            * @type HTMLCanvasContent
            * @private
            */
            this._tempCtx = this._tempCanvas.getContext('2d');
        }

        /**
        * A INTERNAL plugin property, holds the width (or what it should be) of the text.
        * @property _tempWidth
        * @type Number
        * @private
        */
        this._tempWidth = 0;

        /**
        * A INTERNAL plugin property, holds the height (or what it should be) of the text.
        * @property _tempHeight
        * @type Number
        * @private
        */
        this._tempHeight = 0;

        /**
        * A INTERNAL plugin property that holds the current 'word' who's individual character lines are being detiremined.
        * @property _tempWord
        * @type Array
        * @private
        */
        this._tempWord = [];

    }
}


Kiwi.extend(Kiwi.Plugins.GameObjects.BitmapText, Kiwi.Entity);


/**
* The 'alphabeticalCells' is an object is used to reference which cell of the texture atlas should be used for each string character.
* This isn't a 'robust' object by far (doesn't contain every string character there can be) 
* But you can add those as you needs see fit. 
*   
* @property alphabeticalCells
* @public
* @type Array
*/
Object.defineProperty(Kiwi.Plugins.GameObjects.BitmapText.prototype, "alphabeticalCells", {
    get: function() {
        return this._alphabeticalCells;
    },
    set: function(val) {
        //Re-render
        this._tempDirty = true;
        this._alphabeticalCells = val;
    },
    enumerable: true,
    configurable: true
});


/**
* Which way the text should be in alignment.
* @property align
* @type Number
* @public
* @default LEFT
*/
Object.defineProperty(Kiwi.Plugins.GameObjects.BitmapText.prototype, "align", {
    get: function() {
        return this._align;
    },
    set: function(val) {
        //Re-render
        this._tempDirty = true;
        this._align = val;
    },
    enumerable: true,
    configurable: true
});



/**
* Updates the string-cell references on the 'alphabeticalCells' property of this object based on an object that is passed.
* The object passed doesn't have to contain every character-cell refernce, only those that are to be changed.
*
* @method remap
* @param obj {Object} 
* @public  
*/ 
Kiwi.Plugins.GameObjects.BitmapText.prototype.remap = function(obj) {

    for(var i in obj) {
        this.alphabeticalCells[i] = obj[i];
    }

}


/**
* A STATIC method used to update all the 'alphabeticalCells' of bitmaptext objects passed, with an object that is also passed. 
* Note: This just calls the remap method on the gameobjects,  
*
* @method remap
* @static
* @param bitmapTextObjects {BitmapText}
* @param obj {Object}
* @public 
*/
Kiwi.Plugins.GameObjects.BitmapText.remap = function(list, obj) {

    for(var bgo in list) {
        list[bgo].remap(obj);
    }

}


/**
* The text that is to be rendered in the BitmapTextfield.
* @property text
* @type String
* @public
*/
Object.defineProperty(Kiwi.Plugins.GameObjects.BitmapText.prototype, "text", {
    get: function() {
        return this._text;
    },
    set: function(val) {
        //Re-render
        this._tempDirty = true;
        this._text = val;
    },
    enumerable: true,
    configurable: true
});



/**
* The actual width of the text. This property is READ ONLY, and does not directly affect anything.
* @property width
* @type Number
* @public
*/
Object.defineProperty(Kiwi.Plugins.GameObjects.BitmapText.prototype, "width", {
    get: function() {
        return this._tempWidth;
    },
    enumerable: true,
    configurable: true
});


/**
* The update loop for this bitmap text object.
* @method update
* @public
* 
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype.update = function() {
    Kiwi.Entity.prototype.update.call(this);
}


/**
* An method that return's the CELL number that will be used for a character that is passed.
* @method cellNumber
* @param character {string} The character that you want to check to see which cell will be used.
* @return {number} The CELL number that will be used.
* @public
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype.cellNumber = function(character) {

    //do we have a cell reference for that character?
    var alpha = this.alphabeticalCells[ character ];

    if(typeof alpha === "undefined") {
        return this.defaultCell;
    } else {
        return alpha;
    }

}


/**
* An INTERNAL method that is used figure out which cell is to be used for each character in the text.
* This is method is only for Bitmap text objects that don't have a maximum width set, so the text won't be spanning multiple lines.
* Should NOT be called by the developer/external objects. 
* 
* @method _singleLineText
* @private
*/ 
Kiwi.Plugins.GameObjects.BitmapText.prototype._singleLineText = function() {

    //loop through the text
     for(var i = 0; i < this.text.length; i++) {

        var cell = this.atlas.cells[ this.cellNumber( this.text[i] ) ];

        if(typeof cell !== "undefined" && typeof cell !== null) {

            //calculate the height..
            if(cell.h > this._tempHeight ) this._tempHeight = cell.h; 

            //Calculate the width
            this._tempWidth += parseInt( cell.w );
        }

        //Add the text to the next line.
        this._lines[this._lines.length - 1].text.push( cell );
    }

    //Add the width
    this._lines[this._lines.length - 1].width = this._tempWidth;

}


/**
* An INTERNAL method that is used to figure out which cell is to be used for each character in the text. 
* Also figures out which lines the characters/words should go on and this method is used for BitmapText's with a maximum width set (as they could span multiple lines).
* Should NOT be called by the developer/external objects.
* 
* @method _multiLineText
* @private
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype._multiLineText = function() {

    //Contains the cells/characters of the last word that is to be added.
    this._tempWord = [];

    //Calculate the height/width?...
    for(var i = 0; i < this.text.length; i++) {

        //Get the cell relating to the current text.
        var cell = this.atlas.cells[ this.cellNumber( this.text[i] ) ];

        if(typeof cell !== "undefined" && typeof cell !== null) {

            //This is a new space?
            if( this.text[i] == ' ' || this._tempWord.length == 1 && this._tempWord[0].char === ' ') {
                this._addTempWord();
            }



            //Get what would be the new width
            var cw = this._tempWidth + parseInt( cell.w );

            //Would it extend past the maxWidth?
            if(cw >= this.maxWidth) {

                //Calculate the current width of the new line.
                this._tempWidth = 0;
                for(var w = 0; w < this._tempWord.length; w++) {
                    this._tempWidth += parseInt( this._tempWord[w].cell.w );
                }
                this._tempWidth += parseInt( cell.w );


                //Generate the new line
                this._lines.push( {text:[], height:0, width: 0} );


            //Otherwise add the width to it
            } else {
                this._tempWidth = cw;

            }


            //Does the new height extend past the regular height?
            if(this._lines[this._lines.length - 1].height < cell.h) this._lines[this._lines.length - 1].height = cell.h;

            //Add the cell to the temp word storage
            this._tempWord.push( {'cell':cell, 'char': this.text[i], 'line': this._lines.length - 1, 'cw': this._tempWidth } );
    


            //This is a punction character?
            if( this.punctionationChars.indexOf( this.text[i] ) !== -1 ) {

                this._addTempWord();

            }

        }

    }

    //Add the last '_tempWord' to the canvas.
    this._addTempWord();

    //If so re-calculate the total height that the canvas should be.
    this._tempHeight = 0;
    for(var i = 0; i < this._lines.length; i++) {
        this._tempHeight += this._lines[i].height;
    }


    if(this._lines.length > 0) this._tempWidth = this.maxWidth;
}

/**
* A INTERNAL method which is used during the multiline text to start to add the '_tempWord' to the lines.
* @method _addTempWord
* @private
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype._addTempWord = function() {

    if(typeof this._tempWord[0] != "undefined" && this._tempWord[this._tempWord.length - 1].line - this._tempWord[0].line > 1) {

        this._multiLineTextBreak();

    } else {

        //Loop through the word, and add it to the current line.
        for(var t = 0; t < this._tempWord.length; t++) {
            this._lines[this._lines.length - 1].text.push( this._tempWord[t].cell );
            this._lines[this._lines.length - 1].width += this._tempWord[t].cell.w;
        }

        //Reset the tempWord
        this._tempWord.length = 0;

    } 

}

/**
* A INTERNAL method that makes the word stored in '_tempWord' break when it is wrapped over multiple lines. 
* @method _multiLineTextBreak
* @private
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype._multiLineTextBreak = function() {
        
    //Get the line difference...
    var l = this._tempWord[this._tempWord.length - 1].line - this._tempWord[0].line;

    //Remove the lines that were generated by this word...
    this._lines.splice(this._lines.length - l, l);

    //Get the 'original' width.
    this._tempWidth = this._tempWord[0].cw - this._tempWord[0].cell.w;
    
    //Loop through the word
    for(var j = 0; j < this._tempWord.length; j++) {
        
        //Add to the width
        this._tempWidth += this._tempWord[j].cell.w;

        //Would it extend past the maxWidth?
        if(this._tempWidth >= this.maxWidth) {

            //Reset the width
            this._tempWidth = this._tempWord[j].cell.w;

            //Generate the new line.
            this._lines.push( {text:[], height:0, width: 0} );
        } 

        //Does the height of this cell exceed the previous one?
        if(this._lines[this._lines.length - 1].height < this._tempWord[j].cell.h) this._lines[this._lines.length - 1].height = this._tempWord[j].cell.h;

        //Add the cell to the line new.
        this._lines[this._lines.length - 1].text.push( this._tempWord[j].cell );
        this._lines[this._lines.length - 1].width += this._tempWord[j].cell.w;
        
    }

    //Reset the temp word.
    this._tempWord.length = 0;

}


/**
* An INTERNAL method that is called during the rendering process.
* It is used to when the gameobject is 'dirty' and tells it to re-calculate which cell goes to which text and render the text to the _tempCanvas
* @method _renderText
* @private
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype._renderText = function() {

    //Reset the width/height of the temp canvas
    this._tempWidth = 0;
    this._tempHeight = 0;

    //Reset the lines..
    this._lines = [ {text:[],height:0,width:0} ];


    //If there is no max-width
    if(this.maxWidth == null) {

        this._singleLineText();

    //If there is a max-width
    } else {

        this._multiLineText();

    }

    //No longer dirty as we just re-rendered it. 
    this._tempDirty = false;
}


/**
* An INTERNAL method which handles the rendering of the lines/text to the temporary canvas. 
* @method _renderToTempCanvas 
* @private
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype._renderToTempCanvas = function() {

    //Clear the temporary canvas.
    this._tempCtx.clearRect(0, 0, this._tempCanvas.width, this._tempCanvas.height);


    //Set the width/height of the canvas. 
    this._tempCanvas.width = this._tempWidth;
    this._tempCanvas.height = this._tempHeight;

    //Set-up the x/y.
    var x = 0;  //Check left/right/center
    var y = 0;  

    //Loop through the lines - And render them on the temporary canvas
    for(var j = 0; j < this._lines.length; j++) {

        //Alignment of the lines for canvas
        if(this.maxWidth) {
            if(this.align == Kiwi.Plugins.GameObjects.BitmapText.RIGHT_ALIGN) {
                x = this.maxWidth - this._lines[j].width;
            } else if(this.align == Kiwi.Plugins.GameObjects.BitmapText.CENTER_ALIGN) {
                x = (this.maxWidth - this._lines[j].width) * 0.5;

            }
        }


        for(var i = 0; i < this._lines[j].text.length; i++) {

            var cell = this._lines[j].text[i];

            if(typeof cell !== "undefined") {
                this._tempCtx.drawImage( this.atlas.image, cell.x , cell.y, cell.w, cell.h, x, y, cell.w, cell.h );
            
                x += parseInt( cell.w );
            }
        }

        x = 0;
        y += this._lines[j].height;

    }

}


/**
* The render method that renders this gameobject for canvas.
* @method render
* @param camera {Camera}
* @public
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype.render = function(camera) {


    if(this.supported && this.text !== null && this.text !== '' && this.alpha > 0 && this.visible) {

        //render on stage
        var ctx = this.game.stage.ctx;
        ctx.save();

        var t = this.transform;
        if (this.alpha > 0 && this.alpha <= 1) {
            ctx.globalAlpha = this.alpha;
        }

        //Does the text need re-rendering?
        if (this._tempDirty) {
            this._renderText();
            this._renderToTempCanvas();
        }

        if(this.align == Kiwi.Plugins.GameObjects.BitmapText.RIGHT_ALIGN) {
            this.x -= this.width;
        } else if(this.align == Kiwi.Plugins.GameObjects.BitmapText.CENTER_ALIGN) {
            this.x -= this.width / 2;
        }

        var m = t.getConcatenatedMatrix();
        ctx.setTransform(m.a, m.b, m.c, m.d, m.tx + t.rotPointX, m.ty + t.rotPointY);
        ctx.drawImage(this._tempCanvas, 0, 0, this._tempCanvas.width, this._tempCanvas.height, -t.rotPointX, -t.rotPointY, this._tempCanvas.width, this._tempCanvas.height);


        if(this.align == Kiwi.Plugins.GameObjects.BitmapText.RIGHT_ALIGN) {
            this.x += this.width;
        } else if(this.align == Kiwi.Plugins.GameObjects.BitmapText.CENTER_ALIGN) {
            this.x += this.width / 2;
        }

        ctx.restore();

    }

}


/**
* The rendering method for webgl
* @method renderGL
* @param gl
* @param camera
* @param params
* @public
*/
Kiwi.Plugins.GameObjects.BitmapText.prototype.renderGL = function(gl, camera, params) {

    if(!this.supported && this.text == null && this.text == '' && this.visible == false) return; 

    //Do we need to calculate the text again?
    if(this._tempDirty) this._renderText();

    //Any alignment needed?
    if(this.align == Kiwi.Plugins.GameObjects.BitmapText.RIGHT_ALIGN) {
        this.x -= this.width;
    } else if(this.align == Kiwi.Plugins.GameObjects.BitmapText.CENTER_ALIGN) {
        this.x -= this.width / 2;
    }

    //Set-up the xyuv and alpha
    var vertexItems = [];

    //Transform/Matrix
    var t = this.transform;
    var m = t.getConcatenatedMatrix();

    var x = 0;  
    var y = 0;  

    //Create the Point Objects.
    var pt1 = new Kiwi.Geom.Point(x - t.rotPointX, y - t.rotPointY);
    var pt2 = new Kiwi.Geom.Point(x - t.rotPointX , y - t.rotPointY);
    var pt3 = new Kiwi.Geom.Point(x - t.rotPointX , y - t.rotPointY);
    var pt4 = new Kiwi.Geom.Point(x - t.rotPointX, y - t.rotPointY);


    //Add on the matrix to the points
    pt1 = m.transformPoint(pt1);
    pt2 = m.transformPoint(pt2);
    pt3 = m.transformPoint(pt3);
    pt4 = m.transformPoint(pt4);


    //Loop through the lines - And render them on the temporary canvas
    for(var j = 0; j < this._lines.length; j++) {


        //Alignment of the lines for canvas
        if(this.maxWidth) {
            if(this.align == Kiwi.Plugins.GameObjects.BitmapText.RIGHT_ALIGN) {
                x = this.maxWidth - this._lines[j].width;

            } else if(this.align == Kiwi.Plugins.GameObjects.BitmapText.CENTER_ALIGN) {
                x = (this.maxWidth - this._lines[j].width) * 0.5;

            }
        }

        for(var i = 0; i < this._lines[j].text.length; i++) {

            var cell = this._lines[j].text[i];

            if(typeof cell !== "undefined") {

                vertexItems.push(
                    pt1.x + t.rotPointX + x, pt1.y + t.rotPointY + y, cell.x, cell.y,  this.alpha,                                        //Top Left Point
                    pt2.x + t.rotPointX + x + cell.w, pt2.y + t.rotPointY + y, cell.x + cell.w, cell.y, this.alpha,                   //Top Right Point
                    pt3.x + t.rotPointX + x + cell.w, pt3.y + t.rotPointY + y + cell.h, cell.x + cell.w, cell.y + cell.h, this.alpha,     //Bottom Right Point
                    pt4.x + t.rotPointX + x, pt4.y + t.rotPointY + y + cell.h, cell.x, cell.y + cell.h, this.alpha                         //Bottom Left Point
                );

                x += parseInt( cell.w );

            }

        }

        x = 0;
        y += this._lines[j].height;
    }

    //Unalign the text
    if(this.align == Kiwi.Plugins.GameObjects.BitmapText.RIGHT_ALIGN) {
        this.x += this.width;
    } else if(this.align == Kiwi.Plugins.GameObjects.BitmapText.CENTER_ALIGN) {
        this.x += this.width / 2;
    }

    //Add to the batch!
    this.glRenderer.concatBatch(vertexItems);

}



/**
* A STATIC property containing the number related to aligning the text to the LEFT for the BitmapText GameObject.
* @property LEFT_ALIGN
* @static
* @type Number
* @default 0
* @public
*/
Kiwi.Plugins.GameObjects.BitmapText.LEFT_ALIGN = 0;

/**
* A STATIC property containing the number related to aligning the text to the RIGHT for the BitmapText GameObject.
* @property RIGHT_ALIGN
* @static
* @type Number
* @default 1
* @public
*/
Kiwi.Plugins.GameObjects.BitmapText.RIGHT_ALIGN = 1;

/**
* A STATIC property containing the number related to aligning the text to the CENTER for the BitmapText GameObject.
* @property CENTER_ALIGN
* @static
* @type Number
* @default 2
* @public
*/
Kiwi.Plugins.GameObjects.BitmapText.CENTER_ALIGN = 2;