/**
 * The key names match the slideId in the _posts directory
 */

 const content = [
 	'./images/Jonny-Quest-the-real-adventures-of-jonny-quest.jpg',
 	'./images/accelerando.jpg',
 	'./images/neuromancer.jpg',
 	'./images/matrix.gif',
 	'./images/sao.jpg'
 ];

 const vrFace = [
 	'./images/face1.jpg',
 	'./images/face2.jpg',
 	'./images/face3.jpg',
 	'./images/face4.jpg',
 	'./images/face5.jpg'
 ];

/*
 * Facebook Oculus Rift
 * Samsung Gear VR
 * Sony Playstation VR (Formerly morpheus)
 * Steam's Vive
 * Cardboard*/
 const devices = [
 	'./images/rift.jpg',
 	'./images/gear.jpg',
 	'./images/psvr.jpg',
 	'./images/vive.jpg',
 	'./images/cardboard2.jpg',
 	'./images/jump.jpg',
 	'./images/warp.jpg'
 ];

 var images = require('./lib/images');
 var video = require('./lib/video');

module.exports = {
	'/the-first-slide': images(...content),
	'/vrface': images(...vrFace),
	'/devices': images(...devices),
	'/three': require('./three-dee'),
	'/blender': video('./images/blender.webm')
};
