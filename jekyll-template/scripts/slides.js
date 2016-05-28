'use strict';
/* global ASlides*/

(function () {
	const slideData = [];
	const slideContainer = document.querySelector('.a-slides_slide-container');

	new ASlides(slideData, {
		slideContainer,
		plugins: [
			ASlides.prototype.plugins.markdownTransform, // needs to be run first
			ASlides.prototype.plugins.slideController, // needs to be run before buttons are added to it.
			ASlides.prototype.plugins.deepLinking,
			ASlides.prototype.plugins.interactionKeyboard,
			ASlides.prototype.plugins.interactionTouch({ // has configuration
				use: ['swipe-back']
			}),
			ASlides.prototype.plugins.bridgeServiceWorker,
			// ASlides.prototype.plugins.bridgeWebRTC({ // PeerJS plugin so one slide controls the rest
			// 	peerSettings: {
			// 		host: '1am.club',
			// 		secure: true,
			// 		port: 9000,
			// 		debug: 2,
			// 		path:"/peerjs"
			// 	}
			// })
		]
	});

	if (location.search === '?presentation') {
		slideContainer.classList.add('presentation');
	}

	if (location.search === '?notes') {
		slideContainer.classList.add('hide-presentation');
	}
}());
