'use strict';

/**
 * Constants
 */

/**
 * Dependencies
 */

const ASlides = require('./a-slides');
const slideData = require('./content');

new ASlides(slideData, {
	plugins: [
		'deep-linking',
		'interaction-keyboard-mouse',
		// 'interaction-touch',
		'markdown',
		'util-polyfills',
		'webrtc-bridge',
		'deep-linking'
	],
	peerSettings: {
		host: '1am.club',
		path:"/peerjs",
		port: 9000,
		secure: true,
		debug: 2
	},
	peerController: location.hash === '#controller'
});
