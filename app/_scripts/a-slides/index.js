'use strict';

require('./plugins/util-polyfills');

const slideSelector = slideId => `.slide[data-slide-id="${slideId}"] .panel.slide-content .panel-body`;

// Setup document listeners and event handlers
function ASlide(slideData, {plugins = [], slideContainer = document} = {}) {

	const setupSlide = function setupSlide(slideId) {

		location.hash = slideId;

		slideContainer.fire('a-slides_slide-setup', {slideId});

		if (slideData[slideId]) {
			slideData[slideId].setup.bind(slideContainer.$(slideSelector(slideId)))();
		} else {
			slideData[slideId] = {
				setup() {},
				action: function* (){yield;},
				teardown() {}
			};
		}

		this.currentEvents = slideData[slideId].action.bind(slideContainer.$(slideSelector(slideId)))();

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
		const newSlide = typeof slide === "number" ? $$('.slide')[slide] : slide;
		if (!newSlide) return;
		const newSlideId = newSlide.dataset.slideId;
		const oldSlide = $('.slide.active');
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
		goToSlide({slide: $('.slide.active').prevAll().length + 1});
	}

	function goToPrevSlide() {
		goToSlide({slide: $('.slide.active').prevAll().length - 1});
	}

	this.currentEvents = {
		next() {
			return {done: false};
		}
	};

	// e.g. click presses next etc etc
	slideContainer.on('a-slides_trigger-event', function () {
		if(this.currentEvents.next().done) {

			// Wait a smidge before triggering the next slide.
			setTimeout(goToNextSlide, 10);
		}
	}.bind(this));

	slideContainer.on('a-slides_next-slide', () => goToNextSlide());
	slideContainer.on('a-slides_previous-slide', () => goToPrevSlide());
	slideContainer.on('a-slides_goto-slide', e => goToSlide(e.detail));

	plugins.forEach(plugin => {
		if (typeof plugin === 'function') {
			plugin({
				slideData,
				slideContainer
			});
		}
	});

}

module.exports = ASlide;
