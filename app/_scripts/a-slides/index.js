// Current actions which are being run through
// stub initially

function ASlide(slideData, {plugins = []} = {}) {

	plugins.forEach(pluginStr => {
		let plugin = require('./' + pluginStr);
		if (typeof plugin === 'function') {
			plugin(slideData);
		}
	});

	function setupSlide(name) {

		document.dispatchEvent(new CustomEvent('a-slides_slide-setup', {slideId: name}));

		if (slideData[name]) {
			slideData[name].setup.bind(document.getElementById(name).querySelector('.panel-primary .panel-body'))();
		} else {
			slideData[name] = {
				setup() {},
				action: function* (){yield;},
				teardown() {}
			};
		}
		this.currentEvents = slideData[name].action.bind(document.getElementById(name).querySelector('.panel-primary .panel-body'))();

		// Do first action
		this.currentEvents.next();
	}

	function teardownSlide(name) {


		document.dispatchEvent(new CustomEvent('a-slides_slide-teardown', {slideId: name}));
		if (slideData[name]) {
			slideData[name].teardown.bind(document.getElementById(name).querySelector('.panel-primary .panel-body'))();
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
	document.addEventListener('a-slides_trigger-event', function triggerEvent() {
		if(this.currentEvents.next().done) {
			goToNextSlide();
		}
	});

	document.addEventListener('a-slides_next-slide', () => goToNextSlide());
	document.addEventListener('a-slides_previous-slide', () => goToPrevSlide());

	document.addEventListener('a-slides_goto-slide', e => goToSlide(e.detail.slide));
	document.addEventListener('a-slides_goto-slide-by-number', e => goToSlide(e.detail.slide));
	document.addEventListener('a-slides_goto-slide-by-dom' , e => goToSlideByDOM(e.detail.slide));

}

module.exports = ASlide;
