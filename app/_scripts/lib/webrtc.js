
const EventEmitter = require('events').EventEmitter;
const Peer = require('peerjs');
const masterName = 'ada-slides-controller';

const peerSettings = {
	host: '1am.club',
	path:"/peerjs",
	port: 9000,
	secure: true,
	debug: 2
};


var myPeer;
module.exports = function setup(controller = true) {
	return new Promise((resolve, reject) => {

		myPeer = (controller ? new Peer(masterName, peerSettings) : new Peer(peerSettings))
			.on('error', e => {
				if (e.type === "unavailable-id") {
					controller = false;
					myPeer = new Peer(peerSettings)
						.on('error', e => {
							reject(e);
						})
						.on('open', resolve);
				} else {
					reject(e);
				}
			})
			.on('open', resolve);
	}).then(id => {

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
				console.log('Requseting slide', i);
				this.sendSignalToClients('goToSlide', i);
			}

			// Tell all of the clients to move on one event
			triggerRemoteEvent() {
				console.log('Triggering remote interaction event');
				this.sendSignalToClients('triggerEvent');
			}
		}
		let user = new WebrtcUser();

		if (controller) {
			console.log('You have the power', id);
			document.body.classList.add('controller');
			myPeer.on('connection', dataConn => {
				console.log('recieved connection from', dataConn.peer);
				user.addClient(dataConn);
			});
		} else {
			console.log('You are the slides', id);
			var dc = myPeer.connect(masterName);
			dc.on('data', data => {
				console.log('recieved instructions', JSON.stringify(data));
				user.fire(data.type, data.data);
			});
		}
		return user;
	});
};