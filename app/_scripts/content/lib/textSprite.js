// From http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
/*global THREE*/
'use strict';

function makeTextSprite( message, parameters ) {
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 2;

	var size = parameters.hasOwnProperty("size") ? 
		parameters["size"] : 1;
		
	var canvas1 = document.createElement('canvas');
	var context1 = canvas1.getContext('2d');
	var height = 256;

	function setStyle(context) {

		context.font = "Bold " + (height - borderThickness) + "px " + fontface;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		
		context.lineWidth = borderThickness;

		// text color
		context.strokeStyle = "rgba(255, 255, 255, 1.0)";
		context.fillStyle = "rgba(0, 0, 0, 1.0)";
	}

	setStyle(context1);

	var canvas2 = document.createElement('canvas');

	// Make the canvas width a power of 2 larger than the text width
	canvas2.width = Math.pow(2, Math.ceil(Math.log2( context1.measureText( message ).width )));
	canvas2.height = height;
	var context2 = canvas2.getContext('2d');
	setStyle(context2);

	context2.strokeText( message, canvas2.width/2, canvas2.height/2);
	context2.fillText( message, canvas2.width/2, canvas2.height/2);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas2) ;
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
	var sprite = new THREE.Sprite(spriteMaterial);

	var maxWidth = height * 4;

	if (canvas2.width > maxWidth) size *= maxWidth/canvas2.width;
    
	// get size data (height depends only on font size)
	sprite.scale.set(size * canvas2.width/canvas2.height, size, 1);
	return sprite;
}

module.exports = makeTextSprite;
