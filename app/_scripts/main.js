'use strict';

const slide = require('./lib/slides');
// const Hammer = require('hammerjs');
const webrtc = require('./lib/webrtc');
const marked = require('marked');

$('.marked').each(function () {
	$(this).html(marked($(this).html()));
});

let requestSlide = (() => {});
let triggerRemoteEvent = (() => {});

function goToSlide(i) {
	const newSlide = $(`.slide:nth-child(${i + 1})`);
	const newSlideId = newSlide.attr('id');
	const oldSlide = $('.slide.active');
	const oldSlideId = oldSlide.attr('id');
	if (newSlide[0] && newSlide[0] !== oldSlide[0]) {
		oldSlide.removeClass('active');
		newSlide.addClass('active');
		slide.teardown(newSlideId);
		slide.setup(newSlideId);
		newSlide.off('transitionend');
		oldSlide.one('transitionend', () => slide.teardown(oldSlideId));
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

webrtc(location.hash === '#controller').then(user => {
	requestSlide = user.requestSlide.bind(user);
	triggerRemoteEvent = user.triggerRemoteEvent.bind(user);
	user.on('goToSlide', goToSlide);
	user.on('triggerEvent', triggerEvent);
}, err => {
	console.error('Failure to connect to webrtc', err);
});

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
$('.next-button').on('click', e => {
	goToNextSlide();
	e.stopPropagation();
});
$('.prev-button').on('click', e => {
	goToPrevSlide();
	e.stopPropagation();
});
$('.slide-container').on('click', triggerEvent);