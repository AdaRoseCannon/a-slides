'use strict';

/**
 * Constants
 */

/**
 * Dependencies
 */

const ASlides = require('./a-slides');
const slideData = require('./content');
const slideContainer = document.querySelector('.slide-container');

new ASlides(slideData, {
	slideContainer,
	plugins: [
		require('./a-slides/plugins/markdown'), // needs to be run first
		require('./a-slides/plugins/slide-controller'), // needs to be run before buttons are added to it.
		require('./a-slides/plugins/deep-linking'),
		require('./a-slides/plugins/interaction-keyboard-mouse'),
		require('./a-slides/plugins/interaction-touch')({
			use: ['swipe-back']
		}),
		require('./a-slides/plugins/deep-linking'),
		require('./a-slides/plugins/webrtc-bridge')({
			peerSettings: {
				key: 'l9uje6f673zq6w29'
			}
		})
	]
});

if (location.search === '?presentation') {
	slideContainer.classList.add('presentation');
}

if (location.search === '?notes') {
	slideContainer.classList.add('hide-presentation');
}


if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js')
		.then(function(reg) {
			console.log('sw registered', reg);
		}).catch(function(error) {
			console.log('sw registration failed with ' + error);
		});

	if (navigator.serviceWorker.controller) {
		console.log('Offlining Available');
	}
}
