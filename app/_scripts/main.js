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
		require('./a-slides/plugins/markdown'), // needs to be run first
		require('./a-slides/plugins/slide-controller'), // needs to be run before buttons are added to it.
		require('./a-slides/plugins/deep-linking'),
		require('./a-slides/plugins/interaction-keyboard-mouse'),
		// require('./a-slides/plugins/interaction-touch'),
		require('./a-slides/plugins/deep-linking'),
		require('./a-slides/plugins/webrtc-bridge')({
			peerSettings: {
				key: 'l9uje6f673zq6w29'
			}
		})
	]
});
