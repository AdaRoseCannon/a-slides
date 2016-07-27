'use strict';

const { on } = require('../events');

// Add a little widget to the top of the screen for some slide functions
module.exports = function ({slideContainer}) {

	const slideController = document.createElement('div');
	slideController.classList.add('a-slides_slide-controller');

	const closeButton = document.createElement('a');
	closeButton.innerHTML = '×';
	on(closeButton, 'click', () => slideController.classList.add('hidden'));
	closeButton.classList.add('a-slides_slide-controller_close-button');
	slideController.appendChild(closeButton);

	function append(el) {
		slideController.insertBefore(el, closeButton);
	}

	function makeAndBindButton(text, fn) {
		const button = document.createElement('button');
		button.innerHTML = text;
		on(button, 'click', fn);
		append(button);
		return button;
	}

	makeAndBindButton('Begin', () => slideContainer.classList.toggle('presentation'));
	makeAndBindButton('Thumbnail', () => slideContainer.classList.toggle('hide-presentation'));
	on(slideController, 'click', (e) => e.cancelBubble = true);

	slideContainer.appendChild(slideController);

	module.exports.makeAndBindButton = makeAndBindButton;
	module.exports.append = append;
};
