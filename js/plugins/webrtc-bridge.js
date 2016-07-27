'use strict';

const slideController = require('./slide-controller');
const EventEmitter = require('events').EventEmitter;
const Peer = require('peerjs');
const MASTER_CONTROLLER_NAME = 'ada-slides-controller';
const { fire, on } = require('events');

// Define peerJS Details

let myPeer; // Peer
let webRTCStatus; // Status box

function webRTCSetup({peerSettings, peerController, slideContainer}) {

	if (myPeer) {
		myPeer.destroy();
	}

	return new Promise((resolve, reject) => {
		myPeer = (peerController ? new Peer(MASTER_CONTROLLER_NAME, peerSettings) : new Peer(peerSettings))
			.on('error', e => {
				if (e.type === 'unavailable-id') {
					reject(Error('Cannot take control, controller already present.'));
				} else {
					reject(e);
				}
			})
			.on('open', resolve);
	})
	.then(id => {

		class WebrtcUser {
			constructor(controller) {
				const ev = new EventEmitter();
				this.on = ev.on.bind(this);
				this.fire = ev.emit.bind(this);
				this.slideClients = [];
				this.controller = controller;
			}

			addClient(dataConn) {
				this.slideClients.push(dataConn);
			}

			sendData(dataConn, type, data) {
				dataConn.send({type, data});
			}

			sendSignalToClients(type, data) {
				this.slideClients.forEach(dc => this.sendData(dc, type, data));
			}

			// Tell all of the clients to move on one slide
			requestSlide(i) {
				console.log('Requesting slide', i);
				this.sendSignalToClients('goToSlide', i);
			}

			// Tell all of the clients to move on one event
			triggerRemoteEvent() {
				console.log('Triggering remote interaction event');
				this.sendSignalToClients('triggerEvent');
			}

			// Tell all of the clients to move on one event
			triggerRefresh() {
				console.log('Triggering refresh');
				this.sendSignalToClients('triggerRefresh');
			}
		}
		const user = new WebrtcUser(!!peerController);

		return new Promise(function (resolve) {
			if (peerController) {
				console.log('You have the power', id);
				slideContainer.classList.add('controller');
				on(myPeer, 'connection', dataConn => {
					console.log('recieved connection from', dataConn.peer);
					user.addClient(dataConn);
				});
			} else {
				console.log('You are a client', id);
				myPeer.connect(MASTER_CONTROLLER_NAME).on('data', data => {
					console.log('recieved instructions', JSON.stringify(data));
					fire(user, data.type, data.data);
				});
				on(myPeer, 'connection', dataConn => {
					console.log('recieved connection from', dataConn.peer);
					user.addClient(dataConn);
				});
			}
			resolve(user);
		});
	})
	.then(user => {

		on(slideContainer, 'a-slides_slide-setup', ({detail: {slideId}}) => user.requestSlide.bind(user)(slideId));
		on(slideContainer, 'a-slides_trigger-event', () => user.triggerRemoteEvent.bind(user)());
		on(slideContainer, 'a-slides_refresh-slide', () => user.triggerRefresh.bind(user)());
		on(user, 'goToSlide', slide => fire(slideContainer, 'a-slides_goto-slide', {slide: slideContainer.$(`.slide[data-slide-id="${slide}"]`)}));
		on(user, 'triggerEvent', () => fire(slideContainer, 'a-slides_trigger-event'));
		on(user, 'triggerRefresh', () => fire(slideContainer, 'a-slides_refresh-slide'));

		// Further Event Handling
		on(myPeer, 'error', e => {

			// Handle the could not connect situation
			if (e.type === 'peer-unavailable' && e.message === 'Could not connect to peer ada-slides-controller') {

				// Wait a few seconds and try reconnecting
				console.log('Lost connection to client.');
			} else {
				console.log(e);
				myPeer.destroy();
				webRTCStatus.innerHTML = `${e.type}: ${e.message}`;
				webRTCStatus.classList.remove('green');
				webRTCStatus.classList.add('red');
			}
		});

		on(myPeer, 'disconnected', function () {
			setTimeout(() => {
				if (!this.destroyed) {
					this.reconnect();
				}
			}, 3000);
		}.bind(myPeer));
	});
}

module.exports = function ({peerSettings}) {

	return function ({slideContainer}) {

		slideController.makeAndBindButton('WebRTC Parent', function () {
			webRTCSetup({
				peerSettings,
				peerController: true,
				slideContainer
			}).then(() => {
				webRTCStatus.classList.remove('red');
				webRTCStatus.classList.add('green');
				webRTCStatus.innerHTML = 'Controller';
			}).catch(e => {
				webRTCStatus.classList.remove('green');
				webRTCStatus.classList.add('red');
				webRTCStatus.innerHTML = e.message;
				console.error(e);
			});
		});

		slideController.makeAndBindButton('WebRTC Child', function () {
			webRTCSetup({
				peerSettings,
				peerController: false,
				slideContainer
			})
			.then(() => {
				webRTCStatus.classList.remove('red');
				webRTCStatus.classList.add('green');
				webRTCStatus.innerHTML = 'Controlled';
			}).catch(e => {
				webRTCStatus.classList.remove('green');
				webRTCStatus.classList.add('red');
				webRTCStatus.innerHTML = e.message;
				console.error(e);
			});
		});

		webRTCStatus = document.createElement('div');
		slideController.append(webRTCStatus);
		webRTCStatus.classList.add('red');
		webRTCStatus.classList.add('status');
		webRTCStatus.innerHTML = 'Not Connected';

		// if the client search param is present then jump
		// straight into presentation and try to connect.
		if (location.search === '?client') {
			slideContainer.classList.add('presentation');
			webRTCSetup({
				peerSettings,
				peerController: false,
				slideContainer
			})
			.then(() => {
				webRTCStatus.classList.remove('red');
				webRTCStatus.classList.add('green');
				webRTCStatus.innerHTML = 'Controlled';
			}).catch(e => {
				webRTCStatus.classList.remove('green');
				webRTCStatus.classList.add('red');
				webRTCStatus.innerHTML = e.message;
				console.error(e);
			});
		}
	};
};