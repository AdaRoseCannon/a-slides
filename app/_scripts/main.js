'use strict';

/**
 * Constants
 */

// Define peerJS Details
const peerJSDetails = false;
// const peerJSDetails = {
// 	host: '1am.club',
// 	path:"/peerjs",
// 	port: 9000,
// 	secure: true,
// 	debug: 2
// }

/**
 * Dependencies
 */

const slide = require('./lib/slides');
const marked = require('marked');
require('./lib/util-polyfills');

/**
 * Code
 */

// Render the slides markdown.
(function () {
	const m = new Map();

	// store all of the innerHTMLs
	$$('.marked').forEach(o => m.set(o, o.innerHTML));

	// then write them all out
	m.forEach((v, k) => k.innerHTML = marked(v));
})();

// These functions get filled in by webrtc when it is initiated
let requestSlide = (() => {});
let triggerRemoteEvent = (() => {});

function goToSlide(i) {

	const newSlide = typeof i === "number" ? $(`.slide:nth-child(${i + 1})`) : i;
	if (!newSlide) return;
	const newSlideId = newSlide.id;
	const oldSlide = $('.slide.active');
	if (newSlide && newSlide !== oldSlide) {
		if (oldSlide) {
			oldSlide.classList.remove('active');
			oldSlide.once('transitionend', () => slide.teardown(oldSlide.id));
		}
		newSlide.off('transitionend');
		newSlide.classList.add('active');
		slide.teardown(newSlideId);
		slide.setup(newSlideId);
		requestSlide(i);
	}
}

function goToNextSlide() {
	goToSlide($('.slide.active').prevAll().length + 1);
}

function goToPrevSlide() {
	goToSlide($('.slide.active').prevAll().length - 1);
}

function goToSlideBySelector(s) {
	var target = $(s);
	if (target.hasClass('slide')) {
		goToSlide(target.prevAll().length);
	}
}

function triggerEvent() {
	triggerRemoteEvent();
	if(slide.triggerEvent.next().done) {
		goToNextSlide();
	}
}

if (peerJSDetails) {
	webrtc(location.hash === '#controller', peerJSDetails)
	.then(user => {
		requestSlide = user.requestSlide.bind(user);
		triggerRemoteEvent = user.triggerRemoteEvent.bind(user);
		user.on('goToSlide', goToSlide);
		user.on('triggerEvent', triggerEvent);
	}, err => {
		console.error('Failure to connect to webrtc', err);
	});
}

if (location.hash) {
	goToSlideBySelector(location.hash);
} else {
	goToSlide(0);
}

window.addEventListener('keyup', e => {
	switch(e.keyCode) {
		case 37:
			goToPrevSlide();
			break;

		case 13:
		case 39:
			triggerEvent();
			break;
	}
});

// var touches = new Hammer($('.slide-container')[0]);
// touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });
// touches.on('swipeleft', () => goToNextSlide());
// touches.on('swiperight', () => goToPrevSlide());

$('.slide-container').on('click', triggerEvent);
