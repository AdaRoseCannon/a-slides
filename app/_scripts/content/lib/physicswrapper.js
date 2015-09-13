'use strict';

const myWorker = new Worker("./scripts/physics.js");

function workerMessage(message) {

	// This wraps the message posting/response in a promise, which will resolve if the response doesn't
	// contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
	// controller.postMessage() and set up the onmessage handler independently of a promise, but this is
	// a convenient wrapper.
	return new Promise(function(resolve, reject) {
		const messageChannel = new MessageChannel();
		messageChannel.port1.onmessage = function(event) {
			if (event.data.error) {
				messageChannel.port1.onmessage = undefined;
				reject(event.data.error);
			} else {
				messageChannel.port1.onmessage = undefined;
				resolve(event.data);
			}
		};

		// This sends the message data as well as transferring messageChannel.port2 to the service worker.
		// The service worker can then use the transferred port to reply via postMessage(), which
		// will in turn trigger the onmessage handler on messageChannel.port1.
		// See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
		myWorker.postMessage(message, [messageChannel.port2]);
	});
}

class Physics {
	init(size) {
		this.objects = [];
		return workerMessage({action: 'init', size});
	}

	update() {
		return workerMessage({action: 'getModelData'}).then(function (e) {
			this.objects.splice(0);
			this.objects.push.apply(this.objects, e.modelData);
		}.bind(this));
	}

	addPoint(pointOptions) {
		return workerMessage({action: 'addPoint', pointOptions});
	}

	addObject(options) {
		return workerMessage({action: 'addObject', options});
	}
}

module.exports = Physics;
