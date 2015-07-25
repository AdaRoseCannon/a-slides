'use strict';

require('./plugins/util-polyfills');

// Setup document listeners and event handlers
function ASlide(slideData, {plugins = [], slideContainer = document} = {}) {

	const setupSlide = function setupSlide(name) {

		slideContainer.fire('a-slides_slide-setup', {slideId: name});

		if (slideData[name]) {
			slideData[name].setup.bind(slideContainer.$('#' + name + ' .panel-primary .panel-body'))();
		} else {
			slideData[name] = {
				setup() {},
				action: function* (){yield;},
				teardown() {}
			};
		}

		this.currentEvents = slideData[name].action.bind(slideContainer.$('#' + name + ' .panel-primary .panel-body'))();

		// Do first action
		this.currentEvents.next();
	}.bind(this);

	function teardownSlide(name) {

		slideContainer.fire('a-slides_slide-teardown', {slideId: name});
		if (slideData[name]) {
			slideData[name].teardown.bind(slideContainer.$('#' + name + ' .panel-primary .panel-body'))();
		}
	}

	function goToSlide(i) {

		const newSlide = typeof i === "number" ? $(`.slide:nth-child(${i + 1})`) : i;
		if (!newSlide) return;
		const newSlideId = newSlide.id;
		const oldSlide = $('.slide.active');
		if (newSlide && newSlide !== oldSlide) {
			if (oldSlide) {
				oldSlide.classList.remove('active');
				oldSlide.once('transitionend', () => teardownSlide(oldSlide.id));
			}
			newSlide.off('transitionend');
			newSlide.classList.add('active');
			teardownSlide(newSlideId);
			setupSlide(newSlideId);
		}
	}

	function goToNextSlide() {
		goToSlide($('.slide.active').prevAll().length + 1);
	}

	function goToPrevSlide() {
		goToSlide($('.slide.active').prevAll().length - 1);
	}

	function goToSlideByDOM(s) {
		if (s.classList.contains('slide')) {
			goToSlide(s.prevAll().length);
		} else {
			throw Error('Selected class must have a class of \'slide\'');
		}
	}

	this.currentEvents = {
		next() {
			return {done: false};
		}
	};

	// e.g. click presses next etc etc
	slideContainer.on('a-slides_trigger-event', () => {
		if(this.currentEvents.next().done) {
			goToNextSlide();
		}
	});

	slideContainer.on('a-slides_next-slide', () => goToNextSlide());
	slideContainer.on('a-slides_previous-slide', () => goToPrevSlide());

	slideContainer.on('a-slides_goto-slide', e => goToSlide(e.detail.slide));
	slideContainer.on('a-slides_goto-slide-by-number', e => goToSlide(e.detail.slide));
	slideContainer.on('a-slides_goto-slide-by-dom' , e => goToSlideByDOM(e.detail.slide));

	goToSlide(0);

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
