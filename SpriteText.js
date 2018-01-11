/*
SpriteText
visit https://github.com/ndeniche/SpriteText for documentation and usage

MIT License

Copyright (c) 2017 ndeniche

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

window.SpriteTextElement = function (params) {
    let __el = {
        __image: null,
        __sx: 0,
        __sy: 0,
        __sWidth: 0,
        __sHeight: 0,
        __dx: 0,
        __dy: 0,
        __dWidth: 0,
        __dHeight: 0,
        init: function(params) {
            if(
                !params.hasOwnProperty('image') ||
                !params.hasOwnProperty('sx') ||
                !params.hasOwnProperty('sy') ||
                !params.hasOwnProperty('sWidth') ||
                !params.hasOwnProperty('sHeight')
            ) return null;
            else {
                this.__image = params.image;
                this.__sx = params.sx;
                this.__sy = params.sy;
                this.__sWidth = params.sWidth;
                this.__sHeight = params.sHeight;
            }
            return this;
        },
        drawImage: function(ctx, p) {

        }
    };

    return __el.init(params);
}

//////////////////////////////////////////////////////////////
// Initialize Class
//////////////////////////////////////////////////////////////

window.SpriteText = function (canvas,initProps) {
    let __spriteText = {
        __text: "",
        __spritesheets: [],
        __dimensions: [],
        __canvas: null,
        __properties: {},
        __defaults__: {
            whitespaceWidth: 0.5, //em units
            caseSensitive: false,
            verticalAlignment: 'middle',
            horizontalAlignment: 'center',
            initialPosition: [0.5,0.5],
        },
        __elements__: [],
        get: function () {
            return this;
        },
        init: function (canvas,initProps) {
            this.setCanvas(canvas);
            if (typeof initProps !== 'undefined') {
                if (initProps.hasOwnProperty('text')) {
                    this.setText(initProps.text);
                }
                if (initProps.hasOwnProperty('spritesheets')) {
                    this.setSpriteSheets(initProps.spritesheets);
                }
                if (initProps.hasOwnProperty('dimensions')) {
                    this.setDimensions(initProps.dimensions);
                }
            }
            this.initProperties(initProps.hasOwnProperty('properties') ? initProps.properties : null);
            this.createTextElements();
            return this;
        },

        getText: function () {
            return this.__text;
        },
        setText: function (text) {
            if (typeof text === "string"){
                if(!this.getProperty('caseSensitive')) {
                    text = text.toLowerCase();
                }
                this.__text = text;
            } else {
                console.log('Text input must be a string');
                this.text = "";
            }
        },

        getSpriteSheets: function () {
            return this.__spritesheets;
        },
        setSpriteSheets: function (images) {
            if (images instanceof Array) {
                for (let valid = true, i = 0; i < images.length; i++) {
                    if (typeof images[i] === "string") {
                        let url = images[i];
                        images[i] = new Image;
                        images[i].src = url;
                    }
                    else if (typeof images[i] !== "Image") {
                        console.log('All elements in the image array must be typeof Image');
                        this.__images = [];
                        return;
                    }
                }
                this.__spritesheets = images;
            }
        },

        getDimensions: function () {
            return this.__dimensions;
        },
        setDimensions: function(dimensions) {
            if(dimensions instanceof Array) {
                this.__dimensions = dimensions;
            } else if (dimensions instanceof Object) {
                this.__dimensions.push(dimensions);
            }
        },

        getCanvas: function(){
            return this.__canvas;
        },
        setCanvas: function(canvas) {
            if(typeof canvas !== 'undefined'){
                if(typeof canvas === "string") {
                    this.setCanvas(document.getElementById(canvas));
                } else {
                    if(canvas instanceof HTMLCanvasElement) {
                        this.__canvas = canvas;
                    } else {
                        console.log('Canvas node must be of type canvas.');
                    }
                }
            }
        },
        // TODO: create properties, methods
        initProperties: function(properties) {
            this.setDefaults();
            if(properties != null) {
                for(let p in properties) {
                    this.setProperty(p,properties[p]);
                }
            }
            this.setProperty('maxHeight',this.getMaxHeight());
            this.setProperty('fontCount', this.getSpriteSheets().length);
        },
        setDefaults: function() {
            this.__properties = this.__defaults__;
        },

        getProperty: function(name) {
            return this.__properties['name'];
        },
        setProperty: function(name, value) {
            this.__properties['name'] = value;
        },

        getMaxHeight: function() {
            let maxHeight = 0;
            for(d in this.getDimensions()) {
                for(i in d) {
                    let h = d[i][1] - d[i][0];
                    if(maxHeight < h) {
                        maxHeight = h;
                    }
                }
            }
            return maxHeight;
        },

        getLetter: function(l) {
            let rand = Math.floor(Math.random() * this.getProperty('fontCount'));
            let letter = {};
            let dims = this.getDimensions()[rand][l];

            letter.image = this.getSpriteSheets()[rand];
            letter.sx = dims[0];
            letter.sy = dims[2];
            letter.sWidth = dims[1] - dims[0];
            letter.sHeight = dims[3] - dims[2];

            return letter;
        },

        addElement: function(el) {
            this.__elements__.push(el);
        },

        createTextElements: function() {
            let text = this.getText();
            let textArray = text.split('');
            for(let i in textArray) {
                if(textArray[i] == ' ') {
                    //TODO handle spaces
                }
                else {
                    let letter = this.getLetter(textArray[i]);
                    this.addElement(
                        new SpriteTextElement(letter));
                }
            }
            console.log(this.__elements__);
        },
        // TODO: paint elements onto canvas
    };

    return __spriteText.init(canvas,initProps);
};

/* SpriteText.prototype.constructor = function() {
    alert('Initialized!');
} */