/* global $, $$ */

'use strict';

const slideSelector = slideId => `.a-slides_slide[data-slide-id="${slideId}"] .a-slides_slide-content`;

// Setup document listeners and event handlers
function ASlide(slideData, {plugins = [], slideContainer = document.body} = {}) {

	const setupSlide = function setupSlide(slideId) {

		location.hash = slideId;

		slideContainer.fire('a-slides_slide-setup', {slideId});

		if (slideData[slideId]) {
			slideData[slideId].setup.bind(slideContainer.$(slideSelector(slideId)))();
		} else {
			slideData[slideId] = {
				setup() {},
				action: function* (){yield},
				teardown() {}
			};
		}

		this.currentEvents = slideData[slideId].action.bind(slideContainer.$(slideSelector(slideId)))();

		// if a go to new slide is already triggered then cancel it so
		// we don't accidentially go to the wrong slide.
		clearTimeout(this.nextSlideTimeOut);

		// Do first action
		this.currentEvents.next();
	}.bind(this);

	function teardownSlide(slideId) {

		slideContainer.fire('a-slides_slide-teardown', {slideId});
		if (slideData[slideId]) {
			slideData[slideId].teardown.bind(slideContainer.$(slideSelector(slideId)))();
		}
	}

	// Slide is a dom element or an integer
	function goToSlide({slide}) {
		const newSlide = typeof slide === "number" ? $$('.a-slides_slide')[slide] : slide;
		if (!newSlide) return;
		const newSlideId = newSlide.dataset.slideId;
		const oldSlide = $('.a-slides_slide.active');
		if (newSlide && newSlide !== oldSlide) {
			if (oldSlide) {
				oldSlide.classList.remove('active');
				oldSlide.once('transitionend', () => teardownSlide(oldSlide.dataset.slideId));
			}
			newSlide.off('transitionend');
			newSlide.classList.add('active');
			teardownSlide(newSlideId);
			setupSlide(newSlideId);
		}
	}

	function goToNextSlide() {
		goToSlide({slide: $('.a-slides_slide.active').prevAll().length + 1});
	}

	function goToPrevSlide() {
		goToSlide({slide: $('.a-slides_slide.active').prevAll().length - 1});
	}

	this.currentEvents = {
		next() {
			return {done: false};
		}
	};

	// e.g. click presses next etc etc
	slideContainer.on('a-slides_trigger-event', function () {
		if (this.currentEvents.next().done) {

			// Wait a smidge before triggering the next slide.
			this.nextSlideTimeOut = setTimeout(goToNextSlide, 10);
		}
	}.bind(this));

	slideContainer.on('a-slides_next-slide', () => goToNextSlide());
	slideContainer.on('a-slides_previous-slide', () => goToPrevSlide());
	slideContainer.on('a-slides_goto-slide', e => goToSlide(e.detail));

	slideContainer.on('scroll', () => slideContainer.scrollLeft = 0);

	plugins.forEach(plugin => {
		if (typeof plugin === 'function') {
			plugin({
				slideData,
				slideContainer
			});
		}
	});

}

ASlide.prototype.plugins = {
    deepLinking: require('./plugins/deep-linking'),
    interactionKeyboard: require('./plugins/interaction-keyboard-mouse'),
    interactionTouch: require('./plugins/interaction-touch'),
    markdownTransform: require('./plugins/markdown'),
    slideController: require('./plugins/slide-controller'),
    bridgeServiceWorker: require('./plugins/sw-bridge'),
    bridgeWebRTC: require('./plugins/webrtc-bridge'),
};

module.exports = ASlide;
