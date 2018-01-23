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

window.SpriteTextCharacter = function (params, ratio) {
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
        __type: 'char',
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
                this.__dWidth = this.__sWidth * ratio;
                this.__dHeight = this.__sHeight * ratio;
            }
            return this;
        },
        getWidth: function() {
            return this.__dWidth;
        },
        getSourceWidth: function() {
            return this.__sWidth;
        },
        drawImage: function(ctx, p) {

        },
        getType: function(){
            return this.__type;
        },
        getProperties() {
            return {
                image: this.__image,
                sx: this.__sx,
                sy: this.__sy,
                sWidth: this.__sWidth,
                sHeight: this.__sHeight,
                dx: this.__dx,
                dy: this.__dy,
                dWidth: this.__dWidth,
                dHeight: this.__dHeight,
            }
        },
    };

    return __el.init(params);
}

window.SpriteTextSpace = function() {
    let __el = {
        __type: 'space',
        init: function(parms) {
            return this;
        },
        drawImage: function(ctx, p) {

        },
        getType: function() {
            return this.__type;
        }
    };

    return __el.init();
}

//////////////////////////////////////////////////////////////
// Initialize Class
//////////////////////////////////////////////////////////////

window.SpriteText = function (canvas,initProps) {
    let __spriteText = {
        __text: "",
        __spritesheets: [],
        __backgroundImage : null,
        __dimensions: [],
        __canvas: null,
        __settings: {},
        __properties: {},
        __iterate: false,
        __inputText: null,
        __defaults__: {
            whitespaceWidth: 0.5, //em units
            caseSensitive: false,
            verticalAlignment: 'middle',
            horizontalAlignment: 'center',
            initialPosition: [0.5,0.5],
            fontSize: 80, //pixels
            rotation: 0, //deg
            rotateBoth: true,
        },
        __elements__: [],
        __that: null,
        __functionBefore: null,
        __callback: null,
        get: function () {
            return this;
        },
        init: function (canvas,initProps) {
            __that = this;
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
                if(initProps.hasOwnProperty('backgroundImage')) {
                    this.setBackgroundImage(initProps.backgroundImage);
                }
                if(initProps.hasOwnProperty('input')) {
                    this.setInput(initProps.input);
                }
            }
            this.initSettings(initProps.hasOwnProperty('properties') ? initProps.properties : null);
            this.checkLoadedImages();
            return this;
        },

        getText: function () {
            return this.__text;
        },
        setText: function (text) {
            if (typeof text === "string"){
                if(!this.getSetting('caseSensitive')) {
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
                        images[i] = new Image();
                        images[i].loaded = false;
                        images[i].onload = function() {
                            this.loaded = true;
                        }
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

        getBackgroundImage: function() {
            return this.__backgroundImage;
        },

        setBackgroundImage: function(image) {
            if (image instanceof Image) {
                this.__backgroundImage = image
            } else {
                if(typeof image === "string") {
                    let i = new Image();
                    i.loaded = false;
                    i.onload = function() {
                        this.loaded = true;
                        __that.__backgroundImage = this;
                    }
                    i.src = image;
                    this.__backgroundImage = i;
                }
            }
        },

        getDimensions: function () {
            return this.__dimensions;
        },
        setDimensions: function(dimensions) {
            let spriteCount = this.getSpriteSheets().length;
            if(dimensions instanceof Array) {
                if(dimensions.length == spriteCount || dimensions.length == 1) {
                    this.__iterate = dimensions.length == spriteCount;
                    for(let i = 0; i < spriteCount; i++) {
                        this.__dimensions.push(dimensions[this.__iterate ? i : 0]);
                    }
                }  else {
                    console.error('When setting up multiple spritesheets with different dimensions, the amount of spritesheets and dimensions must match.');
                    this.__dimensions = [];
                    return;
                }
            } else if (dimensions instanceof Object) {
                if(spriteCount == 1) {
                    for(let i = 0; i < spriteCount; i++) {
                        this.__dimensions.push(dimensions[0]);
                    }
                }
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
                        canvas.style.cursor = 'pointer';
                        canvas.onclick = function() {
                            __that.reload();
                        }
                    } else {
                        console.log('Canvas node must be of type canvas.');
                    }
                }
            }
        },
        // TODO: create properties, methods
        initSettings: function(settings) {
            this.setDefaults();
            if(settings != null) {
                for(let p in settings) {
                    this.setSetting(p,settings[p]);
                }
            }
            this.setSetting('maxHeight',this.getMaxHeight());
            this.setSetting('fontCount', this.getSpriteSheets().length);
        },
        setDefaults: function() {
            this.__settings = this.__defaults__;
        },

        getSetting: function(name) {
            return this.__settings[name];
        },
        setSetting: function(name, value) {
            this.__settings[name] = value;
        },

        setFunctionBeforeDraw: function(func) {
            this.__functionBefore = func;
        },

        setCallback: function(func) {
            this.__callback = func;
        },

        getRatio: function(){
            return this.getSetting('fontSize') / this.getMaxHeight();
        },

        getMaxHeight: function() {
            let maxHeight = 0;
            let dims = !this.__iterate ? [this.getDimensions()[0]] : this.getDimensions();
            for(d in dims) {
                for(i in dims[d]) {
                    let h = dims[d][i][3] - dims[d][i][2]; // Delta y
                    if(maxHeight < h) {
                        maxHeight = h;
                    }
                }
            }
            return maxHeight;
        },

        getMaxWidth: function() {
            let maxWidth = 0;
            let dims = !this.__iterate ? [this.getDimensions()[0]] : this.getDimensions();
            for(d in dims) {
                for(i in dims[d]) {
                    let w = dims[d][i][1] - dims[d][i][0]; // Delta x
                    if(maxWidth < w) {
                        maxWidth = w;
                    }
                }
            }
            return maxWidth;
        },

        getLetter: function(l) {
            let rand = Math.floor(Math.random() * this.getSetting('fontCount'));
            let letter = {};
            let dims = this.getDimensions()[rand][l];

            letter.image = this.getSpriteSheets()[rand];
            letter.sx = dims[0];
            letter.sy = dims[2];
            letter.sWidth = dims[1];
            letter.sHeight = dims[3];

            return letter;
        },

        getSpace: function(ratio) {
            if(typeof ratio === 'undefined' || ratio == null) ratio = 1;
            return this.getTotalHeight() * this.getSetting('whitespaceWidth') * ratio;
        },

        clearElements: function() {
            this.__elements__ = [];
        },

        addElement: function(el) {
            this.__elements__.push(el);
        },

        getElements: function(){
            return this.__elements__;
        },

        checkLoadedImages: function() {
            let s = __that.getSpriteSheets();
            let b = __that.getBackgroundImage();
            b = b == null || b.loaded;
            let allLoaded = true;
            for(let i in s) {
                if(!s[i].loaded || !b) {
                    allLoaded = false;
                }
            }
            if(!allLoaded) {
                setTimeout(__that.checkLoadedImages, 1000);
            } else{
                __that.createTextElements();
                __that.drawElements();
                return;
            }
        },

        reload: function(text) {
            if(typeof text === 'undefined') {
                if(this.__inputText != null) {
                    text = this.__inputText.value
                } else {
                    text = this.getText();
                }
            }
            let canvas = this.getCanvas();
            canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
            this.setText(text);
            this.createTextElements();
            this.drawElements();
        },

        createTextElements: function() {
            this.clearElements();
            let text = this.getText();
            let textArray = text.split('');
            for(let i in textArray) {
                if(textArray[i] == ' ') {
                    //TODO handle spaces
                    this.addElement(
                        new SpriteTextSpace());
                }
                else {
                    let letter = this.getLetter(textArray[i]);
                    this.addElement(
                        new SpriteTextCharacter(letter, this.getRatio()));
                }
            }
            
        },

        getFunctionBeforeDraw: function() {
            if(typeof this.__functionBefore !== 'undefined' && this.__functionBefore != null) {
                return this.__functionBefore;
            } else {
                return null;
            }
        },

        getCallback: function() {
            if(typeof this.__callback !== 'undefined' && this.__callback != null) {
                return this.__callback;
            } else {
                return null;
            }
        },

        drawElements: function() {
            let funcBefore = this.getFunctionBeforeDraw(),
                callback = this.getCallback();
            
            if(funcBefore != null) {
                funcBefore();
            }

            let bg = this.getBackgroundImage(),
                canvas = this.getCanvas(),
                bgRatio = canvas.offsetWidth / bg.width;
            
            canvas.height = bg.height * bgRatio;

            let cip = this.getCanvasInitialPosition(), //canvas initial position
                hAlign = this.getSetting('horizontalAlignment'),
                vAlign = this.getSetting('verticalAlignment'),
                totalWidth = this.getTotalWidth(),
                totalHeight = this.getTotalHeight(),
                lm = (hAlign == 'center' ? (totalWidth / 2) : 
                                            (hAlign == 'right' ? totalWidth : 0)),
                top = cip.y - totalHeight / 2,
                initPos = cip.x - lm
                currPos = initPos,
                hasRotation = this.getSetting('rotation') != 0,
                el = this.getElements(),
                ctx = canvas.getContext('2d');
            
                ctx.drawImage(bg,0,0,canvas.width, canvas.height);
            
            for(let i in el) {
                switch(el[i].getType()) {
                    case 'char': {
                        let p = el[i].getProperties(),
                            eHeight = totalHeight - p.dHeight,
                            marginTop = vAlign == 'middle' ? eHeight / 2 : 
                                vAlign == 'bottom' ? eHeight : 0
                            dx = currPos,
                            dy = top + marginTop,
                            w = p.dWidth * bgRatio,
                            h = p.dHeight * bgRatio;
                        if(hasRotation){
                            let rotationAngle = this.getRotationAngle();
                            ctx.translate(dx + w/2,dy + h/2);
                            ctx.rotate(rotationAngle);
                            ctx.drawImage(p.image, p.sx, p.sy, p.sWidth, p.sHeight,
                                -w/2, -p.h/2, w * bgRatio, h * bgRatio);
                            ctx.rotate(-rotationAngle);
                            ctx.translate(-1 * (dx + w/2),-1 * (dy + h/2));
                        } else {
                            ctx.drawImage(p.image, p.sx, p.sy, p.sWidth, p.sHeight,
                                dx, dy, w * bgRatio, h * bgRatio);
                        }
                            currPos += w * bgRatio;
                        break;
                    }
                    case 'space' : {
                        currPos += this.getSpace(bgRatio);
                        break;
                    }
                }
            }

            if(callback != null) callback();
        },

        getRotationAngle: function() {
            let negative = this.getSetting('rotateBoth');
            let angle = Math.random() * this.getSetting('rotation');
            angle *= negative ? (Math.random() < 0.5 ? -1 : 1 ) : 1;
            return angle * Math.PI / 180;
        },

        getTotalWidth: function() {
            let w = 0,
                elements = this.getElements(),
                whiteSpace = this.getSpace();
            for(let i in elements) {
                switch(elements[i].getType()) {
                    case 'char':
                        w += elements[i].getWidth();
                        break;
                    case 'space':
                        w += whiteSpace;
                        break;
                }
            }
            return w;
        },

        getFullWidth: function() {
            let w = 0,
                elements = this.getElements(),
                whiteSpace = this.getMaxHeight() * this.getSetting('whitespaceWidth');
            for(let i in elements) {
                switch(elements[i].getType()) {
                    case 'char':
                        w += elements[i].getSourceWidth();
                        break;
                    case 'space':
                        w += whiteSpace;
                        break;
                }
            }
            return w;
        },

        getTotalHeight: function() {
            return this.getMaxHeight() * this.getRatio();
        },

        getCanvasWidth: function() {
            return this.__canvas.width;
        },
        getCanvasHeight: function() {
            return this.__canvas.height;
        },

        getCanvasInitialPosition: function() {
            let initialPosition = this.getSetting('initialPosition');
            return {
                x: this.getCanvasWidth() * initialPosition[0],
                y: this.getCanvasHeight() * initialPosition[1]
            }
        },

        setInput: function(input) {
            if(typeof input === "string") {
                let inputText = document.getElementById(input);
                this.setInput(inputText)
            } else if(input instanceof HTMLInputElement) {
                this.__inputText = input;
                this.__inputText.onkeyup = function() {__that.reload()};
                this.setText(this.__inputText.value)
            } else {
                Console.error('The input element must be type text.');
                this.__inputText = null;
            }
        }
    };

    return __spriteText.init(canvas,initProps);
};

/* SpriteText.prototype.constructor = function() {
    alert('Initialized!');
} */