'use strict';

require('./util-polyfills');

// Render the slides markdown.
module.exports = function ({slideContainer}) {
	
	let slideController = window.make.div();
	slideController.classList.add('slide-controller');

	const closeButton = document.createElement('a');
	closeButton.innerHTML = '×';
	closeButton.on('click', () => slideController.classList.add('hidden'));
	closeButton.classList.add('slide-controller_close-button');
	slideController.appendChild(closeButton);

	function makeAndBindButton(text, fn) {
		const button = document.createElement('button');
		button.innerHTML = text;
		button.on('click', fn);
		slideController.insertBefore(button, closeButton);
		return button;
	}

	makeAndBindButton('Start Presentation', () => slideContainer.classList.toggle('presentation'));
	slideController.on('click', (e) => e.cancelBubble = true);

	slideContainer.appendChild(slideController);

	module.exports.makeAndBindButton = makeAndBindButton;
};
