'use strict';

const slideSelector = slideId => `.a-slides_slide[data-slide-id="${slideId}"] .a-slides_slide-content`;
const { fire, on, once, off } = require('./events');
const prevAll = require('./prev-all');

// Setup document listeners and event handlers
function ASlide(slideData, {plugins = [], slideContainer = document.body} = {}) {

	let noEvents = 0;

	// prepare a slide to be used
	const setupSlide = function setupSlide(slideId) {

		if (this.nextEvents) {
			this.nextEvents.teardown.bind(this.nextSlide);
			this.nextEvents = null;
			this.nextSlide = null;
		}

		location.hash = slideId;

		fire(slideContainer, 'a-slides_slide-setup', { slideId });

		this.nextSlide = slideContainer.querySelector(slideSelector(slideId));

		if (slideData[slideId]) {
			if (slideData[slideId].setup) {
				slideData[slideId].setup.bind(this.nextSlide)();
			}
		} else {
			slideData[slideId] = {
				setup() {},
				action: function* (){yield},
				teardown() {}
			};
		}

		this.nextEvents = slideData[slideId];
		noEvents = 0;
	}.bind(this);

	// use that slide
	const loadNextSlide = function loadNextSlide() {

		this.currentEvents = this.nextEvents.action.bind(this.nextSlide)();
		this.currentSlide = this.nextSlide;

		this.nextEvents = null;
		this.nextSlide = null;

		fire(slideContainer, 'a-slides_slide-show', { slideId: this.currentSlide.dataset.slideId });

		// if a go to new slide is already triggered then cancel it so
		// we don't accidentially go to the wrong slide.
		clearTimeout(this.nextSlideTimeOut);

		// Do first action
		this.currentEvents.next();
	};

	function teardownSlide(slideId) {

		fire(slideContainer, 'a-slides_slide-teardown', {slideId});
		if (slideData[slideId]) {
			if (slideData[slideId].teardown) {
				slideData[slideId].teardown.bind(slideContainer.querySelector(slideSelector(slideId)))();
			}
		}
	}

	// Slide is a dom element or an integer
	function goToSlide({slide}) {
		const newSlide = typeof slide === 'number' ? slideContainer.querySelectorAll('.a-slides_slide')[slide] : slide;
		if (!newSlide) return;
		const newSlideId = newSlide.dataset.slideId;
		const oldSlide = slideContainer.querySelector('.a-slides_slide.active');
		if (newSlide && newSlide !== oldSlide) {
			if (oldSlide) {
				oldSlide.classList.remove('active');
				once(oldSlide, 'transitionend', () => {
					loadNextSlide();
					teardownSlide(oldSlide.dataset.slideId);
				});
			}
			off(newSlide, 'transitionend');
			newSlide.classList.add('active');
			teardownSlide(newSlideId);
			setupSlide(newSlideId);
		}
	}

	function goToNextSlide() {
		goToSlide({slide: prevAll(slideContainer.querySelector('.a-slides_slide.active')).length + 1});
	}

	const goToPrevSlide = () => {

		if (noEvents) {
			fire(slideContainer, 'a-slides_refresh-slide');
			return;
		}

		// Wait a smidge before changing slides.
		slideContainer.nextSlideTimeOut = setTimeout(() => goToSlide({slide: prevAll(slideContainer.querySelector('.a-slides_slide.active')).length - 1}), 10);
	};

	this.currentEvents = {
		next() {
			return {done: false};
		}
	};

	// e.g. click presses next etc etc
	on(slideContainer, 'a-slides_trigger-event', function () {
		noEvents++;
		if (this.currentEvents.next().done) {

			// Wait a smidge before triggering the next slide.
			this.nextSlideTimeOut = setTimeout(goToNextSlide, 10);
		}
	}.bind(this));

	function refreshSlide() {
		const id = slideContainer.querySelector('.a-slides_slide.active').dataset.slideId;
		teardownSlide(id);
		setupSlide(id);
		loadNextSlide();
	}

	on(slideContainer, 'a-slides_refresh-slide', () => refreshSlide());
	on(slideContainer, 'a-slides_next-slide', () => goToNextSlide());
	on(slideContainer, 'a-slides_previous-slide', () => goToPrevSlide());
	on(slideContainer, 'a-slides_goto-slide', e => goToSlide(e.detail));

	on(slideContainer, 'scroll', () => slideContainer.scrollLeft = 0);

	plugins.forEach(plugin => {
		if (typeof plugin === 'function') {
			plugin({
				slideData,
				slideContainer
			});
		}
	});
}

ASlide.plugins = {
    deepLinking: require('./plugins/deep-linking'),
    interactionKeyboard: require('./plugins/interaction-keyboard-mouse'),
    interactionTouch: require('./plugins/interaction-touch'),
    markdownTransform: require('./plugins/markdown'),
    slideController: require('./plugins/slide-controller'),
    bridgeServiceWorker: require('./plugins/sw-bridge'),
    bridgeWebRTC: require('./plugins/webrtc-bridge'),
};

module.exports = ASlide;
