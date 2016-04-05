'use strict';

const slideController = require('./slide-controller');

module.exports = function ({slideContainer}) {

	function sendSWMessage(message) {

		// This wraps the message posting/response in a promise, which will resolve if the response doesn't
		// contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
		// controller.postMessage() and set up the onmessage handler independently of a promise, but this is
		// a convenient wrapper.
		return new Promise(function(resolve, reject) {
			const messageChannel = new MessageChannel();
			messageChannel.port1.onmessage = function(event) {
				if (event.data.error) {
					reject(event.data.error);
				} else {
					resolve(event.data);
				}
			};

			// This sends the message data as well as transferring messageChannel.port2 to the service worker.
			// The service worker can then use the transferred port to reply via postMessage(), which
			// will in turn trigger the onmessage handler on messageChannel.port1.
			// See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
			navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
		});
	}

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('sw.js')
		.then(function(reg) {
			console.log('sw registered', reg);
		}).catch(function(error) {
			console.log('sw registration failed with ' + error);
		});

		if (navigator.serviceWorker.controller) {

			/**
			 * Set up bindings 
			 */

			slideController.makeAndBindButton('SW Parent', function () {
				slideContainer.on('a-slides_slide-setup', ({detail}) =>  sendSWMessage(detail));
				slideContainer.on('a-slides_trigger-event', () => sendSWMessage({
					triggerEvent: true
				}));
			});

			slideController.makeAndBindButton('SW Child', function () {

				window.addEventListener('message', function (e) {
					if(e.data.triggerEvent) {
						slideContainer.fire('a-slides_trigger-event');
					}
					if (e.data.detail) {
						slideContainer.fire('a-slides_goto-slide', {slide: slideContainer.$(`.slide[data-slide-id="${e.data.slideId}"]`)});
					}
				});
			});
		}
	}
};
