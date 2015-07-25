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
	slideContainer: document.querySelector('.slide-container'),
	plugins: [
		require('./a-slides/plugins/deep-linking'),
		require('./a-slides/plugins/interaction-keyboard-mouse'),
		// require('./a-slides/plugins/interaction-touch'),
		require('./a-slides/plugins/markdown'),
		require('./a-slides/plugins/deep-linking'),
		require('./a-slides/plugins/webrtc-bridge')({
			peerSettings: {
				host: '1am.club',
				path:"/peerjs",
				port: 9000,
				secure: true,
				debug: 2
			},
			peerController: location.hash === '#controller'
		})
	]
});
