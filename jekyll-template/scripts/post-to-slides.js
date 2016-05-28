'use strict';
/* global $, $$, ASlides, twemoji*/

/**
 * Turns a normal mrkdown blog posti into a slide deck!!
 * amazing right!!
 */

function addStyle(url){
	const styles = document.createElement('link');
	styles.rel = 'stylesheet';
	styles.type = 'text/css';
	styles.media = 'screen';
	styles.href = url;
	document.getElementsByTagName('head')[0].appendChild(styles);
}

function addScript (url) {
	const p = new Promise(function (resolve, reject) {
		const script = document.createElement('script');
		script.setAttribute('src', url);
		document.head.appendChild(script);
		script.onload = resolve;
		script.onerror = reject;
	});
	function promiseScript () {
		return p;
	};
	promiseScript.promise = p;
	return promiseScript;
}

// Fancy Emojis
addScript('https://twemoji.maxcdn.com/2/twemoji.min.js')().then(() => twemoji.parse(document.body, {
	folder: 'svg',
	ext: '.svg'
}));

function init() {
	return Promise.all([
		addScript('https://cdn.rawgit.com/AdaRoseEdwards/dirty-dom/v1.3.1/build/dirty-dom-lib.min.js').promise,
		addScript('https://cdn.rawgit.com/AdaRoseEdwards/a-slides/v1.2.1/build/a-slides.js').promise
	])
	.then(function () {

		const noSlides = $$('body > blockquote').length;
		const slideContainer = document.createElement('div').setClassName('a-slides_slide-container');
		let slide;
		let i=0;
		while (slide = $('body > blockquote')) {
			i++;
			let name = '';
			const notes = slide.prevAll();
			const newSlide = document.createElement('div').setClassName('a-slides_slide');
			const notesWrapper = document.createElement('div').setClassName('a-slides_notes');
			const progressBar = document.createElement('div').setClassName('a-slides_progress');
			progressBar.style.width = `${100*i/noSlides}%`;
			slide.classList.add('a-slides_slide-content');
			if (notes[0] && notes[0].tagName.match(/h[0-6]/i)) {
				name = notes[0].textContent.trim().replace(/[^A-Za-z0-9]/ig, '-').toLowerCase();
				name = name + (slideContainer.querySelectorAll(`[data-slide-id="${name}"]`).length || '');
			}
			newSlide.dataset.slideId = 'slide-' + (name || i);
			newSlide.appendChild(slide);
			newSlide.appendChild(notesWrapper);
			notes.forEach(note => notesWrapper.appendChild(note));
			slideContainer.appendChild(newSlide);
			newSlide.appendChild(progressBar);
		}
		document.body.prependChild(slideContainer);

		document.body.classList.remove('post');
	})
	.then(function () {

		const slideData = window.aSlidesSlideData || [];
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
				ASlides.prototype.plugins.bridgeServiceWorker
			]
		});

		if (location.search === '?presentation') {
			slideContainer.classList.add('presentation');
		}

		if (location.search === '?notes') {
			slideContainer.classList.add('hide-presentation');
		}

		let finishAt = Date.now() + 900*1000;
		const clock = document.createElement('div');
		slideContainer.appendChild(clock).setClassName('a-slides_clock');
		setInterval(() => clock.textContent = (new Date(Math.max(finishAt - Date.now(),0)))
			.toLocaleTimeString(undefined, {timeZone: 'UTC'}).match(/^\d\d:(\d\d:\d\d)/)[1], 200);
		clock.on('click', e => {
			e.preventDefault();
			finishAt = Date.now() + 900*1000;
		});
		return slideContainer;
	});
}

(function () {
	function locationHashChanged() {
		if (location.hash === '#aslides') {
			window.removeEventListener('hashchange', locationHashChanged);
			window.location.hash = oldHash;
			init().then(slideContainer => {
				slideContainer.fire('a-slides_goto-slide', {slide: oldHash ? $(`[data-slide-id="${oldHash.substr(1,Infinity)}"]`) : 0});
			});
		}
	}

	const oldHash = location.hash || false;

	if (location.hash === '#aslides' || location.search.indexOf('aslides') !== -1) {
		init().then(slideContainer => {
			if (location.hash === '#aslides' || oldHash === false) {
				slideContainer.fire('a-slides_goto-slide', {slide: 0});
			} else {
				slideContainer.fire('a-slides_goto-slide', {slide: $(`[data-slide-id="${oldHash.substr(1,Infinity)}"]`)});
			}
		});
	} else {
		window.addEventListener('hashchange', locationHashChanged);
	}
}());
