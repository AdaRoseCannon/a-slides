(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

require('./plugins/util-polyfills');

var slideSelector = function slideSelector(slideId) {
	return '.slide[data-slide-id="' + slideId + '"] .panel.slide-content .panel-body';
};

// Setup document listeners and event handlers
function ASlide(slideData) {
	var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	var _ref$plugins = _ref.plugins;
	var plugins = _ref$plugins === undefined ? [] : _ref$plugins;
	var _ref$slideContainer = _ref.slideContainer;
	var slideContainer = _ref$slideContainer === undefined ? document : _ref$slideContainer;

	var setupSlide = (function setupSlide(slideId) {

		location.hash = slideId;

		slideContainer.fire('a-slides_slide-setup', { slideId: slideId });

		if (slideData[slideId]) {
			slideData[slideId].setup.bind(slideContainer.$(slideSelector(slideId)))();
		} else {
			slideData[slideId] = {
				setup: function setup() {},
				action: _regeneratorRuntime.mark(function action() {
					return _regeneratorRuntime.wrap(function action$(context$3$0) {
						while (1) switch (context$3$0.prev = context$3$0.next) {
							case 0:
								context$3$0.next = 2;
								return;

							case 2:
							case 'end':
								return context$3$0.stop();
						}
					}, action, this);
				}),
				teardown: function teardown() {}
			};
		}

		this.currentEvents = slideData[slideId].action.bind(slideContainer.$(slideSelector(slideId)))();

		// if a go to new slide is already triggered then cancel it so
		// we don't accidentially go to the wrong slide.
		clearTimeout(this.nextSlideTimeOut);

		// Do first action
		this.currentEvents.next();
	}).bind(this);

	function teardownSlide(slideId) {

		slideContainer.fire('a-slides_slide-teardown', { slideId: slideId });
		if (slideData[slideId]) {
			slideData[slideId].teardown.bind(slideContainer.$(slideSelector(slideId)))();
		}
	}

	// Slide is a dom element or an integer
	function goToSlide(_ref2) {
		var slide = _ref2.slide;

		var newSlide = typeof slide === "number" ? $$('.slide')[slide] : slide;
		if (!newSlide) return;
		var newSlideId = newSlide.dataset.slideId;
		var oldSlide = $('.slide.active');
		if (newSlide && newSlide !== oldSlide) {
			if (oldSlide) {
				oldSlide.classList.remove('active');
				oldSlide.once('transitionend', function () {
					return teardownSlide(oldSlide.dataset.slideId);
				});
			}
			newSlide.off('transitionend');
			newSlide.classList.add('active');
			teardownSlide(newSlideId);
			setupSlide(newSlideId);
		}
	}

	function goToNextSlide() {
		goToSlide({ slide: $('.slide.active').prevAll().length + 1 });
	}

	function goToPrevSlide() {
		goToSlide({ slide: $('.slide.active').prevAll().length - 1 });
	}

	this.currentEvents = {
		next: function next() {
			return { done: false };
		}
	};

	// e.g. click presses next etc etc
	slideContainer.on('a-slides_trigger-event', (function () {
		if (this.currentEvents.next().done) {

			// Wait a smidge before triggering the next slide.
			this.nextSlideTimeOut = setTimeout(goToNextSlide, 10);
		}
	}).bind(this));

	slideContainer.on('a-slides_next-slide', function () {
		return goToNextSlide();
	});
	slideContainer.on('a-slides_previous-slide', function () {
		return goToPrevSlide();
	});
	slideContainer.on('a-slides_goto-slide', function (e) {
		return goToSlide(e.detail);
	});

	plugins.forEach(function (plugin) {
		if (typeof plugin === 'function') {
			plugin({
				slideData: slideData,
				slideContainer: slideContainer
			});
		}
	});
}

module.exports = ASlide;

},{"./plugins/util-polyfills":7,"babel-runtime/regenerator":106}],2:[function(require,module,exports){
'use strict';

require('./util-polyfills');

module.exports = function (_ref) {
	var slideContainer = _ref.slideContainer;

	if (location.hash) {

		var slide = $('.slide[data-slide-id="' + location.hash.slice(1) + '"]');

		// Find the slide the hash to simulate deeplinking
		if (slide) {
			slideContainer.fire('a-slides_goto-slide', { slide: slide });
		}

		slideContainer.scrollLeft = 0;
	} else {
		slideContainer.fire('a-slides_goto-slide', { slide: 0 });
	}
};

},{"./util-polyfills":7}],3:[function(require,module,exports){
'use strict';

require('./util-polyfills');

module.exports = function (_ref) {
	var slideContainer = _ref.slideContainer;

	window.addEventListener('keyup', function (e) {
		switch (e.keyCode) {

			// Left Arrow
			case 37:
				slideContainer.fire('a-slides_previous-slide');
				break;

			// Right Arrow
			case 13:
			case 39:
				slideContainer.fire('a-slides_trigger-event');
				break;

			case 27:
				slideContainer.classList.remove('presentation');
				break;
		}
	});

	slideContainer.on('click', function () {
		this.fire('a-slides_trigger-event');
	});
};

},{"./util-polyfills":7}],4:[function(require,module,exports){
'use strict';

require('./util-polyfills');

var Hammer = require('hammerjs');

module.exports = function (config) {

	return function (_ref) {
		var slideContainer = _ref.slideContainer;

		var touches = new Hammer(slideContainer);
		touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });

		if (config.use.indexOf('swipe-forward') !== -1) {
			touches.on('swipeleft', function () {
				return slideContainer.fire('a-slides_next-slide');
			});
		}

		if (config.use.indexOf('swipe-back') !== -1) {
			touches.on('swiperight', function () {
				return slideContainer.fire('a-slides_previous-slide');
			});
		}
	};
};

},{"./util-polyfills":7,"hammerjs":110}],5:[function(require,module,exports){
'use strict';

var _Map = require('babel-runtime/core-js/map')['default'];

require('./util-polyfills');

var marked = require('marked');

// Render the slides markdown.
module.exports = function () {
	var m = new _Map();

	// store all of the innerHTMLs
	$$('.marked').forEach(function (o) {
		return m.set(o, o.innerHTML);
	});

	// then write them all out
	m.forEach(function (v, k) {
		return k.innerHTML = marked(v);
	});
};

},{"./util-polyfills":7,"babel-runtime/core-js/map":21,"marked":111}],6:[function(require,module,exports){
'use strict';

require('./util-polyfills');

// Render the slides markdown.
module.exports = function (_ref) {
	var slideContainer = _ref.slideContainer;

	var slideController = window.make.div();
	slideController.classList.add('slide-controller');

	var closeButton = document.createElement('a');
	closeButton.innerHTML = '×';
	closeButton.on('click', function () {
		return slideController.classList.add('hidden');
	});
	closeButton.classList.add('slide-controller_close-button');
	slideController.appendChild(closeButton);

	function append(el) {
		slideController.insertBefore(el, closeButton);
	}

	function makeAndBindButton(text, fn) {
		var button = document.createElement('button');
		button.innerHTML = text;
		button.on('click', fn);
		append(button);
		return button;
	}

	makeAndBindButton('Begin', function () {
		return slideContainer.classList.toggle('presentation');
	});
	makeAndBindButton('Thumbnail', function () {
		return slideContainer.classList.toggle('hide-presentation');
	});
	slideController.on('click', function (e) {
		return e.cancelBubble = true;
	});

	slideContainer.appendChild(slideController);

	module.exports.makeAndBindButton = makeAndBindButton;
	module.exports.append = append;
};

},{"./util-polyfills":7}],7:[function(require,module,exports){
/**
 * Polyfill some utility functions.
 */

'use strict';

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

var marked = require('marked');

window.$ = function (expr) {
	return document.querySelector(expr);
};
window.$$ = function (expr) {
	return [].concat(_toConsumableArray(document.querySelectorAll(expr)));
};

Node.prototype.$ = function (expr) {
	return this.querySelector(expr);
};
Node.prototype.$$ = function (expr) {
	return [].concat(_toConsumableArray(this.querySelectorAll(expr)));
};

Node.prototype.on = window.on = function (name, fn) {
	if (!this.funcRef) this.funcRef = new _Set();

	// Store it for later
	this.funcRef.add(fn);
	this.addEventListener(name, fn);
	return this;
};

Node.prototype.prevAll = function () {
	var nodes = [].concat(_toConsumableArray(this.parentNode.children));
	var pos = nodes.indexOf(this);
	return nodes.slice(0, pos);
};

Node.prototype.off = window.off = function (name, fn) {
	var _this = this;

	if (!this.funcRef) return;
	if (fn) {
		this.removeEventListener(name, fn);
	} else {
		this.funcRef.forEach(function (fn) {
			return _this.removeEventListener(name, fn);
		});
	}
	this.funcRef['delete'](fn);
	return this;
};

Node.prototype.once = window.once = function (name, fn) {
	this.on(name, function tempF(e) {
		fn.bind(this)(e);
		this.off(name, tempF);
	});
	return this;
};

Node.prototype.removeSelf = function () {
	this.parentNode.removeChild(this);
	return this;
};

Node.prototype.addMarkdown = function () {
	for (var _len = arguments.length, str = Array(_len), _key = 0; _key < _len; _key++) {
		str[_key] = arguments[_key];
	}

	this.appendChild(make.markdown(str.join('\n')));
	return this;
};

Node.prototype.addHTML = function () {
	for (var _len2 = arguments.length, str = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		str[_key2] = arguments[_key2];
	}

	this.appendChild(document.createRange().createContextualFragment(str.join('\n')));
	return this;
};

Node.prototype.empty = function () {
	while (this.firstChild) this.removeChild(this.firstChild);
	return this;
};

Node.prototype.css = function (props) {
	function units(prop, i) {
		if (typeof i === "number") {
			if (prop.match(/width|height|top|left|right|bottom/)) {
				return i + "px";
			}
		}
		return i;
	}
	for (var n in props) {
		this.style[n] = units(n, props[n]);
	}
	return this;
};

Node.prototype.fire = function (name) {
	var detail = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	this.dispatchEvent(new CustomEvent(name, { detail: detail }));
	return this;
};

var make = {};
make.div = function () {
	return document.createElement('div');
};
make.br = function () {
	return document.createElement('br');
};
make.p = function () {
	return document.createElement('p');
};
make.text = function (text) {
	return document.createTextNode(text);
};
make.markdown = function (text) {
	return document.createRange().createContextualFragment(marked(text));
};
make.html = function (html) {
	return document.createRange().createContextualFragment(html);
};

window.make = make;

},{"babel-runtime/core-js/set":25,"babel-runtime/helpers/to-consumable-array":30,"marked":111}],8:[function(require,module,exports){
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

require('./util-polyfills');
var slideController = require('./slide-controller');
var EventEmitter = require('events').EventEmitter;
var Peer = require('peerjs');
var MASTER_CONTROLLER_NAME = 'ada-slides-controller';

// Define peerJS Details

var myPeer; // Peer
var webRTCStatus; // Status box

function webRTCSetup(_ref) {
	var peerSettings = _ref.peerSettings;
	var peerController = _ref.peerController;
	var slideContainer = _ref.slideContainer;

	if (myPeer) {
		myPeer.destroy();
	}

	return new _Promise(function (resolve, reject) {
		myPeer = (peerController ? new Peer(MASTER_CONTROLLER_NAME, peerSettings) : new Peer(peerSettings)).on('error', function (e) {
			if (e.type === "unavailable-id") {
				reject(Error('Cannot take control, controller already present.'));
			} else {
				reject(e);
			}
		}).on('open', resolve);
	}).then(function (id) {
		var WebrtcUser = (function () {
			function WebrtcUser(controller) {
				_classCallCheck(this, WebrtcUser);

				var ev = new EventEmitter();
				this.on = ev.on.bind(this);
				this.fire = ev.emit.bind(this);
				this.slideClients = [];
				this.controller = controller;
			}

			_createClass(WebrtcUser, [{
				key: 'addClient',
				value: function addClient(dataConn) {
					this.slideClients.push(dataConn);
				}
			}, {
				key: 'sendData',
				value: function sendData(dataConn, type, data) {
					dataConn.send({ type: type, data: data });
				}
			}, {
				key: 'sendSignalToClients',
				value: function sendSignalToClients(type, data) {
					var _this = this;

					this.slideClients.forEach(function (dc) {
						return _this.sendData(dc, type, data);
					});
				}

				// Tell all of the clients to move on one slide
			}, {
				key: 'requestSlide',
				value: function requestSlide(i) {
					console.log('Requesting slide', i);
					this.sendSignalToClients('goToSlide', i);
				}

				// Tell all of the clients to move on one event
			}, {
				key: 'triggerRemoteEvent',
				value: function triggerRemoteEvent() {
					console.log('Triggering remote interaction event');
					this.sendSignalToClients('triggerEvent');
				}
			}]);

			return WebrtcUser;
		})();

		var user = new WebrtcUser(!!peerController);

		return new _Promise(function (resolve) {
			if (peerController) {
				console.log('You have the power', id);
				slideContainer.classList.add('controller');
				myPeer.on('connection', function (dataConn) {
					console.log('recieved connection from', dataConn.peer);
					user.addClient(dataConn);
				});
			} else {
				console.log('You are a client', id);
				myPeer.connect(MASTER_CONTROLLER_NAME).on('data', function (data) {
					console.log('recieved instructions', JSON.stringify(data));
					user.fire(data.type, data.data);
				});
				myPeer.on('connection', function (dataConn) {
					console.log('recieved connection from', dataConn.peer);
					user.addClient(dataConn);
				});
			}
			resolve(user);
		});
	}).then(function (user) {

		slideContainer.on('a-slides_slide-setup', function (_ref2) {
			var slideId = _ref2.detail.slideId;
			return user.requestSlide.bind(user)(slideId);
		});
		slideContainer.on('a-slides_trigger-event', function () {
			return user.triggerRemoteEvent.bind(user)();
		});
		user.on('goToSlide', function (slide) {
			return slideContainer.fire('a-slides_goto-slide', { slide: slideContainer.$('.slide[data-slide-id="' + slide + '"]') });
		});
		user.on('triggerEvent', function () {
			return slideContainer.fire('a-slides_trigger-event');
		});

		// Further Event Handling
		myPeer.on('error', function (e) {

			// Handle the could not connect situation
			if (e.type === "peer-unavailable" && e.message === 'Could not connect to peer ada-slides-controller') {

				// Wait a few seconds and try reconnecting
				console.log('Lost connection to client.');
			} else {
				console.log(e);
				myPeer.destroy();
				webRTCStatus.innerHTML = e.type + ': ' + e.message;
				webRTCStatus.classList.remove('green');
				webRTCStatus.classList.add('red');
			}
		});

		myPeer.on('disconnected', (function () {
			var _this2 = this;

			setTimeout(function () {
				if (!_this2.destroyed) {
					_this2.reconnect();
				}
			}, 3000);
		}).bind(myPeer));
	});
}

module.exports = function (_ref3) {
	var peerSettings = _ref3.peerSettings;

	return function (_ref4) {
		var slideContainer = _ref4.slideContainer;

		slideController.makeAndBindButton('Be Slide Controller', function () {
			webRTCSetup({
				peerSettings: peerSettings,
				peerController: true,
				slideContainer: slideContainer
			}).then(function () {
				webRTCStatus.classList.remove('red');
				webRTCStatus.classList.add('green');
				webRTCStatus.innerHTML = 'Controller';
			})['catch'](function (e) {
				webRTCStatus.classList.remove('green');
				webRTCStatus.classList.add('red');
				webRTCStatus.innerHTML = e.message;
				console.error(e);
			});
		});

		slideController.makeAndBindButton('Recieve Control', function () {
			webRTCSetup({
				peerSettings: peerSettings,
				peerController: false,
				slideContainer: slideContainer
			}).then(function () {
				webRTCStatus.classList.remove('red');
				webRTCStatus.classList.add('green');
				webRTCStatus.innerHTML = 'Controlled';
			})['catch'](function (e) {
				webRTCStatus.classList.remove('green');
				webRTCStatus.classList.add('red');
				webRTCStatus.innerHTML = e.message;
				console.error(e);
			});
		});

		webRTCStatus = window.make.div();
		slideController.append(webRTCStatus);
		webRTCStatus.classList.add('red');
		webRTCStatus.classList.add('status');
		webRTCStatus.innerHTML = 'Not Connected';

		// if the client search param is present then jump
		// straight into presentation and try to connect.
		if (location.search === "?client") {
			slideContainer.classList.add('presentation');
			webRTCSetup({
				peerSettings: peerSettings,
				peerController: false,
				slideContainer: slideContainer
			}).then(function () {
				webRTCStatus.classList.remove('red');
				webRTCStatus.classList.add('green');
				webRTCStatus.innerHTML = 'Controlled';
			})['catch'](function (e) {
				webRTCStatus.classList.remove('green');
				webRTCStatus.classList.add('red');
				webRTCStatus.innerHTML = e.message;
				console.error(e);
			});
		}
	};
};

},{"./slide-controller":6,"./util-polyfills":7,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/class-call-check":28,"babel-runtime/helpers/create-class":29,"events":108,"peerjs":116}],9:[function(require,module,exports){
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var appendTarget = undefined;
var templates = {
	modal: '\n\t\t<div class="modal fade">\n\t\t\t<div class="modal-dialog">\n\t\t\t\t<div class="modal-content">\n\t\t\t\t\t<div class="modal-header">\n\t\t\t\t\t\t<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\n\t\t\t\t\t\t<legend>My Modal</legend>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="modal-body form">\n\t\t\t\t\t\t<div class="emoji-image-container bad-anim-div">🌝</div>\n\t\t\t\t\t\t<p>Pellentesque euismod facilisis dui. Cras dictum leo non metus faucibus, at lacinia erat euismod. Nunc sed facilisis dui. Ut pellentesque, dolor pretium rhoncus varius, sapien dolor volutpat elit, at porttitor risus mauris semper tellus. Ut pulvinar arcu urna, id tincidunt tellus convallis sollicitudin. Praesent non nisi nisl. Vestibulum lacinia ligula nisi, sit amet mattis lectus sagittis sit amet. Etiam a erat rutrum, cursus magna at, mattis orci. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nunc vitae risus odio. Donec egestas feugiat ex, lobortis aliquet leo tempus sed. Nulla pellentesque nisi vel neque lobortis, in cursus felis pretium.</p>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="modal-footer">\n\t\t\t\t\t\t<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="panel panel-primary pretend-web-app-with-modal">\n\t\t\t<div class="panel-heading">My Web App</div>\n\t\t\t<div class="panel-body">\n\t\t\t\t<div class="workspace container-fluid">\n\t\t\t\t\t<div class="row">\n\t\t\t\t\t\t<div class="col-sm-6">\n\t\t\t\t\t\t\t<div class="panel panel-default">\n\t\t\t\t\t\t\t\t<div class="panel-body">\n\t\t\t\t\t\t\t\t\tLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="col-sm-6">\n\t\t\t\t\t\t\t<div class="panel panel-default">\n\t\t\t\t\t\t\t\t<div class="panel-body">\n\t\t\t\t\t\t\t\t\tLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="panel panel-success">\n\t\t\t\t\t\t<div class="panel-heading">Notifications</div>\n\t\t\t\t\t\t<div class="panel-body notifications-go-here">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="panel panel-default">\n\t\t\t\t\t\t<div class="panel-heading">Widget 2.</div>\n\t\t\t\t\t\t<div class="panel-body">\n\t\t\t\t\t\t\tLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="panel panel-default">\n\t\t\t\t\t\t<div class="panel-heading">Widget 3.</div>\n\t\t\t\t\t\t<div class="panel-body">\n\t\t\t\t\t\t\tLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>',
	containment: '\n    {\n        height: <fixed value>;\n        width: <fixed value or a %>;\n        overflow: hidden;\n        position: absolute;\n        contain: strict; // ✨ In draft ✨\n    }'
};

var t = undefined;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup: function setup() {
		appendTarget = make.div();
	},
	action: _regeneratorRuntime.mark(function action() {
		return _regeneratorRuntime.wrap(function action$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:
					this.appendChild(appendTarget);

					appendTarget.addHTML(templates.modal);

					setTimeout(function () {
						return appendTarget.$('.modal').css({
							transform: 'scaleX(1)'
						});
					}, 500);
					context$1$0.next = 5;
					return;

				case 5:

					appendTarget.empty().addMarkdown(templates.containment);
					context$1$0.next = 8;
					return;

				case 8:
				case 'end':
					return context$1$0.stop();
			}
		}, action, this);
	}),
	teardown: function teardown() {

		clearInterval(t);
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};

},{"babel-runtime/regenerator":106}],10:[function(require,module,exports){
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var appendTarget;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup: function setup() {
		appendTarget = make.div().css({
			display: 'flex',
			width: '100%',
			height: '100%',
			"justify-content": 'center',
			"align-items": 'center',
			overflow: "hidden"
		});
	},
	action: _regeneratorRuntime.mark(function action() {
		return _regeneratorRuntime.wrap(function action$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:

					// Append the target to the dom
					this.appendChild(appendTarget);

					appendTarget.empty().addHTML('<iframe src="https://adaroseedwards.github.io/SoundThing/index.html" style="width: 100%; height: 100%;" seamless=true>');
					context$1$0.next = 4;
					return;

				case 4:

					appendTarget.empty().addHTML('<img src="images/cardboard.jpg" />');
					context$1$0.next = 7;
					return;

				case 7:
				case 'end':
					return context$1$0.stop();
			}
		}, action, this);
	}),
	teardown: function teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};

},{"babel-runtime/regenerator":106}],11:[function(require,module,exports){
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var appendTarget = undefined;
var content = {
	squidge: '<center><div class="squidge"><p>\n\t\t<div class="emoji-image-container bad-anim-div bad2">🌝</div><div class="emoji-image-container">🍄</div>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, Quisque pellentesqu\'e malesuada ex, ut malesuada nunc elementum tincidunt. Cras pulvinar consectetur odio non pellentesque. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec quis ullamcorper mi. Pellentesque justo eros, consequat at efficitur vitae, tristique at dolor. Etiam posuere sapien urna, a egestas eros tincidunt non. Quisque blandit, lorem vulputate efficitur tempus, enim massa sodales metus, sit amet molestie risus libero aliquam eros. Praesent libero erat, euismod efficitur finibus vel, tristique eu massa. Nullam fermentum scelerisque diam ut varius. Phasellus mi purus, facilisis non tincidunt sed, luctus ut ante. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.\n\t\t</p><p>\n\t\tSuspendisse hendrerit malesuada mi. Quisque elementum quis augue fringilla efficitur. Suspendisse potenti. Ut non sapien placerat erat luctus efficitur. Integer sit amet lorem vel libero tincidunt consectetur eget sit amet risus. Quisque rutrum quis erat nec efficitur. Donec id sem dignissim, gravida felis in, dapibus est.\n\t\t</p>\n\t\t<div class="emoji-image-container bad-anim-div">🌝</div>\n\t\t<p>\n\t\t\t\tPellentesque euismod facilisis dui. Cras dictum leo non metus faucibus, at lacinia erat euismod. Nunc sed facilisis dui. Ut pellentesque, dolor pretium rhoncus varius, sapien dolor volutpat elit, at porttitor risus mauris semper tellus. Ut pulvinar arcu urna, id tincidunt tellus convallis sollicitudin. Praesent non nisi nisl. Vestibulum lacinia ligula nisi, sit amet mattis lectus sagittis sit amet. Etiam a erat rutrum, cursus magna at, mattis orci. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nunc vitae risus odio. Donec egestas feugiat ex, lobortis aliquet leo tempus sed. Nulla pellentesque nisi vel neque lobortis, in cursus felis pretium.\n\t\t</p><p>\n\t\t\t\tAliquam felis tortor, efficitur id quam aliquet, mollis molestie est. Curabitur sed eros sodales, gravida ante et, pretium nisl. Nunc pellentesque arcu ut tristique sodales. Praesent varius pharetra dolor vitae laoreet. Donec tincidunt velit nec libero lobortis, non eleifend nunc finibus. Donec pellentesque dui scelerisque enim convallis aliquam. Pellentesque pharetra sed ligula vel maximus. Aenean eget luctus enim, a ullamcorper justo. Nulla et elementum ante, tempor dictum neque. Vivamus imperdiet imperdiet mi. Nunc sed nulla nec urna sodales finibus sed eget tortor. Aenean euismod diam mauris, eu eleifend enim auctor eu. In sit amet facilisis dolor, et commodo nisi. Aliquam quis lobortis diam. Pellentesque tristique vehicula nisl, id dignissim justo auctor vel.\n\t\t</p><p>\n\t\t\t\tCurabitur ut ultricies sapien, vel tempor nisl. Etiam pretium in ipsum eu eleifend. Morbi sodales quis nisl eu dapibus. Cras elementum interdum ligula nec viverra. Donec maximus rutrum elit, ut elementum dolor tincidunt eu. In molestie ac nulla vel mollis. Praesent rhoncus turpis lorem, vitae interdum dolor congue non. Ut congue commodo mi pellentesque luctus. In at nulla tempus, condimentum ante in, rutrum felis. Curabitur a dictum lectus. Vivamus quis urna ut est sagittis gravida. Etiam pretium auctor magna at egestas.\n\t\t</p></div></center>\n\t'
};
var t = undefined;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup: function setup() {
		appendTarget = make.div();
	},
	action: _regeneratorRuntime.mark(function action() {
		var i, pre, m, scale;
		return _regeneratorRuntime.wrap(function action$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:
					this.appendChild(appendTarget);

					i = 0;
					pre = document.createElement('pre');

					appendTarget.empty().appendChild(pre);
					t = setInterval(function () {
						pre.addHTML(i++ % 2 === 1 ? 'myVar = el.clientHeight;\n' : 'el.height = (myVar + 1) + "px"\n');
					}, 800);
					context$1$0.next = 7;
					return;

				case 7:

					clearInterval(t);
					pre.innerHTML = '';
					t = setInterval(function () {
						pre.addHTML('myDomEl.innerHTML += "I know a song which\'ll get on your nerves...";\n');
					}, 800);
					context$1$0.next = 12;
					return;

				case 12:

					clearInterval(t);
					appendTarget.innerHTML = '<img src="images/fastdom.png" />';
					context$1$0.next = 16;
					return;

				case 16:

					appendTarget.innerHTML = '\n\t\t\t<div class="fastdom-container unsorted">\n\t\t\t\t<div class="fastdom read" style="order: 1;"><pre>readFunc1()</pre></div>\n\t\t\t\t<div class="fastdom write" style="order: 2;"><pre>writeFunc1()</pre></div>\n\t\t\t\t<div class="fastdom read" style="order: 1;"><pre>readFunc2()</pre></div>\n\t\t\t\t<div class="fastdom write" style="order: 2;"><pre>writeFunc2()</pre></div>\n\t\t\t\t<div class="fastdom read" style="order: 1;"><pre>readFunc3()</pre></div>\n\t\t\t\t<div class="fastdom write" style="order: 2;"><pre>writeFunc3()</pre></div>\n\t\t\t\t<div class="fastdom read" style="order: 1;"><pre>readFunc4()</pre></div>\n\t\t\t\t<div class="fastdom write" style="order: 2;"><pre>writeFunc4()</pre></div>\n\t\t\t</div>\n\t\t';

					m = new _Map();

					appendTarget.$$('.fastdom').forEach(function (el) {
						return m.set(el, el.getBoundingClientRect());
					});

					appendTarget.$('.fastdom-container').classList.remove('unsorted');

					scale = $('.slide-container.presentation') ? 1 : 0.4;

					m.forEach(function (rect1, el) {
						var rect2 = el.getBoundingClientRect();
						el.style.transform = 'translate(' + (rect1.left - rect2.left) / scale + 'px, ' + (rect1.top - rect2.top) / scale + 'px)';
					});

					context$1$0.next = 24;
					return;

				case 24:

					m.forEach(function (rect1, el) {
						return el.css({
							transform: 'scale(1)',
							transition: 'transform 2s ease'
						});
					});
					context$1$0.next = 27;
					return;

				case 27:

					appendTarget.innerHTML = content.squidge;
					context$1$0.next = 30;
					return;

				case 30:

					appendTarget.innerHTML = '<div class="fancy">Lorem Ipsum is simply dummy text of the printing and \n\t\t\t\t\t\t\t\ttypesetting industry. Lorem Ipsum has been the industry\'s standard \n\t\t\t\t\t\t\t\tdummy text ever since the 1500s, Quisque pellentesqu\'e malesu\n\t\t\t\t\t\t\t\tada ex,\n\t\t\t\t\t\t\t\t ut malesuada nunc elementum tincidunt. Cras pulvinar consectetur \n\t\t\t\t\t\t\t\t odio non pellentesque. Vestibulum ante ipsum primis in \n\t\t\t\t\t\t\t\t faucibus orci luctus et ultrices posuere cubilia Curae; Donec quis\n\t\t\t\t\t\t\t\t  ullamcorper mi. Pellentesque justo eros, consequat at efficitur vitae\n\t\t\t\t\t\t\t\t  , tristique at dolor. Etiam posuere sapien urna, a egestas eros tincidunt non.\n\t\t\t\t\t\t\t\t</div>';
					context$1$0.next = 33;
					return;

				case 33:

					appendTarget.innerHTML = '<div class="pretty1">🌝</div>' + '<div class="pretty2">🌝</div>' + '<div class="pretty3">🌝</div>' + '<div class="pretty4">🌝</div>' + '<div class="pretty5">🌝</div>' + '<div class="pretty6">🌝</div>' + '<div class="pretty7">🌝</div>' + '<div class="pretty8">🌝</div>' + '<div class="pretty9">🌝</div>';
					context$1$0.next = 36;
					return;

				case 36:
				case 'end':
					return context$1$0.stop();
			}
		}, action, this);
	}),
	teardown: function teardown() {

		clearInterval(t);
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};

},{"babel-runtime/core-js/map":21,"babel-runtime/regenerator":106}],12:[function(require,module,exports){
'use strict';

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var appendTarget = undefined;
var TWEEN = require('tween.js');

var templates = {
	demoApp: '\n\t\t<div class="panel panel-primary pretend-web-app">\n\t\t\t<div class="panel-heading">My Web App</div>\n\t\t\t<div class="panel-body pretend-web-app-body">\n\t\t\t\t<div class="panel panel-success">\n\t\t\t\t\t<div class="panel-heading">Notifications</div>\n\t\t\t\t\t<div class="panel-body notifications-go-here">\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="panel panel-default">\n\t\t\t\t\t<div class="panel-heading">Widget 2.</div>\n\t\t\t\t\t<div class="panel-body">\n\t\t\t\t\t\tLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class="panel panel-default">\n\t\t\t\t\t<div class="panel-heading">Widget 3.</div>\n\t\t\t\t\t<div class="panel-body">\n\t\t\t\t\t\tLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>',

	notification: function notification(c) {
		return '<div class="alert alert-dismissable alert-warning">\n\t\t\t<button type="button" class="close" data-dismiss="alert">×</button><b>Warning ' + c + '</b>: Server Room On Fire\n\t\t</div>';
	}
};

var timeout = undefined;
var raf = undefined;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup: function setup() {
		appendTarget = make.div();
		var t = 0;
		(function animate() {
			TWEEN.update(t);
			t += 16;
			raf = requestAnimationFrame(animate);
		})();
	},
	action: _regeneratorRuntime.mark(function action() {
		var marked1$0, displayBoundingRects, notificationCount, addNotification, magicTransformGen, changeContent, naiveContent, smoothAdding, smoothContent, magicTransform2, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, i;

		return _regeneratorRuntime.wrap(function action$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:
					changeContent = function changeContent() {
						var myThing;
						return _regeneratorRuntime.wrap(function changeContent$(context$2$0) {
							while (1) switch (context$2$0.prev = context$2$0.next) {
								case 0:
									context$2$0.next = 2;
									return addNotification();

								case 2:
									context$2$0.next = 4;
									return addNotification();

								case 4:
									myThing = make.div();

									myThing.innerHTML = '<div class="panel panel-default">\n\t\t\t\t<div class="panel-body">\n\t\t\t\t\tLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.\n\t\t\t\t</div>\n\t\t\t</div>';

									$('.pretend-web-app-body').prepend(myThing);
									context$2$0.next = 9;
									return myThing;

								case 9:
								case 'end':
									return context$2$0.stop();
							}
						}, marked1$0[1], this);
					};

					magicTransformGen = function magicTransformGen(_ref) {
						var fn = _ref.fn;
						var elementsToWatch = _ref.elementsToWatch;
						var callback = _ref.callback;
						var time = _ref.time;
						var measurements, setElSize, setChildrenScale;
						return _regeneratorRuntime.wrap(function magicTransformGen$(context$2$0) {
							while (1) switch (context$2$0.prev = context$2$0.next) {
								case 0:
									setChildrenScale = function setChildrenScale(m) {
										[].concat(_toConsumableArray(m.el.children)).forEach(function (el) {
											el.style.transform = 'scale(' + 1 / m.newTransform.scaleX + ', ' + 1 / m.newTransform.scaleY + ')';
										});
									};

									setElSize = function setElSize(m) {
										m.el.style.transform = 'translate(' + m.newTransform.offsetX * m.newTransform.scaleX + 'px, ' + m.newTransform.offsetY * m.newTransform.scaleY + 'px) scale(' + m.newTransform.scaleX + ', ' + m.newTransform.scaleY + ')';
									};

									measurements = elementsToWatch.map(function (el) {
										var output = {
											el: el,
											initialDimensions: el.getBoundingClientRect()
										};
										return output;
									});

									// calculate the children's offsets
									measurements.forEach(function (m) {

										// Set the child transform offsets to the parents top left
										// so that when scaled down they also retun to their orignal position.
										[].concat(_toConsumableArray(m.el.children)).forEach(function (el) {
											var size = el.getBoundingClientRect();
											var offsetFromParent = {
												x: size.left - m.initialDimensions.left,
												y: size.top - m.initialDimensions.top
											};
											el.style.transformOrigin = offsetFromParent.x + 'px ' + offsetFromParent.y + 'px';
										});
									});

									// Demonstrate measuring
									displayBoundingRects(elementsToWatch);
									context$2$0.next = 7;
									return;

								case 7:
									$$('.dimensionIndicator').forEach(function (i) {
										return i.removeSelf();
									});

									// Run the function which makes changes.
									fn();

									// Demonstrate measuring
									displayBoundingRects(elementsToWatch);
									context$2$0.next = 12;
									return;

								case 12:
									$$('.dimensionIndicator').forEach(function (i) {
										return i.removeSelf();
									});

									// calculate the new size/offset of each el
									measurements.forEach(function (m) {
										m.newDimensions = m.el.getBoundingClientRect();
										m.el.style.transition = "0s";
										m.el.style.transformOrigin = "0 0 0";
										m.newTransform = {
											scaleY: m.initialDimensions.height / m.newDimensions.height,
											scaleX: m.initialDimensions.width / m.newDimensions.width,
											offsetX: m.initialDimensions.left - m.newDimensions.left,
											offsetY: m.initialDimensions.top - m.newDimensions.top
										};
									});

									// Set the transforms of the el

									// Restore the initial sizes
									measurements.forEach(setElSize);
									context$2$0.next = 17;
									return;

								case 17:

									// Scale the children too
									measurements.forEach(setChildrenScale);
									context$2$0.next = 20;
									return;

								case 20:

									// Animate the restoration
									_Promise.all(measurements.map(function (m) {
										return new _Promise(function (resolve) {
											new TWEEN.Tween(m.newTransform).to({
												scaleY: 1,
												scaleX: 1,
												offsetX: 0,
												offsetY: 0
											}, time || 1000).easing(TWEEN.Easing.Quadratic.Out).onUpdate(function () {
												m.newTransform.scaleX = this.scaleX;
												m.newTransform.scaleY = this.scaleY;
												m.newTransform.offsetX = this.offsetX;
												m.newTransform.offsetY = this.offsetY;
												setElSize(m);
												setChildrenScale(m);
											}).onComplete(resolve).start();
										});
									})).then(callback || function () {});

								case 21:
								case 'end':
									return context$2$0.stop();
							}
						}, marked1$0[0], this);
					};

					displayBoundingRects = function displayBoundingRects(els) {
						els.forEach(function (el) {
							var dimensions = el.getBoundingClientRect();
							var dimensionIndicator = make.div();
							dimensionIndicator.classList.add("dimensionIndicator");
							dimensionIndicator.dataset.tl = parseInt(dimensions.left, 10) + ', ' + parseInt(dimensions.top, 10);
							dimensionIndicator.dataset.br = parseInt(dimensions.right, 10) + ', ' + parseInt(dimensions.bottom, 10);
							dimensionIndicator.css(dimensions);
							$('.slide-container').appendChild(dimensionIndicator);
						});
					};

					marked1$0 = [magicTransformGen, changeContent].map(_regeneratorRuntime.mark);

					this.appendChild(appendTarget);

					notificationCount = 0;

					addNotification = function addNotification() {
						var newNotification = make.div().addHTML(templates.notification(++notificationCount));
						appendTarget.$('.notifications-go-here').prepend(newNotification);
						return newNotification;
					};

					// Add the demoApp
					appendTarget.empty().addHTML(templates.demoApp);

					naiveContent = changeContent();

					timeout = setInterval(function () {
						return naiveContent.next();
					}, 2000);
					context$1$0.next = 12;
					return;

				case 12:

					clearInterval(timeout);
					appendTarget.empty().addHTML(templates.demoApp);

					smoothAdding = true;
					smoothContent = changeContent();

					(function smoothAdd() {
						var newEl = undefined;
						var magicTransform1 = magicTransformGen({
							fn: function fn() {
								newEl = smoothContent.next().value;
								if (newEl) newEl.style.opacity = 0;
							},
							elementsToWatch: appendTarget.$$('.panel:not(.pretend-web-app)'),
							time: 1000,
							callback: function callback() {
								if (newEl) newEl.css({
									transition: 'opacity 0.3s ease',
									opacity: 1
								});
								if (smoothAdding) smoothAdd();
							}
						});

						// Just do it all in one go;
						var _iteratorNormalCompletion = true;
						var _didIteratorError = false;
						var _iteratorError = undefined;

						try {
							for (var _iterator = _getIterator(magicTransform1), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var i = _step.value;
							}
						} catch (err) {
							_didIteratorError = true;
							_iteratorError = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion && _iterator['return']) {
									_iterator['return']();
								}
							} finally {
								if (_didIteratorError) {
									throw _iteratorError;
								}
							}
						}
					})();

					context$1$0.next = 19;
					return;

				case 19:

					// Stop adding more
					smoothAdding = false;

					// Reset then go through again this time step by step
					// showing the child element the whole time
					//
					appendTarget.empty().addHTML(templates.demoApp);
					magicTransform2 = magicTransformGen({
						fn: addNotification,
						elementsToWatch: appendTarget.$$('.panel:not(.pretend-web-app)'),
						time: 1000
					});
					_iteratorNormalCompletion2 = true;
					_didIteratorError2 = false;
					_iteratorError2 = undefined;
					context$1$0.prev = 25;
					_iterator2 = _getIterator(magicTransform2);

				case 27:
					if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
						context$1$0.next = 34;
						break;
					}

					i = _step2.value;
					context$1$0.next = 31;
					return i;

				case 31:
					_iteratorNormalCompletion2 = true;
					context$1$0.next = 27;
					break;

				case 34:
					context$1$0.next = 40;
					break;

				case 36:
					context$1$0.prev = 36;
					context$1$0.t0 = context$1$0['catch'](25);
					_didIteratorError2 = true;
					_iteratorError2 = context$1$0.t0;

				case 40:
					context$1$0.prev = 40;
					context$1$0.prev = 41;

					if (!_iteratorNormalCompletion2 && _iterator2['return']) {
						_iterator2['return']();
					}

				case 43:
					context$1$0.prev = 43;

					if (!_didIteratorError2) {
						context$1$0.next = 46;
						break;
					}

					throw _iteratorError2;

				case 46:
					return context$1$0.finish(43);

				case 47:
					return context$1$0.finish(40);

				case 48:
					context$1$0.next = 50;
					return;

				case 50:
				case 'end':
					return context$1$0.stop();
			}
		}, action, this, [[25, 36, 40, 48], [41,, 43, 47]]);
	}),
	teardown: function teardown() {
		clearInterval(timeout);
		cancelAnimationFrame(raf);
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};

// yields at interesting points

// set it's children's transforms to the inverse of it's own

// pause at each yield

},{"babel-runtime/core-js/get-iterator":20,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/to-consumable-array":30,"babel-runtime/regenerator":106,"tween.js":124}],13:[function(require,module,exports){
"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var appendTarget;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup: function setup() {
		appendTarget = make.div();
	},
	action: _regeneratorRuntime.mark(function action() {
		return _regeneratorRuntime.wrap(function action$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:

					// Append the target to the dom
					this.appendChild(appendTarget);

					appendTarget.empty().addHTML("<img src=\"images/wile.jpg\" style=\"width: 100%; height: 100%;\">");
					context$1$0.next = 4;
					return;

				case 4:

					appendTarget.empty().addHTML("<img src=\"images/wile.gif\" style=\"width: 100%; height: 100%;\">");
					context$1$0.next = 7;
					return;

				case 7:

					appendTarget.empty().addHTML("<img src=\"images/choco.jpg\" style=\"width: 100%; height: 100%;\">");
					context$1$0.next = 10;
					return;

				case 10:

					appendTarget.empty().addHTML("<video src=\"images/angela.webm\" style=\"width: 100%; height: 100%;\" autoplay loop>");
					context$1$0.next = 13;
					return;

				case 13:
				case "end":
					return context$1$0.stop();
			}
		}, action, this);
	}),
	teardown: function teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};

},{"babel-runtime/regenerator":106}],14:[function(require,module,exports){
/**
 * The key names match the slideId in the _posts directory
 */

'use strict';

module.exports = {
	'/jank': require('./jank'),
	'/dom': require('./dom'),
	'/dom2': require('./dom2'), // Page removed
	'/worker': require('./worker'),
	'/containment': require('./containment'),
	'/demos': require('./demos'),
	'/simd': require('./simd'),
	'/frontloading': require('./frontloading')
};

},{"./containment":9,"./demos":10,"./dom":11,"./dom2":12,"./frontloading":13,"./jank":15,"./simd":16,"./worker":17}],15:[function(require,module,exports){
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var appendTarget;

var contentToAppend = ['## Slow 🐢\n* Layout\n* Paint', '## Fast 🐰\n* Composite\nyield'];

var cssTriggers = ['## Great Resource:', "### Paul Lewis's CSS Triggers", '![](images/css-triggers.png)', '# http://csstriggers.com/'].join('\n');

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup: function setup() {
		appendTarget = make.div();
	},
	action: _regeneratorRuntime.mark(function action() {
		var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, content, child;

		return _regeneratorRuntime.wrap(function action$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:

					// Append the target to the dom
					this.appendChild(appendTarget);

					appendTarget.addMarkdown('# Performance, what is jank?');
					context$1$0.next = 4;
					return;

				case 4:

					appendTarget.addMarkdown('<div><img src="images/jank-profile.png" /></div>');
					context$1$0.next = 7;
					return;

				case 7:
					_iteratorNormalCompletion = true;
					_didIteratorError = false;
					_iteratorError = undefined;
					context$1$0.prev = 10;
					_iterator = _getIterator(contentToAppend);

				case 12:
					if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
						context$1$0.next = 25;
						break;
					}

					content = _step.value;
					child = make.div();

					child.style.display = 'inline-block';
					child.style.float = 'left';
					child.style.padding = '0 0.5em';
					child.appendChild(make.markdown(content));
					appendTarget.appendChild(child);
					context$1$0.next = 22;
					return;

				case 22:
					_iteratorNormalCompletion = true;
					context$1$0.next = 12;
					break;

				case 25:
					context$1$0.next = 31;
					break;

				case 27:
					context$1$0.prev = 27;
					context$1$0.t0 = context$1$0['catch'](10);
					_didIteratorError = true;
					_iteratorError = context$1$0.t0;

				case 31:
					context$1$0.prev = 31;
					context$1$0.prev = 32;

					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}

				case 34:
					context$1$0.prev = 34;

					if (!_didIteratorError) {
						context$1$0.next = 37;
						break;
					}

					throw _iteratorError;

				case 37:
					return context$1$0.finish(34);

				case 38:
					return context$1$0.finish(31);

				case 39:

					appendTarget.empty();
					appendTarget.appendChild(make.markdown(cssTriggers));
					context$1$0.next = 43;
					return;

				case 43:
				case 'end':
					return context$1$0.stop();
			}
		}, action, this, [[10, 27, 31, 39], [32,, 34, 38]]);
	}),
	teardown: function teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};

},{"babel-runtime/core-js/get-iterator":20,"babel-runtime/regenerator":106}],16:[function(require,module,exports){
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var appendTarget;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup: function setup() {
		appendTarget = make.div().css({
			display: 'flex',
			width: '100%',
			height: '100%',
			"justify-content": 'center',
			"align-items": 'center',
			overflow: "hidden",
			"flex-direction": 'column'
		});
	},
	action: _regeneratorRuntime.mark(function action() {
		return _regeneratorRuntime.wrap(function action$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:

					// Append the target to the dom
					this.appendChild(appendTarget);

					appendTarget.addHTML('<h2 style="text-align: center; font-weight: 100; font-size: 5em; margin: 0;">SIMD</h2>\n\t\t\t\t  <h3 style="text-align: center; font-weight: 100;">(Pronounced SIM-DEE)</h3>');
					context$1$0.next = 4;
					return;

				case 4:

					appendTarget.empty().addHTML('<img src="images/SIMD.png" />');
					context$1$0.next = 7;
					return;

				case 7:
				case 'end':
					return context$1$0.stop();
			}
		}, action, this);
	}),
	teardown: function teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};

},{"babel-runtime/regenerator":106}],17:[function(require,module,exports){
'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var appendTarget;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup: function setup() {
		appendTarget = make.div().css({
			position: 'absolute',
			width: '100%',
			height: '100%',
			top: 0,
			left: 0,
			background: 'rgba(255,255,255,0.95)',
			display: 'flex',
			"align-items": 'center',
			"justify-content": 'center',
			opacity: 0,
			transform: 'scale(0.5, 0.5)',
			transition: 'transform 1s ease, opacity 1s ease'
		});
	},
	action: _regeneratorRuntime.mark(function action() {
		return _regeneratorRuntime.wrap(function action$(context$1$0) {
			while (1) switch (context$1$0.prev = context$1$0.next) {
				case 0:

					appendTarget.addMarkdown('\n\t\t\tworkerMessage({\n\t\t\t\taction: \'doThing\',\n\t\t\t\tmyVar: 4\n\t\t\t})\n\t\t\t.then(data => {\n\t\t\t\tconsole.log(data.response);\n\t\t\t});\n\t\t');

					// Append the target to the dom
					this.appendChild(appendTarget);

					context$1$0.next = 4;
					return;

				case 4:

					appendTarget.style.transform = 'scale(1, 1)';
					appendTarget.style.opacity = 1;

					context$1$0.next = 8;
					return;

				case 8:
				case 'end':
					return context$1$0.stop();
			}
		}, action, this);
	}),
	teardown: function teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};

},{"babel-runtime/regenerator":106}],18:[function(require,module,exports){
'use strict';

/**
 * Constants
 */

/**
 * Dependencies
 */

var ASlides = require('./a-slides');
var slideData = require('./content');
var slideContainer = document.querySelector('.slide-container');

new ASlides(slideData, {
	slideContainer: slideContainer,
	plugins: [require('./a-slides/plugins/markdown'), // needs to be run first
	require('./a-slides/plugins/slide-controller'), // needs to be run before buttons are added to it.
	require('./a-slides/plugins/deep-linking'), require('./a-slides/plugins/interaction-keyboard-mouse'), require('./a-slides/plugins/interaction-touch')({
		use: ['swipe-back']
	}), require('./a-slides/plugins/deep-linking'), require('./a-slides/plugins/webrtc-bridge')({
		peerSettings: {
			host: '1am.club',
			secure: true,
			port: 9000,
			debug: 2,
			path: "/peerjs"
		}
	})]
});

if (location.search === '?presentation') {
	slideContainer.classList.add('presentation');
}

if (location.search === '?notes') {
	slideContainer.classList.add('hide-presentation');
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js').then(function (reg) {
		console.log('sw registered', reg);
	})['catch'](function (error) {
		console.log('sw registration failed with ' + error);
	});

	if (navigator.serviceWorker.controller) {
		console.log('Offlining Available');
	}
}

},{"./a-slides":1,"./a-slides/plugins/deep-linking":2,"./a-slides/plugins/interaction-keyboard-mouse":3,"./a-slides/plugins/interaction-touch":4,"./a-slides/plugins/markdown":5,"./a-slides/plugins/slide-controller":6,"./a-slides/plugins/webrtc-bridge":8,"./content":14}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":31}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":32}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":33}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":34}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":35}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":36}],25:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":37}],26:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":38}],27:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":39}],28:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],29:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":23}],30:[function(require,module,exports){
"use strict";

var _Array$from = require("babel-runtime/core-js/array/from")["default"];

exports["default"] = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return _Array$from(arr);
  }
};

exports.__esModule = true;
},{"babel-runtime/core-js/array/from":19}],31:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/$.core').Array.from;
},{"../../modules/$.core":47,"../../modules/es6.array.from":95,"../../modules/es6.string.iterator":101}],32:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":94,"../modules/es6.string.iterator":101,"../modules/web.dom.iterable":105}],33:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
module.exports = require('../modules/$.core').Map;
},{"../modules/$.core":47,"../modules/es6.map":97,"../modules/es6.object.to-string":98,"../modules/es6.string.iterator":101,"../modules/es7.map.to-json":103,"../modules/web.dom.iterable":105}],34:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":70}],35:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":70}],36:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$.core').Promise;
},{"../modules/$.core":47,"../modules/es6.object.to-string":98,"../modules/es6.promise":99,"../modules/es6.string.iterator":101,"../modules/web.dom.iterable":105}],37:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
module.exports = require('../modules/$.core').Set;
},{"../modules/$.core":47,"../modules/es6.object.to-string":98,"../modules/es6.set":100,"../modules/es6.string.iterator":101,"../modules/es7.set.to-json":104,"../modules/web.dom.iterable":105}],38:[function(require,module,exports){
require('../../modules/es6.symbol');
module.exports = require('../../modules/$.core').Symbol;
},{"../../modules/$.core":47,"../../modules/es6.symbol":102}],39:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/$.wks')('iterator');
},{"../../modules/$.wks":92,"../../modules/es6.string.iterator":101,"../../modules/web.dom.iterable":105}],40:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],41:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":63}],42:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , TAG = require('./$.wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./$.cof":43,"./$.wks":92}],43:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],44:[function(require,module,exports){
'use strict';
var $            = require('./$')
  , hide         = require('./$.hide')
  , ctx          = require('./$.ctx')
  , species      = require('./$.species')
  , strictNew    = require('./$.strict-new')
  , defined      = require('./$.defined')
  , forOf        = require('./$.for-of')
  , step         = require('./$.iter-step')
  , ID           = require('./$.uid')('id')
  , $has         = require('./$.has')
  , isObject     = require('./$.is-object')
  , isExtensible = Object.isExtensible || isObject
  , SUPPORT_DESC = require('./$.support-desc')
  , SIZE         = SUPPORT_DESC ? '_s' : 'size'
  , id           = 0;

var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!$has(it, ID)){
    // can't set id to frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
};

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      strictNew(that, C, NAME);
      that._i = $.create(null); // index
      that._f = undefined;      // first entry
      that._l = undefined;      // last entry
      that[SIZE] = 0;           // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(SUPPORT_DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    require('./$.iter-define')(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    species(C);
    species(require('./$.core')[NAME]); // for wrapper
  }
};
},{"./$":70,"./$.core":47,"./$.ctx":48,"./$.defined":50,"./$.for-of":54,"./$.has":57,"./$.hide":58,"./$.is-object":63,"./$.iter-define":66,"./$.iter-step":68,"./$.mix":74,"./$.species":80,"./$.strict-new":81,"./$.support-desc":83,"./$.uid":90}],45:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var forOf   = require('./$.for-of')
  , classof = require('./$.classof');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    var arr = [];
    forOf(this, false, arr.push, arr);
    return arr;
  };
};
},{"./$.classof":42,"./$.for-of":54}],46:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , $def       = require('./$.def')
  , hide       = require('./$.hide')
  , forOf      = require('./$.for-of')
  , strictNew  = require('./$.strict-new');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = require('./$.global')[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!require('./$.support-desc') || typeof C != 'function'
    || !(IS_WEAK || proto.forEach && !require('./$.fails')(function(){ new C().entries().next(); }))
  ){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    require('./$.mix')(C.prototype, methods);
  } else {
    C = wrapper(function(target, iterable){
      strictNew(target, C, NAME);
      target._c = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','),function(KEY){
      var chain = KEY == 'add' || KEY == 'set';
      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return chain ? this : result;
      });
    });
    if('size' in proto)$.setDesc(C.prototype, 'size', {
      get: function(){
        return this._c.size;
      }
    });
  }

  require('./$.tag')(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F, O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./$":70,"./$.def":49,"./$.fails":53,"./$.for-of":54,"./$.global":56,"./$.hide":58,"./$.mix":74,"./$.strict-new":81,"./$.support-desc":83,"./$.tag":84}],47:[function(require,module,exports){
var core = module.exports = {};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],48:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./$.a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.a-function":40}],49:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , PROTOTYPE = 'prototype';
var ctx = function(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
};
var $def = function(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {})[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && typeof target[key] != 'function')exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp[PROTOTYPE] = C[PROTOTYPE];
    }(out);
    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export
    exports[key] = exp;
    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
};
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
module.exports = $def;
},{"./$.core":47,"./$.global":56}],50:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],51:[function(require,module,exports){
var isObject = require('./$.is-object')
  , document = require('./$.global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$.global":56,"./$.is-object":63}],52:[function(require,module,exports){
// all enumerable object keys, includes symbols
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getSymbols = $.getSymbols;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = $.isEnum
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
  }
  return keys;
};
},{"./$":70}],53:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],54:[function(require,module,exports){
var ctx         = require('./$.ctx')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , anObject    = require('./$.an-object')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that){
  var iterFn = getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"./$.an-object":41,"./$.ctx":48,"./$.is-array-iter":62,"./$.iter-call":64,"./$.to-length":88,"./core.get-iterator-method":93}],55:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toString  = {}.toString
  , toIObject = require('./$.to-iobject')
  , getNames  = require('./$').getNames;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.get = function getOwnPropertyNames(it){
  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
  return getNames(toIObject(it));
};
},{"./$":70,"./$.to-iobject":87}],56:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var UNDEFINED = 'undefined';
var global = module.exports = typeof window != UNDEFINED && window.Math == Math
  ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],57:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],58:[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.support-desc') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":70,"./$.property-desc":75,"./$.support-desc":83}],59:[function(require,module,exports){
module.exports = require('./$.global').document && document.documentElement;
},{"./$.global":56}],60:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],61:[function(require,module,exports){
// indexed object, fallback for non-array-like ES3 strings
var cof = require('./$.cof');
module.exports = 0 in Object('z') ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":43}],62:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./$.iterators')
  , ITERATOR  = require('./$.wks')('iterator');
module.exports = function(it){
  return (Iterators.Array || Array.prototype[ITERATOR]) === it;
};
},{"./$.iterators":69,"./$.wks":92}],63:[function(require,module,exports){
// http://jsperf.com/core-js-isobject
module.exports = function(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
};
},{}],64:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./$.an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./$.an-object":41}],65:[function(require,module,exports){
'use strict';
var $ = require('./$')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./$.hide')(IteratorPrototype, require('./$.wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: require('./$.property-desc')(1,next)});
  require('./$.tag')(Constructor, NAME + ' Iterator');
};
},{"./$":70,"./$.hide":58,"./$.property-desc":75,"./$.tag":84,"./$.wks":92}],66:[function(require,module,exports){
'use strict';
var LIBRARY         = require('./$.library')
  , $def            = require('./$.def')
  , $redef          = require('./$.redef')
  , hide            = require('./$.hide')
  , has             = require('./$.has')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , Iterators       = require('./$.iterators')
  , BUGGY           = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values';
var returnThis = function(){ return this; };
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  require('./$.iter-create')(Constructor, NAME, next);
  var createMethod = function(kind){
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = require('./$').getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    require('./$.tag')(IteratorPrototype, TAG, true);
    // FF fix
    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
  }
  // Define iterator
  if(!LIBRARY || FORCE)hide(proto, SYMBOL_ITERATOR, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * BUGGY, NAME, methods);
  }
};
},{"./$":70,"./$.def":49,"./$.has":57,"./$.hide":58,"./$.iter-create":65,"./$.iterators":69,"./$.library":72,"./$.redef":76,"./$.tag":84,"./$.wks":92}],67:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":92}],68:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],69:[function(require,module,exports){
module.exports = {};
},{}],70:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],71:[function(require,module,exports){
var $         = require('./$')
  , toIObject = require('./$.to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":70,"./$.to-iobject":87}],72:[function(require,module,exports){
module.exports = true;
},{}],73:[function(require,module,exports){
var global    = require('./$.global')
  , macrotask = require('./$.task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , isNode    = require('./$.cof')(process) == 'process'
  , head, last, notify;

var flush = function(){
  var parent, domain;
  if(isNode && (parent = process.domain)){
    process.domain = null;
    parent.exit();
  }
  while(head){
    domain = head.domain;
    if(domain)domain.enter();
    head.fn.call(); // <- currently we use it only for Promise - try / catch not required
    if(domain)domain.exit();
    head = head.next;
  } last = undefined;
  if(parent)parent.enter();
}

// Node.js
if(isNode){
  notify = function(){
    process.nextTick(flush);
  };
// browsers with MutationObserver
} else if(Observer){
  var toggle = 1
    , node   = document.createTextNode('');
  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
  notify = function(){
    node.data = toggle = -toggle;
  };
// for other environments - macrotask based on:
// - setImmediate
// - MessageChannel
// - window.postMessag
// - onreadystatechange
// - setTimeout
} else {
  notify = function(){
    // strange IE + webpack dev server bug - use .call(global)
    macrotask.call(global, flush);
  };
}

module.exports = function asap(fn){
  var task = {fn: fn, next: undefined, domain: isNode && process.domain};
  if(last)last.next = task;
  if(!head){
    head = task;
    notify();
  } last = task;
};
},{"./$.cof":43,"./$.global":56,"./$.task":85}],74:[function(require,module,exports){
var $redef = require('./$.redef');
module.exports = function(target, src){
  for(var key in src)$redef(target, key, src[key]);
  return target;
};
},{"./$.redef":76}],75:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],76:[function(require,module,exports){
module.exports = require('./$.hide');
},{"./$.hide":58}],77:[function(require,module,exports){
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],78:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./$').getDesc
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":70,"./$.an-object":41,"./$.ctx":48,"./$.is-object":63}],79:[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":56}],80:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if(require('./$.support-desc') && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./$":70,"./$.support-desc":83,"./$.wks":92}],81:[function(require,module,exports){
module.exports = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
},{}],82:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var toInteger = require('./$.to-integer')
  , defined   = require('./$.defined');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$.defined":50,"./$.to-integer":86}],83:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./$.fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./$.fails":53}],84:[function(require,module,exports){
var has  = require('./$.has')
  , hide = require('./$.hide')
  , TAG  = require('./$.wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))hide(it, TAG, tag);
};
},{"./$.has":57,"./$.hide":58,"./$.wks":92}],85:[function(require,module,exports){
'use strict';
var ctx                = require('./$.ctx')
  , invoke             = require('./$.invoke')
  , html               = require('./$.html')
  , cel                = require('./$.dom-create')
  , global             = require('./$.global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listner = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./$.cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScript){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listner, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$.cof":43,"./$.ctx":48,"./$.dom-create":51,"./$.global":56,"./$.html":59,"./$.invoke":60}],86:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],87:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./$.iobject')
  , defined = require('./$.defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./$.defined":50,"./$.iobject":61}],88:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./$.to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./$.to-integer":86}],89:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./$.defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./$.defined":50}],90:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],91:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],92:[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || require('./$.uid'))('Symbol.' + name));
};
},{"./$.global":56,"./$.shared":79,"./$.uid":90}],93:[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
};
},{"./$.classof":42,"./$.core":47,"./$.iterators":69,"./$.wks":92}],94:[function(require,module,exports){
var anObject = require('./$.an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./$.core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./$.an-object":41,"./$.core":47,"./core.get-iterator-method":93}],95:[function(require,module,exports){
'use strict';
var ctx         = require('./$.ctx')
  , $def        = require('./$.def')
  , toObject    = require('./$.to-object')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, arguments[2], 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
      }
    } else {
      for(result = new C(length = toLength(O.length)); length > index; index++){
        result[index] = mapping ? mapfn(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$.ctx":48,"./$.def":49,"./$.is-array-iter":62,"./$.iter-call":64,"./$.iter-detect":67,"./$.to-length":88,"./$.to-object":89,"./core.get-iterator-method":93}],96:[function(require,module,exports){
'use strict';
var setUnscope = require('./$.unscope')
  , step       = require('./$.iter-step')
  , Iterators  = require('./$.iterators')
  , toIObject  = require('./$.to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$.iter-define":66,"./$.iter-step":68,"./$.iterators":69,"./$.to-iobject":87,"./$.unscope":91}],97:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', function(get){
  return function Map(){ return get(this, arguments[0]); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":46,"./$.collection-strong":44}],98:[function(require,module,exports){

},{}],99:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , LIBRARY    = require('./$.library')
  , global     = require('./$.global')
  , ctx        = require('./$.ctx')
  , classof    = require('./$.classof')
  , $def       = require('./$.def')
  , isObject   = require('./$.is-object')
  , anObject   = require('./$.an-object')
  , aFunction  = require('./$.a-function')
  , strictNew  = require('./$.strict-new')
  , forOf      = require('./$.for-of')
  , setProto   = require('./$.set-proto').set
  , same       = require('./$.same')
  , species    = require('./$.species')
  , SPECIES    = require('./$.wks')('species')
  , RECORD     = require('./$.uid')('record')
  , asap       = require('./$.microtask')
  , PROMISE    = 'Promise'
  , process    = global.process
  , isNode     = classof(process) == 'process'
  , P          = global[PROMISE]
  , Wrapper;

var testResolve = function(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
};

var useNative = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = P && P.resolve && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./$.support-desc')){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
var isPromise = function(it){
  return isObject(it) && (useNative ? classof(it) == 'Promise' : RECORD in it);
};
var sameConstructor = function(a, b){
  // library wrapper special case
  if(LIBRARY && a === P && b === Wrapper)return true;
  return same(a, b);
};
var getConstructor = function(C){
  var S = anObject(C)[SPECIES];
  return S != undefined ? S : C;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function(record, isReject){
  if(record.n)return;
  record.n = true;
  var chain = record.c;
  asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    var run = function(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
    record.n = false;
    if(isReject)setTimeout(function(){
      if(isUnhandled(record.p)){
        if(isNode){
          process.emit('unhandledRejection', value, record.p);
        } else if(global.console && console.error){
          console.error('Unhandled promise rejection', value);
        }
      } record.a = undefined;
    }, 1);
  });
};
var isUnhandled = function(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
};
var $reject = function(value){
  var record = this;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  notify(record, true);
};
var $resolve = function(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      asap(function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record, false);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
};

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    aFunction(executor);
    var record = {
      p: strictNew(this, P, PROMISE),         // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false,                               // <- handled rejection
      n: false                                // <- notify
    };
    this[RECORD] = record;
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.mix')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = anObject(anObject(this).constructor)[SPECIES];
      var react = {
        ok:   typeof onFulfilled == 'function' ? onFulfilled : true,
        fail: typeof onRejected == 'function'  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = aFunction(res);
        react.rej = aFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      if(record.s)notify(record, false);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
require('./$.tag')(P, PROMISE);
species(P);
species(Wrapper = require('./$.core')[PROMISE]);

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new this(function(res, rej){ rej(r); });
  }
});
$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isPromise(x) && sameConstructor(x.constructor, this)
      ? x : new this(function(res){ res(x); });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":70,"./$.a-function":40,"./$.an-object":41,"./$.classof":42,"./$.core":47,"./$.ctx":48,"./$.def":49,"./$.for-of":54,"./$.global":56,"./$.is-object":63,"./$.iter-detect":67,"./$.library":72,"./$.microtask":73,"./$.mix":74,"./$.same":77,"./$.set-proto":78,"./$.species":80,"./$.strict-new":81,"./$.support-desc":83,"./$.tag":84,"./$.uid":90,"./$.wks":92}],100:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', function(get){
  return function Set(){ return get(this, arguments[0]); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":46,"./$.collection-strong":44}],101:[function(require,module,exports){
'use strict';
var $at  = require('./$.string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./$.iter-define":66,"./$.string-at":82}],102:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $              = require('./$')
  , global         = require('./$.global')
  , has            = require('./$.has')
  , SUPPORT_DESC   = require('./$.support-desc')
  , $def           = require('./$.def')
  , $redef         = require('./$.redef')
  , shared         = require('./$.shared')
  , setTag         = require('./$.tag')
  , uid            = require('./$.uid')
  , wks            = require('./$.wks')
  , keyOf          = require('./$.keyof')
  , $names         = require('./$.get-names')
  , enumKeys       = require('./$.enum-keys')
  , isObject       = require('./$.is-object')
  , anObject       = require('./$.an-object')
  , toIObject      = require('./$.to-iobject')
  , createDesc     = require('./$.property-desc')
  , getDesc        = $.getDesc
  , setDesc        = $.setDesc
  , _create        = $.create
  , getNames       = $names.get
  , $Symbol        = global.Symbol
  , setter         = false
  , HIDDEN         = wks('_hidden')
  , isEnum         = $.isEnum
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , useNative      = typeof $Symbol == 'function'
  , ObjectProto    = Object.prototype;

var setSymbolDesc = SUPPORT_DESC ? function(){ // fallback for old Android
  try {
    return _create(setDesc({}, HIDDEN, {
      get: function(){
        return setDesc(this, HIDDEN, {value: false})[HIDDEN];
      }
    }))[HIDDEN] || setDesc;
  } catch(e){
    return function(it, key, D){
      var protoDesc = getDesc(ObjectProto, key);
      if(protoDesc)delete ObjectProto[key];
      setDesc(it, key, D);
      if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
    };
  }
}() : setDesc;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol.prototype);
  sym._k = tag;
  SUPPORT_DESC && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    }
  });
  return sym;
};

var $defineProperty = function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return setDesc(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
    ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toIObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = getNames(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var names  = getNames(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
};

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function toString(){
    return this._k;
  });

  $.create     = $create;
  $.isEnum     = $propertyIsEnumerable;
  $.getDesc    = $getOwnPropertyDescriptor;
  $.setDesc    = $defineProperty;
  $.setDescs   = $defineProperties;
  $.getNames   = $names.get = $getOwnPropertyNames;
  $.getSymbols = $getOwnPropertySymbols;

  if(SUPPORT_DESC && !require('./$.library')){
    $redef(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }
}

// MS Edge converts symbol values to JSON as {}
// WebKit converts symbol values in objects to JSON as null
if(!useNative || require('./$.fails')(function(){
  return JSON.stringify([{a: $Symbol()}, [$Symbol()]]) != '[{},[null]]';
}))$redef($Symbol.prototype, 'toJSON', function toJSON(){
  if(useNative && isObject(this))return this;
});

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = wks(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  }
);

setter = true;

$def($def.G + $def.W, {Symbol: $Symbol});

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag(global.JSON, 'JSON', true);
},{"./$":70,"./$.an-object":41,"./$.def":49,"./$.enum-keys":52,"./$.fails":53,"./$.get-names":55,"./$.global":56,"./$.has":57,"./$.is-object":63,"./$.keyof":71,"./$.library":72,"./$.property-desc":75,"./$.redef":76,"./$.shared":79,"./$.support-desc":83,"./$.tag":84,"./$.to-iobject":87,"./$.uid":90,"./$.wks":92}],103:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def');

$def($def.P, 'Map', {toJSON: require('./$.collection-to-json')('Map')});
},{"./$.collection-to-json":45,"./$.def":49}],104:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def');

$def($def.P, 'Set', {toJSON: require('./$.collection-to-json')('Set')});
},{"./$.collection-to-json":45,"./$.def":49}],105:[function(require,module,exports){
require('./es6.array.iterator');
var Iterators = require('./$.iterators');
Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
},{"./$.iterators":69,"./es6.array.iterator":96}],106:[function(require,module,exports){
(function (global){
// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g =
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this;

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  delete g.regeneratorRuntime;
}

module.exports = { "default": module.exports, __esModule: true };

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./runtime":107}],107:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

"use strict";

var _Symbol = require("babel-runtime/core-js/symbol")["default"];

var _Symbol$iterator = require("babel-runtime/core-js/symbol/iterator")["default"];

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

!(function (global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol = typeof _Symbol === "function" && _Symbol$iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = _Object$create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(innerFn, self || null, new Context(tryLocsList || []));

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  runtime.mark = function (genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = _Object$create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function (arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    // This invoke function is written in a style that assumes some
    // calling function (or Promise) will handle exceptions.
    function invoke(method, arg) {
      var result = generator[method](arg);
      var value = result.value;
      return value instanceof AwaitArgument ? _Promise.resolve(value.arg).then(invokeNext, invokeThrow) : _Promise.resolve(value).then(function (unwrapped) {
        // When a yielded Promise is resolved, its final value becomes
        // the .value of the Promise<{value,done}> result for the
        // current iteration. If the Promise is rejected, however, the
        // result for this iteration will be rejected with the same
        // reason. Note that rejections of yielded Promises are not
        // thrown back into the generator function, as is the case
        // when an awaited Promise is rejected. This difference in
        // behavior between yield and await is important, because it
        // allows the consumer to decide what to do with the yielded
        // rejection (swallow it and continue, manually .throw it back
        // into the generator, abandon iteration, whatever). With
        // await, by contrast, there is no opportunity to examine the
        // rejection reason outside the generator function, so the
        // only option is to throw it from the await expression, and
        // let the generator function handle the exception.
        result.value = unwrapped;
        return result;
      });
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var invokeNext = invoke.bind(generator, "next");
    var invokeThrow = invoke.bind(generator, "throw");
    var invokeReturn = invoke.bind(generator, "return");
    var previousPromise;

    function enqueue(method, arg) {
      var enqueueResult =
      // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(function () {
        return invoke(method, arg);
      }) : new _Promise(function (resolve) {
        resolve(invoke(method, arg));
      });

      // Avoid propagating enqueueResult failures to Promises returned by
      // later invocations of the iterator.
      previousPromise = enqueueResult["catch"](function (ignored) {});

      return enqueueResult;
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

    return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }
        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function (object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function reset(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function stop() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
// Among the various tricks for obtaining a reference to the global
// object, this seems to be the most reliable technique that does not
// use indirect eval (which violates Content Security Policy).
typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : undefined);
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":109,"babel-runtime/core-js/object/create":22,"babel-runtime/core-js/promise":24,"babel-runtime/core-js/symbol":26,"babel-runtime/core-js/symbol/iterator":27}],108:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],109:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],110:[function(require,module,exports){
/*! Hammer.JS - v2.0.4 - 2014-09-28
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2014 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge]
 * @returns {Object} dest
 */
function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
function merge(dest, src) {
    return extend(dest, src, true);
}

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        extend(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument;
    return (doc.defaultView || doc.parentWindow);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = last.deltaX - input.deltaX;
        var deltaY = last.deltaY - input.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) - getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.allow = true; // used by Input.TouchMouse to disable mouse events
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down, and mouse events are allowed (see the TouchMouse input)
        if (!this.pressed || !this.allow) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */
function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        // when we're in a touch event, so  block all upcoming mouse events
        // most mobile browser also emit mouseevents, right after touchstart
        if (isTouch) {
            this.mouse.allow = false;
        } else if (isMouse && !this.mouse.allow) {
            return;
        }

        // reset the allowMouse when we're done
        if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
            this.mouse.allow = true;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        // not needed with native support for the touchAction property
        if (NATIVE_TOUCH_ACTION) {
            return;
        }

        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // pan-x and pan-y can be combined
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_PAN_X + ' ' + TOUCH_ACTION_PAN_Y;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.id = uniqueId();

    this.manager = null;
    this.options = merge(options || {}, this.defaults);

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        extend(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(withState) {
            self.manager.emit(self.options.event + (withState ? stateStr(state) : ''), input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(true);
        }

        emit(); // simple 'eventName' events

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(true);
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = extend({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {
        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        this._super.emit.call(this, input);
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            this.manager.emit(this.options.event + inOut, input);
        }
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 500, // minimal time of the pointer to be pressed
        threshold: 5 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.65,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.velocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.velocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.velocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.direction &&
            input.distance > this.options.threshold &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.direction);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 2, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED ) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create an manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.4';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, { enable: false }],
        [PinchRecognizer, { enable: false }, ['rotate']],
        [SwipeRecognizer,{ direction: DIRECTION_HORIZONTAL }],
        [PanRecognizer, { direction: DIRECTION_HORIZONTAL }, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, { event: 'doubletap', taps: 2 }, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    options = options || {};

    this.options = merge(options, Hammer.defaults);
    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        extend(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        var recognizers = this.recognizers;
        recognizer = this.get(recognizer);
        recognizers.splice(inArray(recognizers, recognizer), 1);

        this.touchAction.update();
        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    each(manager.options.cssProps, function(value, name) {
        element.style[prefixed(element.style, name)] = add ? value : '';
    });
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

extend(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

if (typeof define == TYPE_FUNCTION && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

},{}],111:[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],112:[function(require,module,exports){
module.exports.RTCSessionDescription = window.RTCSessionDescription ||
	window.mozRTCSessionDescription;
module.exports.RTCPeerConnection = window.RTCPeerConnection ||
	window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
module.exports.RTCIceCandidate = window.RTCIceCandidate ||
	window.mozRTCIceCandidate;

},{}],113:[function(require,module,exports){
var util = require('./util');
var EventEmitter = require('eventemitter3');
var Negotiator = require('./negotiator');
var Reliable = require('reliable');

/**
 * Wraps a DataChannel between two Peers.
 */
function DataConnection(peer, provider, options) {
  if (!(this instanceof DataConnection)) return new DataConnection(peer, provider, options);
  EventEmitter.call(this);

  this.options = util.extend({
    serialization: 'binary',
    reliable: false
  }, options);

  // Connection is not open yet.
  this.open = false;
  this.type = 'data';
  this.peer = peer;
  this.provider = provider;

  this.id = this.options.connectionId || DataConnection._idPrefix + util.randomToken();

  this.label = this.options.label || this.id;
  this.metadata = this.options.metadata;
  this.serialization = this.options.serialization;
  this.reliable = this.options.reliable;

  // Data channel buffering.
  this._buffer = [];
  this._buffering = false;
  this.bufferSize = 0;

  // For storing large data.
  this._chunkedData = {};

  if (this.options._payload) {
    this._peerBrowser = this.options._payload.browser;
  }

  Negotiator.startConnection(
    this,
    this.options._payload || {
      originator: true
    }
  );
}

util.inherits(DataConnection, EventEmitter);

DataConnection._idPrefix = 'dc_';

/** Called by the Negotiator when the DataChannel is ready. */
DataConnection.prototype.initialize = function(dc) {
  this._dc = this.dataChannel = dc;
  this._configureDataChannel();
}

DataConnection.prototype._configureDataChannel = function() {
  var self = this;
  if (util.supports.sctp) {
    this._dc.binaryType = 'arraybuffer';
  }
  this._dc.onopen = function() {
    util.log('Data channel connection success');
    self.open = true;
    self.emit('open');
  }

  // Use the Reliable shim for non Firefox browsers
  if (!util.supports.sctp && this.reliable) {
    this._reliable = new Reliable(this._dc, util.debug);
  }

  if (this._reliable) {
    this._reliable.onmessage = function(msg) {
      self.emit('data', msg);
    };
  } else {
    this._dc.onmessage = function(e) {
      self._handleDataMessage(e);
    };
  }
  this._dc.onclose = function(e) {
    util.log('DataChannel closed for:', self.peer);
    self.close();
  };
}

// Handles a DataChannel message.
DataConnection.prototype._handleDataMessage = function(e) {
  var self = this;
  var data = e.data;
  var datatype = data.constructor;
  if (this.serialization === 'binary' || this.serialization === 'binary-utf8') {
    if (datatype === Blob) {
      // Datatype should never be blob
      util.blobToArrayBuffer(data, function(ab) {
        data = util.unpack(ab);
        self.emit('data', data);
      });
      return;
    } else if (datatype === ArrayBuffer) {
      data = util.unpack(data);
    } else if (datatype === String) {
      // String fallback for binary data for browsers that don't support binary yet
      var ab = util.binaryStringToArrayBuffer(data);
      data = util.unpack(ab);
    }
  } else if (this.serialization === 'json') {
    data = JSON.parse(data);
  }

  // Check if we've chunked--if so, piece things back together.
  // We're guaranteed that this isn't 0.
  if (data.__peerData) {
    var id = data.__peerData;
    var chunkInfo = this._chunkedData[id] || {data: [], count: 0, total: data.total};

    chunkInfo.data[data.n] = data.data;
    chunkInfo.count += 1;

    if (chunkInfo.total === chunkInfo.count) {
      // Clean up before making the recursive call to `_handleDataMessage`.
      delete this._chunkedData[id];

      // We've received all the chunks--time to construct the complete data.
      data = new Blob(chunkInfo.data);
      this._handleDataMessage({data: data});
    }

    this._chunkedData[id] = chunkInfo;
    return;
  }

  this.emit('data', data);
}

/**
 * Exposed functionality for users.
 */

/** Allows user to close connection. */
DataConnection.prototype.close = function() {
  if (!this.open) {
    return;
  }
  this.open = false;
  Negotiator.cleanup(this);
  this.emit('close');
}

/** Allows user to send data. */
DataConnection.prototype.send = function(data, chunked) {
  if (!this.open) {
    this.emit('error', new Error('Connection is not open. You should listen for the `open` event before sending messages.'));
    return;
  }
  if (this._reliable) {
    // Note: reliable shim sending will make it so that you cannot customize
    // serialization.
    this._reliable.send(data);
    return;
  }
  var self = this;
  if (this.serialization === 'json') {
    this._bufferedSend(JSON.stringify(data));
  } else if (this.serialization === 'binary' || this.serialization === 'binary-utf8') {
    var blob = util.pack(data);

    // For Chrome-Firefox interoperability, we need to make Firefox "chunk"
    // the data it sends out.
    var needsChunking = util.chunkedBrowsers[this._peerBrowser] || util.chunkedBrowsers[util.browser];
    if (needsChunking && !chunked && blob.size > util.chunkedMTU) {
      this._sendChunks(blob);
      return;
    }

    // DataChannel currently only supports strings.
    if (!util.supports.sctp) {
      util.blobToBinaryString(blob, function(str) {
        self._bufferedSend(str);
      });
    } else if (!util.supports.binaryBlob) {
      // We only do this if we really need to (e.g. blobs are not supported),
      // because this conversion is costly.
      util.blobToArrayBuffer(blob, function(ab) {
        self._bufferedSend(ab);
      });
    } else {
      this._bufferedSend(blob);
    }
  } else {
    this._bufferedSend(data);
  }
}

DataConnection.prototype._bufferedSend = function(msg) {
  if (this._buffering || !this._trySend(msg)) {
    this._buffer.push(msg);
    this.bufferSize = this._buffer.length;
  }
}

// Returns true if the send succeeds.
DataConnection.prototype._trySend = function(msg) {
  try {
    this._dc.send(msg);
  } catch (e) {
    this._buffering = true;

    var self = this;
    setTimeout(function() {
      // Try again.
      self._buffering = false;
      self._tryBuffer();
    }, 100);
    return false;
  }
  return true;
}

// Try to send the first message in the buffer.
DataConnection.prototype._tryBuffer = function() {
  if (this._buffer.length === 0) {
    return;
  }

  var msg = this._buffer[0];

  if (this._trySend(msg)) {
    this._buffer.shift();
    this.bufferSize = this._buffer.length;
    this._tryBuffer();
  }
}

DataConnection.prototype._sendChunks = function(blob) {
  var blobs = util.chunk(blob);
  for (var i = 0, ii = blobs.length; i < ii; i += 1) {
    var blob = blobs[i];
    this.send(blob, true);
  }
}

DataConnection.prototype.handleMessage = function(message) {
  var payload = message.payload;

  switch (message.type) {
    case 'ANSWER':
      this._peerBrowser = payload.browser;

      // Forward to negotiator
      Negotiator.handleSDP(message.type, this, payload.sdp);
      break;
    case 'CANDIDATE':
      Negotiator.handleCandidate(this, payload.candidate);
      break;
    default:
      util.warn('Unrecognized message type:', message.type, 'from peer:', this.peer);
      break;
  }
}

module.exports = DataConnection;

},{"./negotiator":115,"./util":118,"eventemitter3":119,"reliable":122}],114:[function(require,module,exports){
var util = require('./util');
var EventEmitter = require('eventemitter3');
var Negotiator = require('./negotiator');

/**
 * Wraps the streaming interface between two Peers.
 */
function MediaConnection(peer, provider, options) {
  if (!(this instanceof MediaConnection)) return new MediaConnection(peer, provider, options);
  EventEmitter.call(this);

  this.options = util.extend({}, options);

  this.open = false;
  this.type = 'media';
  this.peer = peer;
  this.provider = provider;
  this.metadata = this.options.metadata;
  this.localStream = this.options._stream;

  this.id = this.options.connectionId || MediaConnection._idPrefix + util.randomToken();
  if (this.localStream) {
    Negotiator.startConnection(
      this,
      {_stream: this.localStream, originator: true}
    );
  }
};

util.inherits(MediaConnection, EventEmitter);

MediaConnection._idPrefix = 'mc_';

MediaConnection.prototype.addStream = function(remoteStream) {
  util.log('Receiving stream', remoteStream);

  this.remoteStream = remoteStream;
  this.emit('stream', remoteStream); // Should we call this `open`?

};

MediaConnection.prototype.handleMessage = function(message) {
  var payload = message.payload;

  switch (message.type) {
    case 'ANSWER':
      // Forward to negotiator
      Negotiator.handleSDP(message.type, this, payload.sdp);
      this.open = true;
      break;
    case 'CANDIDATE':
      Negotiator.handleCandidate(this, payload.candidate);
      break;
    default:
      util.warn('Unrecognized message type:', message.type, 'from peer:', this.peer);
      break;
  }
}

MediaConnection.prototype.answer = function(stream) {
  if (this.localStream) {
    util.warn('Local stream already exists on this MediaConnection. Are you answering a call twice?');
    return;
  }

  this.options._payload._stream = stream;

  this.localStream = stream;
  Negotiator.startConnection(
    this,
    this.options._payload
  )
  // Retrieve lost messages stored because PeerConnection not set up.
  var messages = this.provider._getMessages(this.id);
  for (var i = 0, ii = messages.length; i < ii; i += 1) {
    this.handleMessage(messages[i]);
  }
  this.open = true;
};

/**
 * Exposed functionality for users.
 */

/** Allows user to close connection. */
MediaConnection.prototype.close = function() {
  if (!this.open) {
    return;
  }
  this.open = false;
  Negotiator.cleanup(this);
  this.emit('close')
};

module.exports = MediaConnection;

},{"./negotiator":115,"./util":118,"eventemitter3":119}],115:[function(require,module,exports){
var util = require('./util');
var RTCPeerConnection = require('./adapter').RTCPeerConnection;
var RTCSessionDescription = require('./adapter').RTCSessionDescription;
var RTCIceCandidate = require('./adapter').RTCIceCandidate;

/**
 * Manages all negotiations between Peers.
 */
var Negotiator = {
  pcs: {
    data: {},
    media: {}
  }, // type => {peerId: {pc_id: pc}}.
  //providers: {}, // provider's id => providers (there may be multiple providers/client.
  queue: [] // connections that are delayed due to a PC being in use.
}

Negotiator._idPrefix = 'pc_';

/** Returns a PeerConnection object set up correctly (for data, media). */
Negotiator.startConnection = function(connection, options) {
  var pc = Negotiator._getPeerConnection(connection, options);

  if (connection.type === 'media' && options._stream) {
    // Add the stream.
    pc.addStream(options._stream);
  }

  // Set the connection's PC.
  connection.pc = connection.peerConnection = pc;
  // What do we need to do now?
  if (options.originator) {
    if (connection.type === 'data') {
      // Create the datachannel.
      var config = {};
      // Dropping reliable:false support, since it seems to be crashing
      // Chrome.
      /*if (util.supports.sctp && !options.reliable) {
        // If we have canonical reliable support...
        config = {maxRetransmits: 0};
      }*/
      // Fallback to ensure older browsers don't crash.
      if (!util.supports.sctp) {
        config = {reliable: options.reliable};
      }
      var dc = pc.createDataChannel(connection.label, config);
      connection.initialize(dc);
    }

    if (!util.supports.onnegotiationneeded) {
      Negotiator._makeOffer(connection);
    }
  } else {
    Negotiator.handleSDP('OFFER', connection, options.sdp);
  }
}

Negotiator._getPeerConnection = function(connection, options) {
  if (!Negotiator.pcs[connection.type]) {
    util.error(connection.type + ' is not a valid connection type. Maybe you overrode the `type` property somewhere.');
  }

  if (!Negotiator.pcs[connection.type][connection.peer]) {
    Negotiator.pcs[connection.type][connection.peer] = {};
  }
  var peerConnections = Negotiator.pcs[connection.type][connection.peer];

  var pc;
  // Not multiplexing while FF and Chrome have not-great support for it.
  /*if (options.multiplex) {
    ids = Object.keys(peerConnections);
    for (var i = 0, ii = ids.length; i < ii; i += 1) {
      pc = peerConnections[ids[i]];
      if (pc.signalingState === 'stable') {
        break; // We can go ahead and use this PC.
      }
    }
  } else */
  if (options.pc) { // Simplest case: PC id already provided for us.
    pc = Negotiator.pcs[connection.type][connection.peer][options.pc];
  }

  if (!pc || pc.signalingState !== 'stable') {
    pc = Negotiator._startPeerConnection(connection);
  }
  return pc;
}

/*
Negotiator._addProvider = function(provider) {
  if ((!provider.id && !provider.disconnected) || !provider.socket.open) {
    // Wait for provider to obtain an ID.
    provider.on('open', function(id) {
      Negotiator._addProvider(provider);
    });
  } else {
    Negotiator.providers[provider.id] = provider;
  }
}*/


/** Start a PC. */
Negotiator._startPeerConnection = function(connection) {
  util.log('Creating RTCPeerConnection.');

  var id = Negotiator._idPrefix + util.randomToken();
  var optional = {};

  if (connection.type === 'data' && !util.supports.sctp) {
    optional = {optional: [{RtpDataChannels: true}]};
  } else if (connection.type === 'media') {
    // Interop req for chrome.
    optional = {optional: [{DtlsSrtpKeyAgreement: true}]};
  }

  var pc = new RTCPeerConnection(connection.provider.options.config, optional);
  Negotiator.pcs[connection.type][connection.peer][id] = pc;

  Negotiator._setupListeners(connection, pc, id);

  return pc;
}

/** Set up various WebRTC listeners. */
Negotiator._setupListeners = function(connection, pc, pc_id) {
  var peerId = connection.peer;
  var connectionId = connection.id;
  var provider = connection.provider;

  // ICE CANDIDATES.
  util.log('Listening for ICE candidates.');
  pc.onicecandidate = function(evt) {
    if (evt.candidate) {
      util.log('Received ICE candidates for:', connection.peer);
      provider.socket.send({
        type: 'CANDIDATE',
        payload: {
          candidate: evt.candidate,
          type: connection.type,
          connectionId: connection.id
        },
        dst: peerId
      });
    }
  };

  pc.oniceconnectionstatechange = function() {
    switch (pc.iceConnectionState) {
      case 'disconnected':
      case 'failed':
        util.log('iceConnectionState is disconnected, closing connections to ' + peerId);
        connection.close();
        break;
      case 'completed':
        pc.onicecandidate = util.noop;
        break;
    }
  };

  // Fallback for older Chrome impls.
  pc.onicechange = pc.oniceconnectionstatechange;

  // ONNEGOTIATIONNEEDED (Chrome)
  util.log('Listening for `negotiationneeded`');
  pc.onnegotiationneeded = function() {
    util.log('`negotiationneeded` triggered');
    if (pc.signalingState == 'stable') {
      Negotiator._makeOffer(connection);
    } else {
      util.log('onnegotiationneeded triggered when not stable. Is another connection being established?');
    }
  };

  // DATACONNECTION.
  util.log('Listening for data channel');
  // Fired between offer and answer, so options should already be saved
  // in the options hash.
  pc.ondatachannel = function(evt) {
    util.log('Received data channel');
    var dc = evt.channel;
    var connection = provider.getConnection(peerId, connectionId);
    connection.initialize(dc);
  };

  // MEDIACONNECTION.
  util.log('Listening for remote stream');
  pc.onaddstream = function(evt) {
    util.log('Received remote stream');
    var stream = evt.stream;
    var connection = provider.getConnection(peerId, connectionId);
    // 10/10/2014: looks like in Chrome 38, onaddstream is triggered after
    // setting the remote description. Our connection object in these cases
    // is actually a DATA connection, so addStream fails.
    // TODO: This is hopefully just a temporary fix. We should try to
    // understand why this is happening.
    if (connection.type === 'media') {
      connection.addStream(stream);
    }
  };
}

Negotiator.cleanup = function(connection) {
  util.log('Cleaning up PeerConnection to ' + connection.peer);

  var pc = connection.pc;

  if (!!pc && (pc.readyState !== 'closed' || pc.signalingState !== 'closed')) {
    pc.close();
    connection.pc = null;
  }
}

Negotiator._makeOffer = function(connection) {
  var pc = connection.pc;
  pc.createOffer(function(offer) {
    util.log('Created offer.');

    if (!util.supports.sctp && connection.type === 'data' && connection.reliable) {
      offer.sdp = Reliable.higherBandwidthSDP(offer.sdp);
    }

    pc.setLocalDescription(offer, function() {
      util.log('Set localDescription: offer', 'for:', connection.peer);
      connection.provider.socket.send({
        type: 'OFFER',
        payload: {
          sdp: offer,
          type: connection.type,
          label: connection.label,
          connectionId: connection.id,
          reliable: connection.reliable,
          serialization: connection.serialization,
          metadata: connection.metadata,
          browser: util.browser
        },
        dst: connection.peer
      });
    }, function(err) {
      connection.provider.emitError('webrtc', err);
      util.log('Failed to setLocalDescription, ', err);
    });
  }, function(err) {
    connection.provider.emitError('webrtc', err);
    util.log('Failed to createOffer, ', err);
  }, connection.options.constraints);
}

Negotiator._makeAnswer = function(connection) {
  var pc = connection.pc;

  pc.createAnswer(function(answer) {
    util.log('Created answer.');

    if (!util.supports.sctp && connection.type === 'data' && connection.reliable) {
      answer.sdp = Reliable.higherBandwidthSDP(answer.sdp);
    }

    pc.setLocalDescription(answer, function() {
      util.log('Set localDescription: answer', 'for:', connection.peer);
      connection.provider.socket.send({
        type: 'ANSWER',
        payload: {
          sdp: answer,
          type: connection.type,
          connectionId: connection.id,
          browser: util.browser
        },
        dst: connection.peer
      });
    }, function(err) {
      connection.provider.emitError('webrtc', err);
      util.log('Failed to setLocalDescription, ', err);
    });
  }, function(err) {
    connection.provider.emitError('webrtc', err);
    util.log('Failed to create answer, ', err);
  });
}

/** Handle an SDP. */
Negotiator.handleSDP = function(type, connection, sdp) {
  sdp = new RTCSessionDescription(sdp);
  var pc = connection.pc;

  util.log('Setting remote description', sdp);
  pc.setRemoteDescription(sdp, function() {
    util.log('Set remoteDescription:', type, 'for:', connection.peer);

    if (type === 'OFFER') {
      Negotiator._makeAnswer(connection);
    }
  }, function(err) {
    connection.provider.emitError('webrtc', err);
    util.log('Failed to setRemoteDescription, ', err);
  });
}

/** Handle a candidate. */
Negotiator.handleCandidate = function(connection, ice) {
  var candidate = ice.candidate;
  var sdpMLineIndex = ice.sdpMLineIndex;
  connection.pc.addIceCandidate(new RTCIceCandidate({
    sdpMLineIndex: sdpMLineIndex,
    candidate: candidate
  }));
  util.log('Added ICE candidate for:', connection.peer);
}

module.exports = Negotiator;

},{"./adapter":112,"./util":118}],116:[function(require,module,exports){
var util = require('./util');
var EventEmitter = require('eventemitter3');
var Socket = require('./socket');
var MediaConnection = require('./mediaconnection');
var DataConnection = require('./dataconnection');

/**
 * A peer who can initiate connections with other peers.
 */
function Peer(id, options) {
  if (!(this instanceof Peer)) return new Peer(id, options);
  EventEmitter.call(this);

  // Deal with overloading
  if (id && id.constructor == Object) {
    options = id;
    id = undefined;
  } else if (id) {
    // Ensure id is a string
    id = id.toString();
  }
  //

  // Configurize options
  options = util.extend({
    debug: 0, // 1: Errors, 2: Warnings, 3: All logs
    host: util.CLOUD_HOST,
    port: util.CLOUD_PORT,
    key: 'peerjs',
    path: '/',
    token: util.randomToken(),
    config: util.defaultConfig
  }, options);
  this.options = options;
  // Detect relative URL host.
  if (options.host === '/') {
    options.host = window.location.hostname;
  }
  // Set path correctly.
  if (options.path[0] !== '/') {
    options.path = '/' + options.path;
  }
  if (options.path[options.path.length - 1] !== '/') {
    options.path += '/';
  }

  // Set whether we use SSL to same as current host
  if (options.secure === undefined && options.host !== util.CLOUD_HOST) {
    options.secure = util.isSecure();
  }
  // Set a custom log function if present
  if (options.logFunction) {
    util.setLogFunction(options.logFunction);
  }
  util.setLogLevel(options.debug);
  //

  // Sanity checks
  // Ensure WebRTC supported
  if (!util.supports.audioVideo && !util.supports.data ) {
    this._delayedAbort('browser-incompatible', 'The current browser does not support WebRTC');
    return;
  }
  // Ensure alphanumeric id
  if (!util.validateId(id)) {
    this._delayedAbort('invalid-id', 'ID "' + id + '" is invalid');
    return;
  }
  // Ensure valid key
  if (!util.validateKey(options.key)) {
    this._delayedAbort('invalid-key', 'API KEY "' + options.key + '" is invalid');
    return;
  }
  // Ensure not using unsecure cloud server on SSL page
  if (options.secure && options.host === '0.peerjs.com') {
    this._delayedAbort('ssl-unavailable',
      'The cloud server currently does not support HTTPS. Please run your own PeerServer to use HTTPS.');
    return;
  }
  //

  // States.
  this.destroyed = false; // Connections have been killed
  this.disconnected = false; // Connection to PeerServer killed but P2P connections still active
  this.open = false; // Sockets and such are not yet open.
  //

  // References
  this.connections = {}; // DataConnections for this peer.
  this._lostMessages = {}; // src => [list of messages]
  //

  // Start the server connection
  this._initializeServerConnection();
  if (id) {
    this._initialize(id);
  } else {
    this._retrieveId();
  }
  //
}

util.inherits(Peer, EventEmitter);

// Initialize the 'socket' (which is actually a mix of XHR streaming and
// websockets.)
Peer.prototype._initializeServerConnection = function() {
  var self = this;
  this.socket = new Socket(this.options.secure, this.options.host, this.options.port, this.options.path, this.options.key);
  this.socket.on('message', function(data) {
    self._handleMessage(data);
  });
  this.socket.on('error', function(error) {
    self._abort('socket-error', error);
  });
  this.socket.on('disconnected', function() {
    // If we haven't explicitly disconnected, emit error and disconnect.
    if (!self.disconnected) {
      self.emitError('network', 'Lost connection to server.');
      self.disconnect();
    }
  });
  this.socket.on('close', function() {
    // If we haven't explicitly disconnected, emit error.
    if (!self.disconnected) {
      self._abort('socket-closed', 'Underlying socket is already closed.');
    }
  });
};

/** Get a unique ID from the server via XHR. */
Peer.prototype._retrieveId = function(cb) {
  var self = this;
  var http = new XMLHttpRequest();
  var protocol = this.options.secure ? 'https://' : 'http://';
  var url = protocol + this.options.host + ':' + this.options.port +
    this.options.path + this.options.key + '/id';
  var queryString = '?ts=' + new Date().getTime() + '' + Math.random();
  url += queryString;

  // If there's no ID we need to wait for one before trying to init socket.
  http.open('get', url, true);
  http.onerror = function(e) {
    util.error('Error retrieving ID', e);
    var pathError = '';
    if (self.options.path === '/' && self.options.host !== util.CLOUD_HOST) {
      pathError = ' If you passed in a `path` to your self-hosted PeerServer, ' +
        'you\'ll also need to pass in that same path when creating a new ' +
        'Peer.';
    }
    self._abort('server-error', 'Could not get an ID from the server.' + pathError);
  };
  http.onreadystatechange = function() {
    if (http.readyState !== 4) {
      return;
    }
    if (http.status !== 200) {
      http.onerror();
      return;
    }
    self._initialize(http.responseText);
  };
  http.send(null);
};

/** Initialize a connection with the server. */
Peer.prototype._initialize = function(id) {
  this.id = id;
  this.socket.start(this.id, this.options.token);
};

/** Handles messages from the server. */
Peer.prototype._handleMessage = function(message) {
  var type = message.type;
  var payload = message.payload;
  var peer = message.src;
  var connection;

  switch (type) {
    case 'OPEN': // The connection to the server is open.
      this.emit('open', this.id);
      this.open = true;
      break;
    case 'ERROR': // Server error.
      this._abort('server-error', payload.msg);
      break;
    case 'ID-TAKEN': // The selected ID is taken.
      this._abort('unavailable-id', 'ID `' + this.id + '` is taken');
      break;
    case 'INVALID-KEY': // The given API key cannot be found.
      this._abort('invalid-key', 'API KEY "' + this.options.key + '" is invalid');
      break;

    //
    case 'LEAVE': // Another peer has closed its connection to this peer.
      util.log('Received leave message from', peer);
      this._cleanupPeer(peer);
      break;

    case 'EXPIRE': // The offer sent to a peer has expired without response.
      this.emitError('peer-unavailable', 'Could not connect to peer ' + peer);
      break;
    case 'OFFER': // we should consider switching this to CALL/CONNECT, but this is the least breaking option.
      var connectionId = payload.connectionId;
      connection = this.getConnection(peer, connectionId);

      if (connection) {
        util.warn('Offer received for existing Connection ID:', connectionId);
        //connection.handleMessage(message);
      } else {
        // Create a new connection.
        if (payload.type === 'media') {
          connection = new MediaConnection(peer, this, {
            connectionId: connectionId,
            _payload: payload,
            metadata: payload.metadata
          });
          this._addConnection(peer, connection);
          this.emit('call', connection);
        } else if (payload.type === 'data') {
          connection = new DataConnection(peer, this, {
            connectionId: connectionId,
            _payload: payload,
            metadata: payload.metadata,
            label: payload.label,
            serialization: payload.serialization,
            reliable: payload.reliable
          });
          this._addConnection(peer, connection);
          this.emit('connection', connection);
        } else {
          util.warn('Received malformed connection type:', payload.type);
          return;
        }
        // Find messages.
        var messages = this._getMessages(connectionId);
        for (var i = 0, ii = messages.length; i < ii; i += 1) {
          connection.handleMessage(messages[i]);
        }
      }
      break;
    default:
      if (!payload) {
        util.warn('You received a malformed message from ' + peer + ' of type ' + type);
        return;
      }

      var id = payload.connectionId;
      connection = this.getConnection(peer, id);

      if (connection && connection.pc) {
        // Pass it on.
        connection.handleMessage(message);
      } else if (id) {
        // Store for possible later use
        this._storeMessage(id, message);
      } else {
        util.warn('You received an unrecognized message:', message);
      }
      break;
  }
};

/** Stores messages without a set up connection, to be claimed later. */
Peer.prototype._storeMessage = function(connectionId, message) {
  if (!this._lostMessages[connectionId]) {
    this._lostMessages[connectionId] = [];
  }
  this._lostMessages[connectionId].push(message);
};

/** Retrieve messages from lost message store */
Peer.prototype._getMessages = function(connectionId) {
  var messages = this._lostMessages[connectionId];
  if (messages) {
    delete this._lostMessages[connectionId];
    return messages;
  } else {
    return [];
  }
};

/**
 * Returns a DataConnection to the specified peer. See documentation for a
 * complete list of options.
 */
Peer.prototype.connect = function(peer, options) {
  if (this.disconnected) {
    util.warn('You cannot connect to a new Peer because you called ' +
      '.disconnect() on this Peer and ended your connection with the ' +
      'server. You can create a new Peer to reconnect, or call reconnect ' +
      'on this peer if you believe its ID to still be available.');
    this.emitError('disconnected', 'Cannot connect to new Peer after disconnecting from server.');
    return;
  }
  var connection = new DataConnection(peer, this, options);
  this._addConnection(peer, connection);
  return connection;
};

/**
 * Returns a MediaConnection to the specified peer. See documentation for a
 * complete list of options.
 */
Peer.prototype.call = function(peer, stream, options) {
  if (this.disconnected) {
    util.warn('You cannot connect to a new Peer because you called ' +
      '.disconnect() on this Peer and ended your connection with the ' +
      'server. You can create a new Peer to reconnect.');
    this.emitError('disconnected', 'Cannot connect to new Peer after disconnecting from server.');
    return;
  }
  if (!stream) {
    util.error('To call a peer, you must provide a stream from your browser\'s `getUserMedia`.');
    return;
  }
  options = options || {};
  options._stream = stream;
  var call = new MediaConnection(peer, this, options);
  this._addConnection(peer, call);
  return call;
};

/** Add a data/media connection to this peer. */
Peer.prototype._addConnection = function(peer, connection) {
  if (!this.connections[peer]) {
    this.connections[peer] = [];
  }
  this.connections[peer].push(connection);
};

/** Retrieve a data/media connection for this peer. */
Peer.prototype.getConnection = function(peer, id) {
  var connections = this.connections[peer];
  if (!connections) {
    return null;
  }
  for (var i = 0, ii = connections.length; i < ii; i++) {
    if (connections[i].id === id) {
      return connections[i];
    }
  }
  return null;
};

Peer.prototype._delayedAbort = function(type, message) {
  var self = this;
  util.setZeroTimeout(function(){
    self._abort(type, message);
  });
};

/**
 * Destroys the Peer and emits an error message.
 * The Peer is not destroyed if it's in a disconnected state, in which case
 * it retains its disconnected state and its existing connections.
 */
Peer.prototype._abort = function(type, message) {
  util.error('Aborting!');
  if (!this._lastServerId) {
    this.destroy();
  } else {
    this.disconnect();
  }
  this.emitError(type, message);
};

/** Emits a typed error message. */
Peer.prototype.emitError = function(type, err) {
  util.error('Error:', err);
  if (typeof err === 'string') {
    err = new Error(err);
  }
  err.type = type;
  this.emit('error', err);
};

/**
 * Destroys the Peer: closes all active connections as well as the connection
 *  to the server.
 * Warning: The peer can no longer create or accept connections after being
 *  destroyed.
 */
Peer.prototype.destroy = function() {
  if (!this.destroyed) {
    this._cleanup();
    this.disconnect();
    this.destroyed = true;
  }
};


/** Disconnects every connection on this peer. */
Peer.prototype._cleanup = function() {
  if (this.connections) {
    var peers = Object.keys(this.connections);
    for (var i = 0, ii = peers.length; i < ii; i++) {
      this._cleanupPeer(peers[i]);
    }
  }
  this.emit('close');
};

/** Closes all connections to this peer. */
Peer.prototype._cleanupPeer = function(peer) {
  var connections = this.connections[peer];
  for (var j = 0, jj = connections.length; j < jj; j += 1) {
    connections[j].close();
  }
};

/**
 * Disconnects the Peer's connection to the PeerServer. Does not close any
 *  active connections.
 * Warning: The peer can no longer create or accept connections after being
 *  disconnected. It also cannot reconnect to the server.
 */
Peer.prototype.disconnect = function() {
  var self = this;
  util.setZeroTimeout(function(){
    if (!self.disconnected) {
      self.disconnected = true;
      self.open = false;
      if (self.socket) {
        self.socket.close();
      }
      self.emit('disconnected', self.id);
      self._lastServerId = self.id;
      self.id = null;
    }
  });
};

/** Attempts to reconnect with the same ID. */
Peer.prototype.reconnect = function() {
  if (this.disconnected && !this.destroyed) {
    util.log('Attempting reconnection to server with ID ' + this._lastServerId);
    this.disconnected = false;
    this._initializeServerConnection();
    this._initialize(this._lastServerId);
  } else if (this.destroyed) {
    throw new Error('This peer cannot reconnect to the server. It has already been destroyed.');
  } else if (!this.disconnected && !this.open) {
    // Do nothing. We're still connecting the first time.
    util.error('In a hurry? We\'re still trying to make the initial connection!');
  } else {
    throw new Error('Peer ' + this.id + ' cannot reconnect because it is not disconnected from the server!');
  }
};

/**
 * Get a list of available peer IDs. If you're running your own server, you'll
 * want to set allow_discovery: true in the PeerServer options. If you're using
 * the cloud server, email team@peerjs.com to get the functionality enabled for
 * your key.
 */
Peer.prototype.listAllPeers = function(cb) {
  cb = cb || function() {};
  var self = this;
  var http = new XMLHttpRequest();
  var protocol = this.options.secure ? 'https://' : 'http://';
  var url = protocol + this.options.host + ':' + this.options.port +
    this.options.path + this.options.key + '/peers';
  var queryString = '?ts=' + new Date().getTime() + '' + Math.random();
  url += queryString;

  // If there's no ID we need to wait for one before trying to init socket.
  http.open('get', url, true);
  http.onerror = function(e) {
    self._abort('server-error', 'Could not get peers from the server.');
    cb([]);
  };
  http.onreadystatechange = function() {
    if (http.readyState !== 4) {
      return;
    }
    if (http.status === 401) {
      var helpfulError = '';
      if (self.options.host !== util.CLOUD_HOST) {
        helpfulError = 'It looks like you\'re using the cloud server. You can email ' +
          'team@peerjs.com to enable peer listing for your API key.';
      } else {
        helpfulError = 'You need to enable `allow_discovery` on your self-hosted ' +
          'PeerServer to use this feature.';
      }
      cb([]);
      throw new Error('It doesn\'t look like you have permission to list peers IDs. ' + helpfulError);
    } else if (http.status !== 200) {
      cb([]);
    } else {
      cb(JSON.parse(http.responseText));
    }
  };
  http.send(null);
};

module.exports = Peer;

},{"./dataconnection":113,"./mediaconnection":114,"./socket":117,"./util":118,"eventemitter3":119}],117:[function(require,module,exports){
var util = require('./util');
var EventEmitter = require('eventemitter3');

/**
 * An abstraction on top of WebSockets and XHR streaming to provide fastest
 * possible connection for peers.
 */
function Socket(secure, host, port, path, key) {
  if (!(this instanceof Socket)) return new Socket(secure, host, port, path, key);

  EventEmitter.call(this);

  // Disconnected manually.
  this.disconnected = false;
  this._queue = [];

  var httpProtocol = secure ? 'https://' : 'http://';
  var wsProtocol = secure ? 'wss://' : 'ws://';
  this._httpUrl = httpProtocol + host + ':' + port + path + key;
  this._wsUrl = wsProtocol + host + ':' + port + path + 'peerjs?key=' + key;
}

util.inherits(Socket, EventEmitter);


/** Check in with ID or get one from server. */
Socket.prototype.start = function(id, token) {
  this.id = id;

  this._httpUrl += '/' + id + '/' + token;
  this._wsUrl += '&id=' + id + '&token=' + token;

  this._startXhrStream();
  this._startWebSocket();
}


/** Start up websocket communications. */
Socket.prototype._startWebSocket = function(id) {
  var self = this;

  if (this._socket) {
    return;
  }

  this._socket = new WebSocket(this._wsUrl);

  this._socket.onmessage = function(event) {
    try {
      var data = JSON.parse(event.data);
    } catch(e) {
      util.log('Invalid server message', event.data);
      return;
    }
    self.emit('message', data);
  };

  this._socket.onclose = function(event) {
    util.log('Socket closed.');
    self.disconnected = true;
    self.emit('disconnected');
  };

  // Take care of the queue of connections if necessary and make sure Peer knows
  // socket is open.
  this._socket.onopen = function() {
    if (self._timeout) {
      clearTimeout(self._timeout);
      setTimeout(function(){
        self._http.abort();
        self._http = null;
      }, 5000);
    }
    self._sendQueuedMessages();
    util.log('Socket open');
  };
}

/** Start XHR streaming. */
Socket.prototype._startXhrStream = function(n) {
  try {
    var self = this;
    this._http = new XMLHttpRequest();
    this._http._index = 1;
    this._http._streamIndex = n || 0;
    this._http.open('post', this._httpUrl + '/id?i=' + this._http._streamIndex, true);
    this._http.onerror = function() {
      // If we get an error, likely something went wrong.
      // Stop streaming.
      clearTimeout(self._timeout);
      self.emit('disconnected');
    }
    this._http.onreadystatechange = function() {
      if (this.readyState == 2 && this.old) {
        this.old.abort();
        delete this.old;
      } else if (this.readyState > 2 && this.status === 200 && this.responseText) {
        self._handleStream(this);
      }
    };
    this._http.send(null);
    this._setHTTPTimeout();
  } catch(e) {
    util.log('XMLHttpRequest not available; defaulting to WebSockets');
  }
}


/** Handles onreadystatechange response as a stream. */
Socket.prototype._handleStream = function(http) {
  // 3 and 4 are loading/done state. All others are not relevant.
  var messages = http.responseText.split('\n');

  // Check to see if anything needs to be processed on buffer.
  if (http._buffer) {
    while (http._buffer.length > 0) {
      var index = http._buffer.shift();
      var bufferedMessage = messages[index];
      try {
        bufferedMessage = JSON.parse(bufferedMessage);
      } catch(e) {
        http._buffer.shift(index);
        break;
      }
      this.emit('message', bufferedMessage);
    }
  }

  var message = messages[http._index];
  if (message) {
    http._index += 1;
    // Buffering--this message is incomplete and we'll get to it next time.
    // This checks if the httpResponse ended in a `\n`, in which case the last
    // element of messages should be the empty string.
    if (http._index === messages.length) {
      if (!http._buffer) {
        http._buffer = [];
      }
      http._buffer.push(http._index - 1);
    } else {
      try {
        message = JSON.parse(message);
      } catch(e) {
        util.log('Invalid server message', message);
        return;
      }
      this.emit('message', message);
    }
  }
}

Socket.prototype._setHTTPTimeout = function() {
  var self = this;
  this._timeout = setTimeout(function() {
    var old = self._http;
    if (!self._wsOpen()) {
      self._startXhrStream(old._streamIndex + 1);
      self._http.old = old;
    } else {
      old.abort();
    }
  }, 25000);
}

/** Is the websocket currently open? */
Socket.prototype._wsOpen = function() {
  return this._socket && this._socket.readyState == 1;
}

/** Send queued messages. */
Socket.prototype._sendQueuedMessages = function() {
  for (var i = 0, ii = this._queue.length; i < ii; i += 1) {
    this.send(this._queue[i]);
  }
}

/** Exposed send for DC & Peer. */
Socket.prototype.send = function(data) {
  if (this.disconnected) {
    return;
  }

  // If we didn't get an ID yet, we can't yet send anything so we should queue
  // up these messages.
  if (!this.id) {
    this._queue.push(data);
    return;
  }

  if (!data.type) {
    this.emit('error', 'Invalid message');
    return;
  }

  var message = JSON.stringify(data);
  if (this._wsOpen()) {
    this._socket.send(message);
  } else {
    var http = new XMLHttpRequest();
    var url = this._httpUrl + '/' + data.type.toLowerCase();
    http.open('post', url, true);
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(message);
  }
}

Socket.prototype.close = function() {
  if (!this.disconnected && this._wsOpen()) {
    this._socket.close();
    this.disconnected = true;
  }
}

module.exports = Socket;

},{"./util":118,"eventemitter3":119}],118:[function(require,module,exports){
var defaultConfig = {'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]};
var dataCount = 1;

var BinaryPack = require('js-binarypack');
var RTCPeerConnection = require('./adapter').RTCPeerConnection;

var util = {
  noop: function() {},

  CLOUD_HOST: '0.peerjs.com',
  CLOUD_PORT: 9000,

  // Browsers that need chunking:
  chunkedBrowsers: {'Chrome': 1},
  chunkedMTU: 16300, // The original 60000 bytes setting does not work when sending data from Firefox to Chrome, which is "cut off" after 16384 bytes and delivered individually.

  // Logging logic
  logLevel: 0,
  setLogLevel: function(level) {
    var debugLevel = parseInt(level, 10);
    if (!isNaN(parseInt(level, 10))) {
      util.logLevel = debugLevel;
    } else {
      // If they are using truthy/falsy values for debug
      util.logLevel = level ? 3 : 0;
    }
    util.log = util.warn = util.error = util.noop;
    if (util.logLevel > 0) {
      util.error = util._printWith('ERROR');
    }
    if (util.logLevel > 1) {
      util.warn = util._printWith('WARNING');
    }
    if (util.logLevel > 2) {
      util.log = util._print;
    }
  },
  setLogFunction: function(fn) {
    if (fn.constructor !== Function) {
      util.warn('The log function you passed in is not a function. Defaulting to regular logs.');
    } else {
      util._print = fn;
    }
  },

  _printWith: function(prefix) {
    return function() {
      var copy = Array.prototype.slice.call(arguments);
      copy.unshift(prefix);
      util._print.apply(util, copy);
    };
  },
  _print: function () {
    var err = false;
    var copy = Array.prototype.slice.call(arguments);
    copy.unshift('PeerJS: ');
    for (var i = 0, l = copy.length; i < l; i++){
      if (copy[i] instanceof Error) {
        copy[i] = '(' + copy[i].name + ') ' + copy[i].message;
        err = true;
      }
    }
    err ? console.error.apply(console, copy) : console.log.apply(console, copy);
  },
  //

  // Returns browser-agnostic default config
  defaultConfig: defaultConfig,
  //

  // Returns the current browser.
  browser: (function() {
    if (window.mozRTCPeerConnection) {
      return 'Firefox';
    } else if (window.webkitRTCPeerConnection) {
      return 'Chrome';
    } else if (window.RTCPeerConnection) {
      return 'Supported';
    } else {
      return 'Unsupported';
    }
  })(),
  //

  // Lists which features are supported
  supports: (function() {
    if (typeof RTCPeerConnection === 'undefined') {
      return {};
    }

    var data = true;
    var audioVideo = true;

    var binaryBlob = false;
    var sctp = false;
    var onnegotiationneeded = !!window.webkitRTCPeerConnection;

    var pc, dc;
    try {
      pc = new RTCPeerConnection(defaultConfig, {optional: [{RtpDataChannels: true}]});
    } catch (e) {
      data = false;
      audioVideo = false;
    }

    if (data) {
      try {
        dc = pc.createDataChannel('_PEERJSTEST');
      } catch (e) {
        data = false;
      }
    }

    if (data) {
      // Binary test
      try {
        dc.binaryType = 'blob';
        binaryBlob = true;
      } catch (e) {
      }

      // Reliable test.
      // Unfortunately Chrome is a bit unreliable about whether or not they
      // support reliable.
      var reliablePC = new RTCPeerConnection(defaultConfig, {});
      try {
        var reliableDC = reliablePC.createDataChannel('_PEERJSRELIABLETEST', {});
        sctp = reliableDC.reliable;
      } catch (e) {
      }
      reliablePC.close();
    }

    // FIXME: not really the best check...
    if (audioVideo) {
      audioVideo = !!pc.addStream;
    }

    // FIXME: this is not great because in theory it doesn't work for
    // av-only browsers (?).
    if (!onnegotiationneeded && data) {
      // sync default check.
      var negotiationPC = new RTCPeerConnection(defaultConfig, {optional: [{RtpDataChannels: true}]});
      negotiationPC.onnegotiationneeded = function() {
        onnegotiationneeded = true;
        // async check.
        if (util && util.supports) {
          util.supports.onnegotiationneeded = true;
        }
      };
      negotiationPC.createDataChannel('_PEERJSNEGOTIATIONTEST');

      setTimeout(function() {
        negotiationPC.close();
      }, 1000);
    }

    if (pc) {
      pc.close();
    }

    return {
      audioVideo: audioVideo,
      data: data,
      binaryBlob: binaryBlob,
      binary: sctp, // deprecated; sctp implies binary support.
      reliable: sctp, // deprecated; sctp implies reliable data.
      sctp: sctp,
      onnegotiationneeded: onnegotiationneeded
    };
  }()),
  //

  // Ensure alphanumeric ids
  validateId: function(id) {
    // Allow empty ids
    return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.exec(id);
  },

  validateKey: function(key) {
    // Allow empty keys
    return !key || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.exec(key);
  },


  debug: false,

  inherits: function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },
  extend: function(dest, source) {
    for(var key in source) {
      if(source.hasOwnProperty(key)) {
        dest[key] = source[key];
      }
    }
    return dest;
  },
  pack: BinaryPack.pack,
  unpack: BinaryPack.unpack,

  log: function () {
    if (util.debug) {
      var err = false;
      var copy = Array.prototype.slice.call(arguments);
      copy.unshift('PeerJS: ');
      for (var i = 0, l = copy.length; i < l; i++){
        if (copy[i] instanceof Error) {
          copy[i] = '(' + copy[i].name + ') ' + copy[i].message;
          err = true;
        }
      }
      err ? console.error.apply(console, copy) : console.log.apply(console, copy);
    }
  },

  setZeroTimeout: (function(global) {
    var timeouts = [];
    var messageName = 'zero-timeout-message';

    // Like setTimeout, but only takes a function argument.	 There's
    // no time argument (always zero) and no arguments (you have to
    // use a closure).
    function setZeroTimeoutPostMessage(fn) {
      timeouts.push(fn);
      global.postMessage(messageName, '*');
    }

    function handleMessage(event) {
      if (event.source == global && event.data == messageName) {
        if (event.stopPropagation) {
          event.stopPropagation();
        }
        if (timeouts.length) {
          timeouts.shift()();
        }
      }
    }
    if (global.addEventListener) {
      global.addEventListener('message', handleMessage, true);
    } else if (global.attachEvent) {
      global.attachEvent('onmessage', handleMessage);
    }
    return setZeroTimeoutPostMessage;
  }(window)),

  // Binary stuff

  // chunks a blob.
  chunk: function(bl) {
    var chunks = [];
    var size = bl.size;
    var start = index = 0;
    var total = Math.ceil(size / util.chunkedMTU);
    while (start < size) {
      var end = Math.min(size, start + util.chunkedMTU);
      var b = bl.slice(start, end);

      var chunk = {
        __peerData: dataCount,
        n: index,
        data: b,
        total: total
      };

      chunks.push(chunk);

      start = end;
      index += 1;
    }
    dataCount += 1;
    return chunks;
  },

  blobToArrayBuffer: function(blob, cb){
    var fr = new FileReader();
    fr.onload = function(evt) {
      cb(evt.target.result);
    };
    fr.readAsArrayBuffer(blob);
  },
  blobToBinaryString: function(blob, cb){
    var fr = new FileReader();
    fr.onload = function(evt) {
      cb(evt.target.result);
    };
    fr.readAsBinaryString(blob);
  },
  binaryStringToArrayBuffer: function(binary) {
    var byteArray = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      byteArray[i] = binary.charCodeAt(i) & 0xff;
    }
    return byteArray.buffer;
  },
  randomToken: function () {
    return Math.random().toString(36).substr(2);
  },
  //

  isSecure: function() {
    return location.protocol === 'https:';
  }
};

module.exports = util;

},{"./adapter":112,"js-binarypack":120}],119:[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}],120:[function(require,module,exports){
var BufferBuilder = require('./bufferbuilder').BufferBuilder;
var binaryFeatures = require('./bufferbuilder').binaryFeatures;

var BinaryPack = {
  unpack: function(data){
    var unpacker = new Unpacker(data);
    return unpacker.unpack();
  },
  pack: function(data){
    var packer = new Packer();
    packer.pack(data);
    var buffer = packer.getBuffer();
    return buffer;
  }
};

module.exports = BinaryPack;

function Unpacker (data){
  // Data is ArrayBuffer
  this.index = 0;
  this.dataBuffer = data;
  this.dataView = new Uint8Array(this.dataBuffer);
  this.length = this.dataBuffer.byteLength;
}

Unpacker.prototype.unpack = function(){
  var type = this.unpack_uint8();
  if (type < 0x80){
    var positive_fixnum = type;
    return positive_fixnum;
  } else if ((type ^ 0xe0) < 0x20){
    var negative_fixnum = (type ^ 0xe0) - 0x20;
    return negative_fixnum;
  }
  var size;
  if ((size = type ^ 0xa0) <= 0x0f){
    return this.unpack_raw(size);
  } else if ((size = type ^ 0xb0) <= 0x0f){
    return this.unpack_string(size);
  } else if ((size = type ^ 0x90) <= 0x0f){
    return this.unpack_array(size);
  } else if ((size = type ^ 0x80) <= 0x0f){
    return this.unpack_map(size);
  }
  switch(type){
    case 0xc0:
      return null;
    case 0xc1:
      return undefined;
    case 0xc2:
      return false;
    case 0xc3:
      return true;
    case 0xca:
      return this.unpack_float();
    case 0xcb:
      return this.unpack_double();
    case 0xcc:
      return this.unpack_uint8();
    case 0xcd:
      return this.unpack_uint16();
    case 0xce:
      return this.unpack_uint32();
    case 0xcf:
      return this.unpack_uint64();
    case 0xd0:
      return this.unpack_int8();
    case 0xd1:
      return this.unpack_int16();
    case 0xd2:
      return this.unpack_int32();
    case 0xd3:
      return this.unpack_int64();
    case 0xd4:
      return undefined;
    case 0xd5:
      return undefined;
    case 0xd6:
      return undefined;
    case 0xd7:
      return undefined;
    case 0xd8:
      size = this.unpack_uint16();
      return this.unpack_string(size);
    case 0xd9:
      size = this.unpack_uint32();
      return this.unpack_string(size);
    case 0xda:
      size = this.unpack_uint16();
      return this.unpack_raw(size);
    case 0xdb:
      size = this.unpack_uint32();
      return this.unpack_raw(size);
    case 0xdc:
      size = this.unpack_uint16();
      return this.unpack_array(size);
    case 0xdd:
      size = this.unpack_uint32();
      return this.unpack_array(size);
    case 0xde:
      size = this.unpack_uint16();
      return this.unpack_map(size);
    case 0xdf:
      size = this.unpack_uint32();
      return this.unpack_map(size);
  }
}

Unpacker.prototype.unpack_uint8 = function(){
  var byte = this.dataView[this.index] & 0xff;
  this.index++;
  return byte;
};

Unpacker.prototype.unpack_uint16 = function(){
  var bytes = this.read(2);
  var uint16 =
    ((bytes[0] & 0xff) * 256) + (bytes[1] & 0xff);
  this.index += 2;
  return uint16;
}

Unpacker.prototype.unpack_uint32 = function(){
  var bytes = this.read(4);
  var uint32 =
     ((bytes[0]  * 256 +
       bytes[1]) * 256 +
       bytes[2]) * 256 +
       bytes[3];
  this.index += 4;
  return uint32;
}

Unpacker.prototype.unpack_uint64 = function(){
  var bytes = this.read(8);
  var uint64 =
   ((((((bytes[0]  * 256 +
       bytes[1]) * 256 +
       bytes[2]) * 256 +
       bytes[3]) * 256 +
       bytes[4]) * 256 +
       bytes[5]) * 256 +
       bytes[6]) * 256 +
       bytes[7];
  this.index += 8;
  return uint64;
}


Unpacker.prototype.unpack_int8 = function(){
  var uint8 = this.unpack_uint8();
  return (uint8 < 0x80 ) ? uint8 : uint8 - (1 << 8);
};

Unpacker.prototype.unpack_int16 = function(){
  var uint16 = this.unpack_uint16();
  return (uint16 < 0x8000 ) ? uint16 : uint16 - (1 << 16);
}

Unpacker.prototype.unpack_int32 = function(){
  var uint32 = this.unpack_uint32();
  return (uint32 < Math.pow(2, 31) ) ? uint32 :
    uint32 - Math.pow(2, 32);
}

Unpacker.prototype.unpack_int64 = function(){
  var uint64 = this.unpack_uint64();
  return (uint64 < Math.pow(2, 63) ) ? uint64 :
    uint64 - Math.pow(2, 64);
}

Unpacker.prototype.unpack_raw = function(size){
  if ( this.length < this.index + size){
    throw new Error('BinaryPackFailure: index is out of range'
      + ' ' + this.index + ' ' + size + ' ' + this.length);
  }
  var buf = this.dataBuffer.slice(this.index, this.index + size);
  this.index += size;

    //buf = util.bufferToString(buf);

  return buf;
}

Unpacker.prototype.unpack_string = function(size){
  var bytes = this.read(size);
  var i = 0, str = '', c, code;
  while(i < size){
    c = bytes[i];
    if ( c < 128){
      str += String.fromCharCode(c);
      i++;
    } else if ((c ^ 0xc0) < 32){
      code = ((c ^ 0xc0) << 6) | (bytes[i+1] & 63);
      str += String.fromCharCode(code);
      i += 2;
    } else {
      code = ((c & 15) << 12) | ((bytes[i+1] & 63) << 6) |
        (bytes[i+2] & 63);
      str += String.fromCharCode(code);
      i += 3;
    }
  }
  this.index += size;
  return str;
}

Unpacker.prototype.unpack_array = function(size){
  var objects = new Array(size);
  for(var i = 0; i < size ; i++){
    objects[i] = this.unpack();
  }
  return objects;
}

Unpacker.prototype.unpack_map = function(size){
  var map = {};
  for(var i = 0; i < size ; i++){
    var key  = this.unpack();
    var value = this.unpack();
    map[key] = value;
  }
  return map;
}

Unpacker.prototype.unpack_float = function(){
  var uint32 = this.unpack_uint32();
  var sign = uint32 >> 31;
  var exp  = ((uint32 >> 23) & 0xff) - 127;
  var fraction = ( uint32 & 0x7fffff ) | 0x800000;
  return (sign == 0 ? 1 : -1) *
    fraction * Math.pow(2, exp - 23);
}

Unpacker.prototype.unpack_double = function(){
  var h32 = this.unpack_uint32();
  var l32 = this.unpack_uint32();
  var sign = h32 >> 31;
  var exp  = ((h32 >> 20) & 0x7ff) - 1023;
  var hfrac = ( h32 & 0xfffff ) | 0x100000;
  var frac = hfrac * Math.pow(2, exp - 20) +
    l32   * Math.pow(2, exp - 52);
  return (sign == 0 ? 1 : -1) * frac;
}

Unpacker.prototype.read = function(length){
  var j = this.index;
  if (j + length <= this.length) {
    return this.dataView.subarray(j, j + length);
  } else {
    throw new Error('BinaryPackFailure: read index out of range');
  }
}

function Packer(){
  this.bufferBuilder = new BufferBuilder();
}

Packer.prototype.getBuffer = function(){
  return this.bufferBuilder.getBuffer();
}

Packer.prototype.pack = function(value){
  var type = typeof(value);
  if (type == 'string'){
    this.pack_string(value);
  } else if (type == 'number'){
    if (Math.floor(value) === value){
      this.pack_integer(value);
    } else{
      this.pack_double(value);
    }
  } else if (type == 'boolean'){
    if (value === true){
      this.bufferBuilder.append(0xc3);
    } else if (value === false){
      this.bufferBuilder.append(0xc2);
    }
  } else if (type == 'undefined'){
    this.bufferBuilder.append(0xc0);
  } else if (type == 'object'){
    if (value === null){
      this.bufferBuilder.append(0xc0);
    } else {
      var constructor = value.constructor;
      if (constructor == Array){
        this.pack_array(value);
      } else if (constructor == Blob || constructor == File) {
        this.pack_bin(value);
      } else if (constructor == ArrayBuffer) {
        if(binaryFeatures.useArrayBufferView) {
          this.pack_bin(new Uint8Array(value));
        } else {
          this.pack_bin(value);
        }
      } else if ('BYTES_PER_ELEMENT' in value){
        if(binaryFeatures.useArrayBufferView) {
          this.pack_bin(new Uint8Array(value.buffer));
        } else {
          this.pack_bin(value.buffer);
        }
      } else if (constructor == Object){
        this.pack_object(value);
      } else if (constructor == Date){
        this.pack_string(value.toString());
      } else if (typeof value.toBinaryPack == 'function'){
        this.bufferBuilder.append(value.toBinaryPack());
      } else {
        throw new Error('Type "' + constructor.toString() + '" not yet supported');
      }
    }
  } else {
    throw new Error('Type "' + type + '" not yet supported');
  }
  this.bufferBuilder.flush();
}


Packer.prototype.pack_bin = function(blob){
  var length = blob.length || blob.byteLength || blob.size;
  if (length <= 0x0f){
    this.pack_uint8(0xa0 + length);
  } else if (length <= 0xffff){
    this.bufferBuilder.append(0xda) ;
    this.pack_uint16(length);
  } else if (length <= 0xffffffff){
    this.bufferBuilder.append(0xdb);
    this.pack_uint32(length);
  } else{
    throw new Error('Invalid length');
  }
  this.bufferBuilder.append(blob);
}

Packer.prototype.pack_string = function(str){
  var length = utf8Length(str);

  if (length <= 0x0f){
    this.pack_uint8(0xb0 + length);
  } else if (length <= 0xffff){
    this.bufferBuilder.append(0xd8) ;
    this.pack_uint16(length);
  } else if (length <= 0xffffffff){
    this.bufferBuilder.append(0xd9);
    this.pack_uint32(length);
  } else{
    throw new Error('Invalid length');
  }
  this.bufferBuilder.append(str);
}

Packer.prototype.pack_array = function(ary){
  var length = ary.length;
  if (length <= 0x0f){
    this.pack_uint8(0x90 + length);
  } else if (length <= 0xffff){
    this.bufferBuilder.append(0xdc)
    this.pack_uint16(length);
  } else if (length <= 0xffffffff){
    this.bufferBuilder.append(0xdd);
    this.pack_uint32(length);
  } else{
    throw new Error('Invalid length');
  }
  for(var i = 0; i < length ; i++){
    this.pack(ary[i]);
  }
}

Packer.prototype.pack_integer = function(num){
  if ( -0x20 <= num && num <= 0x7f){
    this.bufferBuilder.append(num & 0xff);
  } else if (0x00 <= num && num <= 0xff){
    this.bufferBuilder.append(0xcc);
    this.pack_uint8(num);
  } else if (-0x80 <= num && num <= 0x7f){
    this.bufferBuilder.append(0xd0);
    this.pack_int8(num);
  } else if ( 0x0000 <= num && num <= 0xffff){
    this.bufferBuilder.append(0xcd);
    this.pack_uint16(num);
  } else if (-0x8000 <= num && num <= 0x7fff){
    this.bufferBuilder.append(0xd1);
    this.pack_int16(num);
  } else if ( 0x00000000 <= num && num <= 0xffffffff){
    this.bufferBuilder.append(0xce);
    this.pack_uint32(num);
  } else if (-0x80000000 <= num && num <= 0x7fffffff){
    this.bufferBuilder.append(0xd2);
    this.pack_int32(num);
  } else if (-0x8000000000000000 <= num && num <= 0x7FFFFFFFFFFFFFFF){
    this.bufferBuilder.append(0xd3);
    this.pack_int64(num);
  } else if (0x0000000000000000 <= num && num <= 0xFFFFFFFFFFFFFFFF){
    this.bufferBuilder.append(0xcf);
    this.pack_uint64(num);
  } else{
    throw new Error('Invalid integer');
  }
}

Packer.prototype.pack_double = function(num){
  var sign = 0;
  if (num < 0){
    sign = 1;
    num = -num;
  }
  var exp  = Math.floor(Math.log(num) / Math.LN2);
  var frac0 = num / Math.pow(2, exp) - 1;
  var frac1 = Math.floor(frac0 * Math.pow(2, 52));
  var b32   = Math.pow(2, 32);
  var h32 = (sign << 31) | ((exp+1023) << 20) |
      (frac1 / b32) & 0x0fffff;
  var l32 = frac1 % b32;
  this.bufferBuilder.append(0xcb);
  this.pack_int32(h32);
  this.pack_int32(l32);
}

Packer.prototype.pack_object = function(obj){
  var keys = Object.keys(obj);
  var length = keys.length;
  if (length <= 0x0f){
    this.pack_uint8(0x80 + length);
  } else if (length <= 0xffff){
    this.bufferBuilder.append(0xde);
    this.pack_uint16(length);
  } else if (length <= 0xffffffff){
    this.bufferBuilder.append(0xdf);
    this.pack_uint32(length);
  } else{
    throw new Error('Invalid length');
  }
  for(var prop in obj){
    if (obj.hasOwnProperty(prop)){
      this.pack(prop);
      this.pack(obj[prop]);
    }
  }
}

Packer.prototype.pack_uint8 = function(num){
  this.bufferBuilder.append(num);
}

Packer.prototype.pack_uint16 = function(num){
  this.bufferBuilder.append(num >> 8);
  this.bufferBuilder.append(num & 0xff);
}

Packer.prototype.pack_uint32 = function(num){
  var n = num & 0xffffffff;
  this.bufferBuilder.append((n & 0xff000000) >>> 24);
  this.bufferBuilder.append((n & 0x00ff0000) >>> 16);
  this.bufferBuilder.append((n & 0x0000ff00) >>>  8);
  this.bufferBuilder.append((n & 0x000000ff));
}

Packer.prototype.pack_uint64 = function(num){
  var high = num / Math.pow(2, 32);
  var low  = num % Math.pow(2, 32);
  this.bufferBuilder.append((high & 0xff000000) >>> 24);
  this.bufferBuilder.append((high & 0x00ff0000) >>> 16);
  this.bufferBuilder.append((high & 0x0000ff00) >>>  8);
  this.bufferBuilder.append((high & 0x000000ff));
  this.bufferBuilder.append((low  & 0xff000000) >>> 24);
  this.bufferBuilder.append((low  & 0x00ff0000) >>> 16);
  this.bufferBuilder.append((low  & 0x0000ff00) >>>  8);
  this.bufferBuilder.append((low  & 0x000000ff));
}

Packer.prototype.pack_int8 = function(num){
  this.bufferBuilder.append(num & 0xff);
}

Packer.prototype.pack_int16 = function(num){
  this.bufferBuilder.append((num & 0xff00) >> 8);
  this.bufferBuilder.append(num & 0xff);
}

Packer.prototype.pack_int32 = function(num){
  this.bufferBuilder.append((num >>> 24) & 0xff);
  this.bufferBuilder.append((num & 0x00ff0000) >>> 16);
  this.bufferBuilder.append((num & 0x0000ff00) >>> 8);
  this.bufferBuilder.append((num & 0x000000ff));
}

Packer.prototype.pack_int64 = function(num){
  var high = Math.floor(num / Math.pow(2, 32));
  var low  = num % Math.pow(2, 32);
  this.bufferBuilder.append((high & 0xff000000) >>> 24);
  this.bufferBuilder.append((high & 0x00ff0000) >>> 16);
  this.bufferBuilder.append((high & 0x0000ff00) >>>  8);
  this.bufferBuilder.append((high & 0x000000ff));
  this.bufferBuilder.append((low  & 0xff000000) >>> 24);
  this.bufferBuilder.append((low  & 0x00ff0000) >>> 16);
  this.bufferBuilder.append((low  & 0x0000ff00) >>>  8);
  this.bufferBuilder.append((low  & 0x000000ff));
}

function _utf8Replace(m){
  var code = m.charCodeAt(0);

  if(code <= 0x7ff) return '00';
  if(code <= 0xffff) return '000';
  if(code <= 0x1fffff) return '0000';
  if(code <= 0x3ffffff) return '00000';
  return '000000';
}

function utf8Length(str){
  if (str.length > 600) {
    // Blob method faster for large strings
    return (new Blob([str])).size;
  } else {
    return str.replace(/[^\u0000-\u007F]/g, _utf8Replace).length;
  }
}

},{"./bufferbuilder":121}],121:[function(require,module,exports){
var binaryFeatures = {};
binaryFeatures.useBlobBuilder = (function(){
  try {
    new Blob([]);
    return false;
  } catch (e) {
    return true;
  }
})();

binaryFeatures.useArrayBufferView = !binaryFeatures.useBlobBuilder && (function(){
  try {
    return (new Blob([new Uint8Array([])])).size === 0;
  } catch (e) {
    return true;
  }
})();

module.exports.binaryFeatures = binaryFeatures;
var BlobBuilder = module.exports.BlobBuilder;
if (typeof window != 'undefined') {
  BlobBuilder = module.exports.BlobBuilder = window.WebKitBlobBuilder ||
    window.MozBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;
}

function BufferBuilder(){
  this._pieces = [];
  this._parts = [];
}

BufferBuilder.prototype.append = function(data) {
  if(typeof data === 'number') {
    this._pieces.push(data);
  } else {
    this.flush();
    this._parts.push(data);
  }
};

BufferBuilder.prototype.flush = function() {
  if (this._pieces.length > 0) {
    var buf = new Uint8Array(this._pieces);
    if(!binaryFeatures.useArrayBufferView) {
      buf = buf.buffer;
    }
    this._parts.push(buf);
    this._pieces = [];
  }
};

BufferBuilder.prototype.getBuffer = function() {
  this.flush();
  if(binaryFeatures.useBlobBuilder) {
    var builder = new BlobBuilder();
    for(var i = 0, ii = this._parts.length; i < ii; i++) {
      builder.append(this._parts[i]);
    }
    return builder.getBlob();
  } else {
    return new Blob(this._parts);
  }
};

module.exports.BufferBuilder = BufferBuilder;

},{}],122:[function(require,module,exports){
var util = require('./util');

/**
 * Reliable transfer for Chrome Canary DataChannel impl.
 * Author: @michellebu
 */
function Reliable(dc, debug) {
  if (!(this instanceof Reliable)) return new Reliable(dc);
  this._dc = dc;

  util.debug = debug;

  // Messages sent/received so far.
  // id: { ack: n, chunks: [...] }
  this._outgoing = {};
  // id: { ack: ['ack', id, n], chunks: [...] }
  this._incoming = {};
  this._received = {};

  // Window size.
  this._window = 1000;
  // MTU.
  this._mtu = 500;
  // Interval for setInterval. In ms.
  this._interval = 0;

  // Messages sent.
  this._count = 0;

  // Outgoing message queue.
  this._queue = [];

  this._setupDC();
};

// Send a message reliably.
Reliable.prototype.send = function(msg) {
  // Determine if chunking is necessary.
  var bl = util.pack(msg);
  if (bl.size < this._mtu) {
    this._handleSend(['no', bl]);
    return;
  }

  this._outgoing[this._count] = {
    ack: 0,
    chunks: this._chunk(bl)
  };

  if (util.debug) {
    this._outgoing[this._count].timer = new Date();
  }

  // Send prelim window.
  this._sendWindowedChunks(this._count);
  this._count += 1;
};

// Set up interval for processing queue.
Reliable.prototype._setupInterval = function() {
  // TODO: fail gracefully.

  var self = this;
  this._timeout = setInterval(function() {
    // FIXME: String stuff makes things terribly async.
    var msg = self._queue.shift();
    if (msg._multiple) {
      for (var i = 0, ii = msg.length; i < ii; i += 1) {
        self._intervalSend(msg[i]);
      }
    } else {
      self._intervalSend(msg);
    }
  }, this._interval);
};

Reliable.prototype._intervalSend = function(msg) {
  var self = this;
  msg = util.pack(msg);
  util.blobToBinaryString(msg, function(str) {
    self._dc.send(str);
  });
  if (self._queue.length === 0) {
    clearTimeout(self._timeout);
    self._timeout = null;
    //self._processAcks();
  }
};

// Go through ACKs to send missing pieces.
Reliable.prototype._processAcks = function() {
  for (var id in this._outgoing) {
    if (this._outgoing.hasOwnProperty(id)) {
      this._sendWindowedChunks(id);
    }
  }
};

// Handle sending a message.
// FIXME: Don't wait for interval time for all messages...
Reliable.prototype._handleSend = function(msg) {
  var push = true;
  for (var i = 0, ii = this._queue.length; i < ii; i += 1) {
    var item = this._queue[i];
    if (item === msg) {
      push = false;
    } else if (item._multiple && item.indexOf(msg) !== -1) {
      push = false;
    }
  }
  if (push) {
    this._queue.push(msg);
    if (!this._timeout) {
      this._setupInterval();
    }
  }
};

// Set up DataChannel handlers.
Reliable.prototype._setupDC = function() {
  // Handle various message types.
  var self = this;
  this._dc.onmessage = function(e) {
    var msg = e.data;
    var datatype = msg.constructor;
    // FIXME: msg is String until binary is supported.
    // Once that happens, this will have to be smarter.
    if (datatype === String) {
      var ab = util.binaryStringToArrayBuffer(msg);
      msg = util.unpack(ab);
      self._handleMessage(msg);
    }
  };
};

// Handles an incoming message.
Reliable.prototype._handleMessage = function(msg) {
  var id = msg[1];
  var idata = this._incoming[id];
  var odata = this._outgoing[id];
  var data;
  switch (msg[0]) {
    // No chunking was done.
    case 'no':
      var message = id;
      if (!!message) {
        this.onmessage(util.unpack(message));
      }
      break;
    // Reached the end of the message.
    case 'end':
      data = idata;

      // In case end comes first.
      this._received[id] = msg[2];

      if (!data) {
        break;
      }

      this._ack(id);
      break;
    case 'ack':
      data = odata;
      if (!!data) {
        var ack = msg[2];
        // Take the larger ACK, for out of order messages.
        data.ack = Math.max(ack, data.ack);

        // Clean up when all chunks are ACKed.
        if (data.ack >= data.chunks.length) {
          util.log('Time: ', new Date() - data.timer);
          delete this._outgoing[id];
        } else {
          this._processAcks();
        }
      }
      // If !data, just ignore.
      break;
    // Received a chunk of data.
    case 'chunk':
      // Create a new entry if none exists.
      data = idata;
      if (!data) {
        var end = this._received[id];
        if (end === true) {
          break;
        }
        data = {
          ack: ['ack', id, 0],
          chunks: []
        };
        this._incoming[id] = data;
      }

      var n = msg[2];
      var chunk = msg[3];
      data.chunks[n] = new Uint8Array(chunk);

      // If we get the chunk we're looking for, ACK for next missing.
      // Otherwise, ACK the same N again.
      if (n === data.ack[2]) {
        this._calculateNextAck(id);
      }
      this._ack(id);
      break;
    default:
      // Shouldn't happen, but would make sense for message to just go
      // through as is.
      this._handleSend(msg);
      break;
  }
};

// Chunks BL into smaller messages.
Reliable.prototype._chunk = function(bl) {
  var chunks = [];
  var size = bl.size;
  var start = 0;
  while (start < size) {
    var end = Math.min(size, start + this._mtu);
    var b = bl.slice(start, end);
    var chunk = {
      payload: b
    }
    chunks.push(chunk);
    start = end;
  }
  util.log('Created', chunks.length, 'chunks.');
  return chunks;
};

// Sends ACK N, expecting Nth blob chunk for message ID.
Reliable.prototype._ack = function(id) {
  var ack = this._incoming[id].ack;

  // if ack is the end value, then call _complete.
  if (this._received[id] === ack[2]) {
    this._complete(id);
    this._received[id] = true;
  }

  this._handleSend(ack);
};

// Calculates the next ACK number, given chunks.
Reliable.prototype._calculateNextAck = function(id) {
  var data = this._incoming[id];
  var chunks = data.chunks;
  for (var i = 0, ii = chunks.length; i < ii; i += 1) {
    // This chunk is missing!!! Better ACK for it.
    if (chunks[i] === undefined) {
      data.ack[2] = i;
      return;
    }
  }
  data.ack[2] = chunks.length;
};

// Sends the next window of chunks.
Reliable.prototype._sendWindowedChunks = function(id) {
  util.log('sendWindowedChunks for: ', id);
  var data = this._outgoing[id];
  var ch = data.chunks;
  var chunks = [];
  var limit = Math.min(data.ack + this._window, ch.length);
  for (var i = data.ack; i < limit; i += 1) {
    if (!ch[i].sent || i === data.ack) {
      ch[i].sent = true;
      chunks.push(['chunk', id, i, ch[i].payload]);
    }
  }
  if (data.ack + this._window >= ch.length) {
    chunks.push(['end', id, ch.length])
  }
  chunks._multiple = true;
  this._handleSend(chunks);
};

// Puts together a message from chunks.
Reliable.prototype._complete = function(id) {
  util.log('Completed called for', id);
  var self = this;
  var chunks = this._incoming[id].chunks;
  var bl = new Blob(chunks);
  util.blobToArrayBuffer(bl, function(ab) {
    self.onmessage(util.unpack(ab));
  });
  delete this._incoming[id];
};

// Ups bandwidth limit on SDP. Meant to be called during offer/answer.
Reliable.higherBandwidthSDP = function(sdp) {
  // AS stands for Application-Specific Maximum.
  // Bandwidth number is in kilobits / sec.
  // See RFC for more info: http://www.ietf.org/rfc/rfc2327.txt

  // Chrome 31+ doesn't want us munging the SDP, so we'll let them have their
  // way.
  var version = navigator.appVersion.match(/Chrome\/(.*?) /);
  if (version) {
    version = parseInt(version[1].split('.').shift());
    if (version < 31) {
      var parts = sdp.split('b=AS:30');
      var replace = 'b=AS:102400'; // 100 Mbps
      if (parts.length > 1) {
        return parts[0] + replace + parts[1];
      }
    }
  }

  return sdp;
};

// Overwritten, typically.
Reliable.prototype.onmessage = function(msg) {};

module.exports.Reliable = Reliable;

},{"./util":123}],123:[function(require,module,exports){
var BinaryPack = require('js-binarypack');

var util = {
  debug: false,
  
  inherits: function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },
  extend: function(dest, source) {
    for(var key in source) {
      if(source.hasOwnProperty(key)) {
        dest[key] = source[key];
      }
    }
    return dest;
  },
  pack: BinaryPack.pack,
  unpack: BinaryPack.unpack,
  
  log: function () {
    if (util.debug) {
      var copy = [];
      for (var i = 0; i < arguments.length; i++) {
        copy[i] = arguments[i];
      }
      copy.unshift('Reliable: ');
      console.log.apply(console, copy);
    }
  },

  setZeroTimeout: (function(global) {
    var timeouts = [];
    var messageName = 'zero-timeout-message';

    // Like setTimeout, but only takes a function argument.	 There's
    // no time argument (always zero) and no arguments (you have to
    // use a closure).
    function setZeroTimeoutPostMessage(fn) {
      timeouts.push(fn);
      global.postMessage(messageName, '*');
    }		

    function handleMessage(event) {
      if (event.source == global && event.data == messageName) {
        if (event.stopPropagation) {
          event.stopPropagation();
        }
        if (timeouts.length) {
          timeouts.shift()();
        }
      }
    }
    if (global.addEventListener) {
      global.addEventListener('message', handleMessage, true);
    } else if (global.attachEvent) {
      global.attachEvent('onmessage', handleMessage);
    }
    return setZeroTimeoutPostMessage;
  }(this)),
  
  blobToArrayBuffer: function(blob, cb){
    var fr = new FileReader();
    fr.onload = function(evt) {
      cb(evt.target.result);
    };
    fr.readAsArrayBuffer(blob);
  },
  blobToBinaryString: function(blob, cb){
    var fr = new FileReader();
    fr.onload = function(evt) {
      cb(evt.target.result);
    };
    fr.readAsBinaryString(blob);
  },
  binaryStringToArrayBuffer: function(binary) {
    var byteArray = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      byteArray[i] = binary.charCodeAt(i) & 0xff;
    }
    return byteArray.buffer;
  },
  randomToken: function () {
    return Math.random().toString(36).substr(2);
  }
};

module.exports = util;

},{"js-binarypack":120}],124:[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// performance.now polyfill
( function ( root ) {

	if ( 'performance' in root === false ) {
		root.performance = {};
	}

	// IE 8
	Date.now = ( Date.now || function () {
		return new Date().getTime();
	} );

	if ( 'now' in root.performance === false ) {
		var offset = root.performance.timing && root.performance.timing.navigationStart ? performance.timing.navigationStart
		                                                                                : Date.now();

		root.performance.now = function () {
			return Date.now() - offset;
		};
	}

} )( this );

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '14',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : window.performance.now();

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : window.performance.now();
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
( function ( root ) {

	if ( typeof define === 'function' && define.amd ) {

		// AMD
		define( [], function () {
			return TWEEN;
		} );

	} else if ( typeof exports === 'object' ) {

		// Node.js
		module.exports = TWEEN;

	} else {

		// Global variable
		root.TWEEN = TWEEN;

	}

} )( this );

},{}]},{},[18])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvYS1zbGlkZXMvaW5kZXguanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvYS1zbGlkZXMvcGx1Z2lucy9kZWVwLWxpbmtpbmcuanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvYS1zbGlkZXMvcGx1Z2lucy9pbnRlcmFjdGlvbi1rZXlib2FyZC1tb3VzZS5qcyIsIi9ob21lL2FkYS9naXRXb3JraW5nRGlyL2Etc2xpZGVzL2FwcC9fc2NyaXB0cy9hLXNsaWRlcy9wbHVnaW5zL2ludGVyYWN0aW9uLXRvdWNoLmpzIiwiL2hvbWUvYWRhL2dpdFdvcmtpbmdEaXIvYS1zbGlkZXMvYXBwL19zY3JpcHRzL2Etc2xpZGVzL3BsdWdpbnMvbWFya2Rvd24uanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvYS1zbGlkZXMvcGx1Z2lucy9zbGlkZS1jb250cm9sbGVyLmpzIiwiL2hvbWUvYWRhL2dpdFdvcmtpbmdEaXIvYS1zbGlkZXMvYXBwL19zY3JpcHRzL2Etc2xpZGVzL3BsdWdpbnMvdXRpbC1wb2x5ZmlsbHMuanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvYS1zbGlkZXMvcGx1Z2lucy93ZWJydGMtYnJpZGdlLmpzIiwiL2hvbWUvYWRhL2dpdFdvcmtpbmdEaXIvYS1zbGlkZXMvYXBwL19zY3JpcHRzL2NvbnRlbnQvY29udGFpbm1lbnQuanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvY29udGVudC9kZW1vcy5qcyIsIi9ob21lL2FkYS9naXRXb3JraW5nRGlyL2Etc2xpZGVzL2FwcC9fc2NyaXB0cy9jb250ZW50L2RvbS5qcyIsIi9ob21lL2FkYS9naXRXb3JraW5nRGlyL2Etc2xpZGVzL2FwcC9fc2NyaXB0cy9jb250ZW50L2RvbTIuanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvY29udGVudC9mcm9udGxvYWRpbmcuanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvY29udGVudC9pbmRleC5qcyIsIi9ob21lL2FkYS9naXRXb3JraW5nRGlyL2Etc2xpZGVzL2FwcC9fc2NyaXB0cy9jb250ZW50L2phbmsuanMiLCIvaG9tZS9hZGEvZ2l0V29ya2luZ0Rpci9hLXNsaWRlcy9hcHAvX3NjcmlwdHMvY29udGVudC9zaW1kLmpzIiwiL2hvbWUvYWRhL2dpdFdvcmtpbmdEaXIvYS1zbGlkZXMvYXBwL19zY3JpcHRzL2NvbnRlbnQvd29ya2VyLmpzIiwiL2hvbWUvYWRhL2dpdFdvcmtpbmdEaXIvYS1zbGlkZXMvYXBwL19zY3JpcHRzL21haW4uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL2FycmF5L2Zyb20uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zZXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sL2l0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzcy1jYWxsLWNoZWNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jcmVhdGUtY2xhc3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb20uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zZXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2l0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNsYXNzb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24tdG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY3R4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZGVmLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZGVmaW5lZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5lbnVtLWtleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZvci1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdldC1uYW1lcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmhhcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmhpZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5odG1sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW52b2tlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLWFycmF5LWl0ZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNhbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1kZXRlY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLXN0ZXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmtleW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm1pY3JvdGFzay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm1peC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnByb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNhbWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zaGFyZWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3RyaWN0LW5ldy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN1cHBvcnQtZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRhZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRhc2suanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnVpZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnVuc2NvcGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC53a3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5mcm9tLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zZXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcuc2V0LnRvLWpzb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvcmVnZW5lcmF0b3IvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9oYW1tZXJqcy9oYW1tZXIuanMiLCJub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuanMiLCJub2RlX21vZHVsZXMvcGVlcmpzL2xpYi9hZGFwdGVyLmpzIiwibm9kZV9tb2R1bGVzL3BlZXJqcy9saWIvZGF0YWNvbm5lY3Rpb24uanMiLCJub2RlX21vZHVsZXMvcGVlcmpzL2xpYi9tZWRpYWNvbm5lY3Rpb24uanMiLCJub2RlX21vZHVsZXMvcGVlcmpzL2xpYi9uZWdvdGlhdG9yLmpzIiwibm9kZV9tb2R1bGVzL3BlZXJqcy9saWIvcGVlci5qcyIsIm5vZGVfbW9kdWxlcy9wZWVyanMvbGliL3NvY2tldC5qcyIsIm5vZGVfbW9kdWxlcy9wZWVyanMvbGliL3V0aWwuanMiLCJub2RlX21vZHVsZXMvcGVlcmpzL25vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BlZXJqcy9ub2RlX21vZHVsZXMvanMtYmluYXJ5cGFjay9saWIvYmluYXJ5cGFjay5qcyIsIm5vZGVfbW9kdWxlcy9wZWVyanMvbm9kZV9tb2R1bGVzL2pzLWJpbmFyeXBhY2svbGliL2J1ZmZlcmJ1aWxkZXIuanMiLCJub2RlX21vZHVsZXMvcGVlcmpzL25vZGVfbW9kdWxlcy9yZWxpYWJsZS9saWIvcmVsaWFibGUuanMiLCJub2RlX21vZHVsZXMvcGVlcmpzL25vZGVfbW9kdWxlcy9yZWxpYWJsZS9saWIvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy90d2Vlbi5qcy9zcmMvVHdlZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7QUFFYixPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQzs7QUFFcEMsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFHLE9BQU87bUNBQTZCLE9BQU87Q0FBcUMsQ0FBQzs7O0FBR3ZHLFNBQVMsTUFBTSxDQUFDLFNBQVMsRUFBa0Q7a0VBQUosRUFBRTs7eUJBQTdDLE9BQU87S0FBUCxPQUFPLGdDQUFHLEVBQUU7Z0NBQUUsY0FBYztLQUFkLGNBQWMsdUNBQUcsUUFBUTs7QUFFbEUsS0FBTSxVQUFVLEdBQUcsQ0FBQSxTQUFTLFVBQVUsQ0FBQyxPQUFPLEVBQUU7O0FBRS9DLFVBQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDOztBQUV4QixnQkFBYyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUMsQ0FBQyxDQUFDOztBQUV2RCxNQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN2QixZQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUMxRSxNQUFNO0FBQ04sWUFBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHO0FBQ3BCLFNBQUssRUFBQSxpQkFBRyxFQUFFO0FBQ1YsVUFBTSwyQkFBRTs7Ozs7Ozs7Ozs7O0tBQW9CLENBQUE7QUFDNUIsWUFBUSxFQUFBLG9CQUFHLEVBQUU7SUFDYixDQUFDO0dBQ0Y7O0FBRUQsTUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7OztBQUloRyxjQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7OztBQUdwQyxNQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0VBQzFCLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWIsVUFBUyxhQUFhLENBQUMsT0FBTyxFQUFFOztBQUUvQixnQkFBYyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQzFELE1BQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZCLFlBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0dBQzdFO0VBQ0Q7OztBQUdELFVBQVMsU0FBUyxDQUFDLEtBQU8sRUFBRTtNQUFSLEtBQUssR0FBTixLQUFPLENBQU4sS0FBSzs7QUFDeEIsTUFBTSxRQUFRLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDekUsTUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPO0FBQ3RCLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQzVDLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNwQyxNQUFJLFFBQVEsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO0FBQ3RDLE9BQUksUUFBUSxFQUFFO0FBQ2IsWUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEMsWUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFBTSxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7S0FBQSxDQUFDLENBQUM7SUFDOUU7QUFDRCxXQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlCLFdBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLGdCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDMUIsYUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ3ZCO0VBQ0Q7O0FBRUQsVUFBUyxhQUFhLEdBQUc7QUFDeEIsV0FBUyxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQztFQUM1RDs7QUFFRCxVQUFTLGFBQWEsR0FBRztBQUN4QixXQUFTLENBQUMsRUFBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0VBQzVEOztBQUVELEtBQUksQ0FBQyxhQUFhLEdBQUc7QUFDcEIsTUFBSSxFQUFBLGdCQUFHO0FBQ04sVUFBTyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQztHQUNyQjtFQUNELENBQUM7OztBQUdGLGVBQWMsQ0FBQyxFQUFFLENBQUMsd0JBQXdCLEVBQUUsQ0FBQSxZQUFZO0FBQ3ZELE1BQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUU7OztBQUdsQyxPQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztHQUN0RDtFQUNELENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFZCxlQUFjLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFO1NBQU0sYUFBYSxFQUFFO0VBQUEsQ0FBQyxDQUFDO0FBQ2hFLGVBQWMsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUU7U0FBTSxhQUFhLEVBQUU7RUFBQSxDQUFDLENBQUM7QUFDcEUsZUFBYyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxVQUFBLENBQUM7U0FBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztFQUFBLENBQUMsQ0FBQzs7QUFFbkUsUUFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUN6QixNQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsRUFBRTtBQUNqQyxTQUFNLENBQUM7QUFDTixhQUFTLEVBQVQsU0FBUztBQUNULGtCQUFjLEVBQWQsY0FBYztJQUNkLENBQUMsQ0FBQztHQUNIO0VBQ0QsQ0FBQyxDQUFDO0NBRUg7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7OztBQ25HeEIsWUFBWSxDQUFDOztBQUViLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUU1QixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsSUFBZ0IsRUFBRTtLQUFqQixjQUFjLEdBQWYsSUFBZ0IsQ0FBZixjQUFjOztBQUN6QyxLQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUU7O0FBRWxCLE1BQU0sS0FBSyxHQUFHLENBQUMsNEJBQTBCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFLLENBQUM7OztBQUdyRSxNQUFJLEtBQUssRUFBRTtBQUNWLGlCQUFjLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUMsS0FBSyxFQUFMLEtBQUssRUFBQyxDQUFDLENBQUM7R0FDcEQ7O0FBRUQsZ0JBQWMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0VBQzlCLE1BQU07QUFDTixnQkFBYyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0VBQ3ZEO0NBQ0QsQ0FBQzs7O0FDbEJGLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLElBQWdCLEVBQUU7S0FBakIsY0FBYyxHQUFmLElBQWdCLENBQWYsY0FBYzs7QUFDekMsT0FBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNyQyxVQUFPLENBQUMsQ0FBQyxPQUFPOzs7QUFHZixRQUFLLEVBQUU7QUFDTixrQkFBYyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQy9DLFVBQU07O0FBQUE7QUFHUCxRQUFLLEVBQUUsQ0FBQztBQUNSLFFBQUssRUFBRTtBQUNOLGtCQUFjLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDOUMsVUFBTTs7QUFBQSxBQUVQLFFBQUssRUFBRTtBQUNOLGtCQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNoRCxVQUFNO0FBQUEsR0FDUDtFQUNELENBQUMsQ0FBQzs7QUFFSCxlQUFjLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZO0FBQ3RDLE1BQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztFQUNwQyxDQUFDLENBQUM7Q0FDSCxDQUFDOzs7QUM1QkYsWUFBWSxDQUFDOztBQUViLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUU1QixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRW5DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxNQUFNLEVBQUU7O0FBRWxDLFFBQU8sVUFBVSxJQUFnQixFQUFFO01BQWpCLGNBQWMsR0FBZixJQUFnQixDQUFmLGNBQWM7O0FBRS9CLE1BQU0sT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzNDLFNBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzs7QUFFeEQsTUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMvQyxVQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRTtXQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7SUFBQSxDQUFDLENBQUM7R0FDMUU7O0FBRUQsTUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUM1QyxVQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRTtXQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUM7SUFBQSxDQUFDLENBQUM7R0FDL0U7RUFDRCxDQUFDO0NBRUYsQ0FBQzs7O0FDdEJGLFlBQVksQ0FBQzs7OztBQUViLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUU1QixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUdqQyxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVk7QUFDNUIsS0FBTSxDQUFDLEdBQUcsVUFBUyxDQUFDOzs7QUFHcEIsR0FBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7U0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDO0VBQUEsQ0FBQyxDQUFDOzs7QUFHbEQsRUFBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1NBQUssQ0FBQyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQUEsQ0FBQyxDQUFDO0NBQzdDLENBQUM7OztBQ2ZGLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7O0FBRzVCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxJQUFnQixFQUFFO0tBQWpCLGNBQWMsR0FBZixJQUFnQixDQUFmLGNBQWM7O0FBRXpDLEtBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDeEMsZ0JBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRWxELEtBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEQsWUFBVyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDNUIsWUFBVyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7U0FBTSxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7RUFBQSxDQUFDLENBQUM7QUFDdkUsWUFBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUMzRCxnQkFBZSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFekMsVUFBUyxNQUFNLENBQUMsRUFBRSxFQUFFO0FBQ25CLGlCQUFlLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztFQUM5Qzs7QUFFRCxVQUFTLGlCQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLEVBQUU7QUFDcEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoRCxRQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN4QixRQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2QixRQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDZixTQUFPLE1BQU0sQ0FBQztFQUNkOztBQUVELGtCQUFpQixDQUFDLE9BQU8sRUFBRTtTQUFNLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztFQUFBLENBQUMsQ0FBQztBQUNsRixrQkFBaUIsQ0FBQyxXQUFXLEVBQUU7U0FBTSxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztFQUFBLENBQUMsQ0FBQztBQUMzRixnQkFBZSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDO1NBQUssQ0FBQyxDQUFDLFlBQVksR0FBRyxJQUFJO0VBQUEsQ0FBQyxDQUFDOztBQUUxRCxlQUFjLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUU1QyxPQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO0FBQ3JELE9BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztDQUMvQixDQUFDOzs7Ozs7Ozs7Ozs7O0FDaENGLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFakMsTUFBTSxDQUFDLENBQUMsR0FBRyxVQUFBLElBQUk7UUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztDQUFBLENBQUM7QUFDaEQsTUFBTSxDQUFDLEVBQUUsR0FBRyxVQUFBLElBQUk7cUNBQVEsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQztDQUFDLENBQUM7O0FBRXpELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQUUsUUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFFO0NBQUMsQ0FBQztBQUN2RSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxVQUFTLElBQUksRUFBRTtBQUFFLHFDQUFXLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRztDQUFDLENBQUM7O0FBRWhGLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEdBQUcsVUFBVSxJQUFJLEVBQUUsRUFBRSxFQUFFO0FBQ25ELEtBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBUyxDQUFDOzs7QUFHNUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckIsS0FBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNoQyxRQUFPLElBQUksQ0FBQztDQUNaLENBQUM7O0FBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBWTtBQUNwQyxLQUFNLEtBQUssZ0NBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUMsQ0FBQztBQUM1QyxLQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFFBQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDM0IsQ0FBQzs7QUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBSSxFQUFFLEVBQUUsRUFBRTs7O0FBQ3JELEtBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU87QUFDMUIsS0FBSSxFQUFFLEVBQUU7QUFDUCxNQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQ25DLE1BQU07QUFDTixNQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7VUFBSSxNQUFLLG1CQUFtQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7R0FBQSxDQUFDLENBQUM7RUFDL0Q7QUFDRCxLQUFJLENBQUMsT0FBTyxVQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsUUFBTyxJQUFJLENBQUM7Q0FDWixDQUFDOztBQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsVUFBVSxJQUFJLEVBQUUsRUFBRSxFQUFFO0FBQ3ZELEtBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUMvQixJQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQ3RCLENBQUMsQ0FBQztBQUNILFFBQU8sSUFBSSxDQUFDO0NBQ1osQ0FBQzs7QUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxZQUFZO0FBQ3ZDLEtBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFFBQU8sSUFBSSxDQUFDO0NBQ1osQ0FBQzs7QUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFrQjttQ0FBTCxHQUFHO0FBQUgsS0FBRzs7O0FBQzVDLEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoRCxRQUFPLElBQUksQ0FBQztDQUNaLENBQUM7O0FBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsWUFBa0I7b0NBQUwsR0FBRztBQUFILEtBQUc7OztBQUN4QyxLQUFJLENBQUMsV0FBVyxDQUNmLFFBQVEsQ0FDTixXQUFXLEVBQUUsQ0FDYix3QkFBd0IsQ0FDeEIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDZCxDQUNGLENBQUM7QUFDRixRQUFPLElBQUksQ0FBQztDQUNaLENBQUM7O0FBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsWUFBWTtBQUNsQyxRQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDekQsUUFBTyxJQUFJLENBQUM7Q0FDWixDQUFDOztBQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVUsS0FBSyxFQUFFO0FBQ3JDLFVBQVMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDdkIsTUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUU7QUFDMUIsT0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxDQUFDLEVBQUU7QUFDckQsV0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2hCO0dBQ0Q7QUFDRCxTQUFPLENBQUMsQ0FBQztFQUNUO0FBQ0QsTUFBSyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUU7QUFDcEIsTUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25DO0FBQ0QsUUFBTyxJQUFJLENBQUM7Q0FDWixDQUFDOztBQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVUsSUFBSSxFQUFlO0tBQWIsTUFBTSx5REFBRyxFQUFFOztBQUNoRCxLQUFJLENBQUMsYUFBYSxDQUFDLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEQsUUFBTyxJQUFJLENBQUM7Q0FDWixDQUFDOztBQUVGLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNoQixJQUFJLENBQUMsR0FBRyxHQUFHO1FBQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7Q0FBQSxDQUFDO0FBQy9DLElBQUksQ0FBQyxFQUFFLEdBQUc7UUFBTSxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztDQUFBLENBQUM7QUFDN0MsSUFBSSxDQUFDLENBQUMsR0FBRztRQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDO0NBQUEsQ0FBQztBQUMzQyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQUEsSUFBSTtRQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDO0NBQUEsQ0FBQztBQUNsRCxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQUEsSUFBSTtRQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FBQSxDQUFDO0FBQ3RGLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBQSxJQUFJO1FBQUksUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQztDQUFBLENBQUM7O0FBRTFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOzs7QUNwR25CLFlBQVksQ0FBQzs7Ozs7Ozs7QUFFYixPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM1QixJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN0RCxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDO0FBQ3BELElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixJQUFNLHNCQUFzQixHQUFHLHVCQUF1QixDQUFDOzs7O0FBSXZELElBQUksTUFBTSxDQUFDO0FBQ1gsSUFBSSxZQUFZLENBQUM7O0FBRWpCLFNBQVMsV0FBVyxDQUFDLElBQThDLEVBQUU7S0FBL0MsWUFBWSxHQUFiLElBQThDLENBQTdDLFlBQVk7S0FBRSxjQUFjLEdBQTdCLElBQThDLENBQS9CLGNBQWM7S0FBRSxjQUFjLEdBQTdDLElBQThDLENBQWYsY0FBYzs7QUFFakUsS0FBSSxNQUFNLEVBQUU7QUFDWCxRQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7RUFDakI7O0FBRUQsUUFBTyxhQUFZLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN2QyxRQUFNLEdBQUcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsWUFBWSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUEsQ0FDaEcsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNqQixPQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssZ0JBQWdCLEVBQUU7QUFDaEMsVUFBTSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLENBQUM7SUFDbEUsTUFBTTtBQUNOLFVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWO0dBQ0QsQ0FBQyxDQUNELEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7RUFDdEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFBLEVBQUUsRUFBSTtNQUVMLFVBQVU7QUFDSixZQUROLFVBQVUsQ0FDSCxVQUFVLEVBQUU7MEJBRG5CLFVBQVU7O0FBRWQsUUFBTSxFQUFFLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUM5QixRQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdkIsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDN0I7O2dCQVBJLFVBQVU7O1dBU04sbUJBQUMsUUFBUSxFQUFFO0FBQ25CLFNBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2pDOzs7V0FFTyxrQkFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUM5QixhQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFDLENBQUMsQ0FBQztLQUM1Qjs7O1dBRWtCLDZCQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7OztBQUMvQixTQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7YUFBSSxNQUFLLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztNQUFBLENBQUMsQ0FBQztLQUMvRDs7Ozs7V0FHVyxzQkFBQyxDQUFDLEVBQUU7QUFDZixZQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFNBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDekM7Ozs7O1dBR2lCLDhCQUFHO0FBQ3BCLFlBQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUNuRCxTQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDekM7OztVQS9CSSxVQUFVOzs7QUFpQ2hCLE1BQUksSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFNUMsU0FBTyxhQUFZLFVBQVUsT0FBTyxFQUFFO0FBQ3JDLE9BQUksY0FBYyxFQUFFO0FBQ25CLFdBQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEMsa0JBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNDLFVBQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFVBQUEsUUFBUSxFQUFJO0FBQ25DLFlBQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZELFNBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDekIsQ0FBQyxDQUFDO0lBQ0gsTUFBTTtBQUNOLFdBQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDcEMsVUFBTSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxJQUFJLEVBQUk7QUFDekQsWUFBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDM0QsU0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoQyxDQUFDLENBQUM7QUFDSCxVQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxVQUFBLFFBQVEsRUFBSTtBQUNuQyxZQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2RCxTQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3pCLENBQUMsQ0FBQztJQUNIO0FBQ0QsVUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ2QsQ0FBQyxDQUFDO0VBQ0gsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFBLElBQUksRUFBSTs7QUFFYixnQkFBYyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFDLEtBQW1CO09BQVQsT0FBTyxHQUFqQixLQUFtQixDQUFsQixNQUFNLENBQUcsT0FBTztVQUFRLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQztHQUFBLENBQUMsQ0FBQztBQUMzRyxnQkFBYyxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtVQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7R0FBQSxDQUFDLENBQUM7QUFDeEYsTUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQSxLQUFLO1VBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQyw0QkFBMEIsS0FBSyxRQUFLLEVBQUMsQ0FBQztHQUFBLENBQUMsQ0FBQztBQUN6SSxNQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRTtVQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUM7R0FBQSxDQUFDLENBQUM7OztBQUc3RSxRQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLENBQUMsRUFBSTs7O0FBR3ZCLE9BQUksQ0FBQyxDQUFDLElBQUksS0FBSyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLGlEQUFpRCxFQUFFOzs7QUFHckcsV0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQzFDLE1BQU07QUFDTixXQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2YsVUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pCLGdCQUFZLENBQUMsU0FBUyxHQUFNLENBQUMsQ0FBQyxJQUFJLFVBQUssQ0FBQyxDQUFDLE9BQU8sQUFBRSxDQUFDO0FBQ25ELGdCQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QyxnQkFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEM7R0FDRCxDQUFDLENBQUM7O0FBRUgsUUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQSxZQUFZOzs7QUFDckMsYUFBVSxDQUFDLFlBQU07QUFDaEIsUUFBSSxDQUFDLE9BQUssU0FBUyxFQUFFO0FBQ3BCLFlBQUssU0FBUyxFQUFFLENBQUM7S0FDakI7SUFDRCxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQ1QsQ0FBQSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ2hCLENBQUMsQ0FBQztDQUNIOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFjLEVBQUU7S0FBZixZQUFZLEdBQWIsS0FBYyxDQUFiLFlBQVk7O0FBRXZDLFFBQU8sVUFBVSxLQUFnQixFQUFFO01BQWpCLGNBQWMsR0FBZixLQUFnQixDQUFmLGNBQWM7O0FBRS9CLGlCQUFlLENBQUMsaUJBQWlCLENBQUMscUJBQXFCLEVBQUUsWUFBWTtBQUNwRSxjQUFXLENBQUM7QUFDWCxnQkFBWSxFQUFaLFlBQVk7QUFDWixrQkFBYyxFQUFFLElBQUk7QUFDcEIsa0JBQWMsRUFBZCxjQUFjO0lBQ2QsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ2IsZ0JBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLGdCQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwQyxnQkFBWSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7SUFDdEMsQ0FBQyxTQUFNLENBQUMsVUFBQSxDQUFDLEVBQUk7QUFDYixnQkFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkMsZ0JBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLGdCQUFZLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDbkMsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUM7R0FDSCxDQUFDLENBQUM7O0FBRUgsaUJBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZO0FBQ2hFLGNBQVcsQ0FBQztBQUNYLGdCQUFZLEVBQVosWUFBWTtBQUNaLGtCQUFjLEVBQUUsS0FBSztBQUNyQixrQkFBYyxFQUFkLGNBQWM7SUFDZCxDQUFDLENBQ0QsSUFBSSxDQUFDLFlBQU07QUFDWCxnQkFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckMsZ0JBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BDLGdCQUFZLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztJQUN0QyxDQUFDLFNBQU0sQ0FBQyxVQUFBLENBQUMsRUFBSTtBQUNiLGdCQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QyxnQkFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEMsZ0JBQVksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNuQyxXQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLENBQUMsQ0FBQztHQUNILENBQUMsQ0FBQzs7QUFFSCxjQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNqQyxpQkFBZSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNyQyxjQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxjQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxjQUFZLENBQUMsU0FBUyxHQUFHLGVBQWUsQ0FBQzs7OztBQUl6QyxNQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQ2xDLGlCQUFjLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3QyxjQUFXLENBQUM7QUFDWCxnQkFBWSxFQUFaLFlBQVk7QUFDWixrQkFBYyxFQUFFLEtBQUs7QUFDckIsa0JBQWMsRUFBZCxjQUFjO0lBQ2QsQ0FBQyxDQUNELElBQUksQ0FBQyxZQUFNO0FBQ1gsZ0JBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLGdCQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwQyxnQkFBWSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7SUFDdEMsQ0FBQyxTQUFNLENBQUMsVUFBQSxDQUFDLEVBQUk7QUFDYixnQkFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkMsZ0JBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xDLGdCQUFZLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDbkMsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUM7R0FDSDtFQUNELENBQUM7Q0FDRixDQUFDOzs7Ozs7O0FDN0xGLElBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsSUFBTSxTQUFTLEdBQUk7QUFDbEIsTUFBSyxveEdBeURHO0FBQ1IsWUFBVywwTEFPTjtDQUNMLENBQUM7O0FBRUYsSUFBSSxDQUFDLFlBQUEsQ0FBQzs7OztBQUlOLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDaEIsTUFBSyxFQUFBLGlCQUFHO0FBQ1AsY0FBWSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUMxQjtBQUNELE9BQU0sMkJBQUU7Ozs7QUFDUCxTQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUvQixpQkFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXRDLGVBQVUsQ0FBQzthQUFNLFlBQVksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQzdDLGdCQUFTLEVBQUUsV0FBVztPQUN0QixDQUFDO01BQUEsRUFBRSxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FBR1QsaUJBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzs7Ozs7Ozs7RUFFeEQsQ0FBQTtBQUNELFNBQVEsRUFBQSxvQkFBRzs7QUFFVixlQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsTUFBSSxZQUFZLEVBQUU7QUFDakIsZUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzFCLGVBQVksR0FBRyxTQUFTLENBQUM7R0FDekI7RUFDRDtDQUNELENBQUM7Ozs7Ozs7QUNuR0YsSUFBSSxZQUFZLENBQUM7Ozs7QUFLakIsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNoQixNQUFLLEVBQUEsaUJBQUc7QUFDUCxjQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUM3QixVQUFPLEVBQUUsTUFBTTtBQUNmLFFBQUssRUFBRSxNQUFNO0FBQ2IsU0FBTSxFQUFFLE1BQU07QUFDZCxvQkFBaUIsRUFBRSxRQUFRO0FBQzNCLGdCQUFhLEVBQUUsUUFBUTtBQUN2QixXQUFRLEVBQUUsUUFBUTtHQUNsQixDQUFDLENBQUM7RUFDSDtBQUNELE9BQU0sMkJBQUU7Ozs7OztBQUdQLFNBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRS9CLGlCQUFZLENBQUMsS0FBSyxFQUFFLENBQ25CLE9BQU8sMEhBQTBILENBQUM7Ozs7OztBQUduSSxpQkFBWSxDQUFDLEtBQUssRUFBRSxDQUNuQixPQUFPLHNDQUFzQyxDQUFDOzs7Ozs7Ozs7RUFFL0MsQ0FBQTtBQUNELFNBQVEsRUFBQSxvQkFBRztBQUNWLE1BQUksWUFBWSxFQUFFO0FBQ2pCLGVBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMxQixlQUFZLEdBQUcsU0FBUyxDQUFDO0dBQ3pCO0VBQ0Q7Q0FDRCxDQUFDOzs7Ozs7Ozs7QUNuQ0YsSUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixJQUFNLE9BQU8sR0FBRztBQUNmLFFBQU8sZy9HQWFOO0NBQ0QsQ0FBQztBQUNGLElBQUksQ0FBQyxZQUFBLENBQUM7Ozs7QUFJTixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2hCLE1BQUssRUFBQSxpQkFBRztBQUNQLGNBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7RUFDMUI7QUFDRCxPQUFNLDJCQUFFO01BR0gsQ0FBQyxFQUNELEdBQUcsRUFnQ0QsQ0FBQyxFQUtELEtBQUs7Ozs7QUF4Q1gsU0FBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFM0IsTUFBQyxHQUFHLENBQUM7QUFDTCxRQUFHLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7O0FBQ3ZDLGlCQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLE1BQUMsR0FBRyxXQUFXLENBQUMsWUFBTTtBQUNyQixTQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsNEJBQTRCLEdBQUcsa0NBQWtDLENBQUMsQ0FBQztNQUMvRixFQUFFLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7QUFJUixrQkFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLFFBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ25CLE1BQUMsR0FBRyxXQUFXLENBQUMsWUFBTTtBQUNyQixTQUFHLENBQUMsT0FBTyxDQUFDLHlFQUF5RSxDQUFDLENBQUM7TUFDdkYsRUFBRSxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FBR1Isa0JBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixpQkFBWSxDQUFDLFNBQVMsR0FBRyxrQ0FBa0MsQ0FBQzs7Ozs7O0FBRzVELGlCQUFZLENBQUMsU0FBUyxpdUJBV3JCLENBQUM7O0FBRUksTUFBQyxHQUFHLFVBQVM7O0FBQ25CLGlCQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7YUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztNQUFBLENBQUMsQ0FBQzs7QUFFakYsaUJBQVksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUU1RCxVQUFLLEdBQUcsQ0FBQyxDQUFDLCtCQUErQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUc7O0FBRTFELE1BQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFLO0FBQ3hCLFVBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQ3pDLFFBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxrQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUEsR0FBRSxLQUFLLFlBQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUEsR0FBRSxLQUFLLFFBQUssQ0FBQztNQUMzRyxDQUFDLENBQUM7Ozs7Ozs7QUFJSCxNQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLEVBQUU7YUFBSyxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQy9CLGdCQUFTLFlBQVk7QUFDckIsaUJBQVUscUJBQXFCO09BQy9CLENBQUM7TUFBQSxDQUFDLENBQUM7Ozs7OztBQUdKLGlCQUFZLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7Ozs7OztBQUd6QyxpQkFBWSxDQUFDLFNBQVMsa3RCQVNULENBQUM7Ozs7OztBQUdkLGlCQUFZLENBQUMsU0FBUyxHQUFHLCtCQUErQixHQUNsRCwrQkFBK0IsR0FDL0IsK0JBQStCLEdBQy9CLCtCQUErQixHQUMvQiwrQkFBK0IsR0FDL0IsK0JBQStCLEdBQy9CLCtCQUErQixHQUMvQiwrQkFBK0IsR0FDL0IsK0JBQStCLENBQUM7Ozs7Ozs7OztFQUd0QyxDQUFBO0FBQ0QsU0FBUSxFQUFBLG9CQUFHOztBQUVWLGVBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixNQUFJLFlBQVksRUFBRTtBQUNqQixlQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDMUIsZUFBWSxHQUFHLFNBQVMsQ0FBQztHQUN6QjtFQUNEO0NBQ0QsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3BIRixJQUFJLFlBQVksWUFBQSxDQUFDO0FBQ2pCLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFbEMsSUFBTSxTQUFTLEdBQUc7QUFDakIsUUFBTyw0a0NBc0JDOztBQUVSLGFBQVksRUFDWCxzQkFBQSxDQUFDO3VKQUNnRixDQUFDO0VBQzNFO0NBQ1IsQ0FBQzs7QUFFRixJQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osSUFBSSxHQUFHLFlBQUEsQ0FBQzs7OztBQUlSLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDaEIsTUFBSyxFQUFBLGlCQUFHO0FBQ1AsY0FBWSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixNQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixHQUFDLFNBQVMsT0FBTyxHQUFHO0FBQ25CLFFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsSUFBQyxJQUFJLEVBQUUsQ0FBQztBQUNSLE1BQUcsR0FBRyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNyQyxDQUFBLEVBQUcsQ0FBQztFQUNMO0FBQ0QsT0FBTSwyQkFBRTtpQkFHRSxvQkFBb0IsRUFZekIsaUJBQWlCLEVBQ2YsZUFBZSxFQU9YLGlCQUFpQixFQXFHakIsYUFBYSxFQW1CakIsWUFBWSxFQU9kLFlBQVksRUFDVixhQUFhLEVBZ0NiLGVBQWUsdUZBT1osQ0FBQzs7Ozs7QUFsRUEsa0JBQWEsWUFBYixhQUFhO1VBS2xCLE9BQU87Ozs7O2dCQUhMLGVBQWUsRUFBRTs7OztnQkFDakIsZUFBZSxFQUFFOzs7QUFFbkIsZ0JBQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFOztBQUN4QixnQkFBTyxDQUFDLFNBQVMsb1NBSVYsQ0FBQzs7QUFFUixVQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O2dCQUN0QyxPQUFPOzs7Ozs7Ozs7QUFsSEosc0JBQWlCLFlBQWpCLGlCQUFpQixDQUFFLElBSzVCO1VBSkEsRUFBRSxHQUQwQixJQUs1QixDQUpBLEVBQUU7VUFDRixlQUFlLEdBRmEsSUFLNUIsQ0FIQSxlQUFlO1VBQ2YsUUFBUSxHQUhvQixJQUs1QixDQUZBLFFBQVE7VUFDUixJQUFJLEdBSndCLElBSzVCLENBREEsSUFBSTtVQUVBLFlBQVksRUFrRFAsU0FBUyxFQUtULGdCQUFnQjs7OztBQUFoQix5QkFBZ0IsWUFBaEIsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFO0FBQzVCLHVDQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxHQUFFLE9BQU8sQ0FBQyxVQUFBLEVBQUUsRUFBSztBQUNqQyxhQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsY0FBWSxDQUFDLEdBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLFVBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxNQUFHLENBQUM7V0FDckYsQ0FBQyxDQUFDO1VBQ0g7O0FBVFEsa0JBQVMsWUFBVCxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ3JCLFdBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsa0JBQWdCLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxZQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxrQkFBYSxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sVUFBSyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sTUFBRyxDQUFDO1VBQ3ZNOztBQXBERyxxQkFBWSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLEVBQUk7QUFDNUMsY0FBSSxNQUFNLEdBQUc7QUFDWixhQUFFLEVBQUYsRUFBRTtBQUNGLDRCQUFpQixFQUFFLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRTtXQUM3QyxDQUFDO0FBQ0YsaUJBQU8sTUFBTSxDQUFDO1VBQ2QsQ0FBQzs7O0FBR0YscUJBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDLEVBQUk7Ozs7QUFJekIsdUNBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEdBQUUsT0FBTyxDQUFDLFVBQUEsRUFBRSxFQUFLO0FBQ2pDLGVBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQ3hDLGVBQUksZ0JBQWdCLEdBQUc7QUFDdEIsYUFBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLElBQUk7QUFDdkMsYUFBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEdBQUc7WUFDckMsQ0FBQztBQUNGLGFBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFNLGdCQUFnQixDQUFDLENBQUMsV0FBTSxnQkFBZ0IsQ0FBQyxDQUFDLE9BQUksQ0FBQztXQUM3RSxDQUFDLENBQUM7VUFDSCxDQUFDLENBQUM7OztBQUdILDZCQUFvQixDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7OztBQUV0QyxXQUFFLENBQUMscUJBQXFCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO2lCQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUU7VUFBQSxDQUFDLENBQUM7OztBQUd2RCxXQUFFLEVBQUUsQ0FBQzs7O0FBR0wsNkJBQW9CLENBQUMsZUFBZSxDQUFDLENBQUM7Ozs7O0FBRXRDLFdBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7aUJBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRTtVQUFBLENBQUMsQ0FBQzs7O0FBR3ZELHFCQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxFQUFJO0FBQ3pCLFdBQUMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQy9DLFdBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDN0IsV0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztBQUNyQyxXQUFDLENBQUMsWUFBWSxHQUFHO0FBQ2hCLGlCQUFNLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU07QUFDM0QsaUJBQU0sRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSztBQUN6RCxrQkFBTyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJO0FBQ3hELGtCQUFPLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUc7V0FDdEQsQ0FBQztVQUNGLENBQUMsQ0FBQzs7Ozs7QUFlSCxxQkFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7Ozs7OztBQUloQyxxQkFBWSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOzs7Ozs7O0FBSXZDLGtCQUFRLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxFQUFJO0FBQ2pDLGlCQUFPLGFBQVksVUFBQSxPQUFPLEVBQUk7QUFDN0IsZUFBSSxLQUFLLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBQyxZQUFZLENBQUUsQ0FDL0IsRUFBRSxDQUFFO0FBQ0osa0JBQU0sRUFBRSxDQUFDO0FBQ1Qsa0JBQU0sRUFBRSxDQUFDO0FBQ1QsbUJBQU8sRUFBRSxDQUFDO0FBQ1YsbUJBQU8sRUFBRSxDQUFDO1lBQ1YsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFFLENBQ2hCLE1BQU0sQ0FBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUUsQ0FDcEMsUUFBUSxDQUFFLFlBQVk7QUFDdEIsYUFBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNwQyxhQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3BDLGFBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDdEMsYUFBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN0QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2IsNEJBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQyxDQUNELFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FDbkIsS0FBSyxFQUFFLENBQUM7V0FDVixDQUFDLENBQUM7VUFDSCxDQUFDLENBQUMsQ0FDRixJQUFJLENBQUMsUUFBUSxJQUFJLFlBQVksRUFBRSxDQUFDLENBQUM7Ozs7Ozs7OztBQXRIMUIseUJBQW9CLFlBQXBCLG9CQUFvQixDQUFDLEdBQUcsRUFBRTtBQUNsQyxTQUFHLENBQUMsT0FBTyxDQUFDLFVBQUEsRUFBRSxFQUFJO0FBQ2pCLFdBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQzVDLFdBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BDLHlCQUFrQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN2RCx5QkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFLLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFLLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxBQUFFLENBQUM7QUFDbkcseUJBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBSyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsVUFBSyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQUFBRSxDQUFDO0FBQ3ZHLHlCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuQyxRQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztPQUN0RCxDQUFDLENBQUM7TUFDSDs7a0JBVVMsaUJBQWlCLEVBcUdqQixhQUFhOztBQTNIdkIsU0FBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFjM0Isc0JBQWlCLEdBQUcsQ0FBQzs7QUFDbkIsb0JBQWUsR0FBRyxTQUFsQixlQUFlLEdBQVM7QUFDN0IsVUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0FBQ3RGLGtCQUFZLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ2xFLGFBQU8sZUFBZSxDQUFDO01BQ3ZCOzs7QUF5SEQsaUJBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUxQyxpQkFBWSxHQUFHLGFBQWEsRUFBRTs7QUFDcEMsWUFBTyxHQUFHLFdBQVcsQ0FBQzthQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUU7TUFBQSxFQUFFLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFHdkQsa0JBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QixpQkFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTVDLGlCQUFZLEdBQUcsSUFBSTtBQUNqQixrQkFBYSxHQUFHLGFBQWEsRUFBRTs7QUFDckMsTUFBQyxTQUFTLFNBQVMsR0FBRztBQUNyQixVQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsVUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUM7QUFDekMsU0FBRSxFQUFFLGNBQU07QUFDVCxhQUFLLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztBQUNuQyxZQUFJLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDbkM7QUFDRCxzQkFBZSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsOEJBQThCLENBQUM7QUFDaEUsV0FBSSxFQUFFLElBQUk7QUFDVixlQUFRLEVBQUUsb0JBQU07QUFDZixZQUFJLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ3BCLG1CQUFVLEVBQUUsbUJBQW1CO0FBQy9CLGdCQUFPLEVBQUUsQ0FBQztTQUNWLENBQUMsQ0FBQztBQUNILFlBQUksWUFBWSxFQUFFLFNBQVMsRUFBRSxDQUFDO1FBQzlCO09BQ0QsQ0FBQyxDQUFDOzs7Ozs7OztBQUdILHlDQUFjLGVBQWUsNEdBQUM7WUFBckIsQ0FBQztRQUFzQjs7Ozs7Ozs7Ozs7Ozs7O01BQ2hDLENBQUEsRUFBRyxDQUFDOzs7Ozs7OztBQUtMLGlCQUFZLEdBQUcsS0FBSyxDQUFDOzs7OztBQUtyQixpQkFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUMsb0JBQWUsR0FBRyxpQkFBaUIsQ0FBQztBQUN6QyxRQUFFLEVBQUUsZUFBZTtBQUNuQixxQkFBZSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsOEJBQThCLENBQUM7QUFDaEUsVUFBSSxFQUFFLElBQUk7TUFDVixDQUFDOzs7OzsrQkFHWSxlQUFlOzs7Ozs7OztBQUFwQixNQUFDOztZQUEyQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUV0QyxDQUFBO0FBQ0QsU0FBUSxFQUFBLG9CQUFHO0FBQ1YsZUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLHNCQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLE1BQUksWUFBWSxFQUFFO0FBQ2pCLGVBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMxQixlQUFZLEdBQUcsU0FBUyxDQUFDO0dBQ3pCO0VBQ0Q7Q0FDRCxDQUFDOzs7Ozs7Ozs7Ozs7O0FDMVBGLElBQUksWUFBWSxDQUFDOzs7O0FBS2pCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDaEIsTUFBSyxFQUFBLGlCQUFHO0FBQ1AsY0FBWSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUMxQjtBQUNELE9BQU0sMkJBQUU7Ozs7OztBQUdQLFNBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRS9CLGlCQUFZLENBQUMsS0FBSyxFQUFFLENBQ25CLE9BQU8sc0VBQWtFLENBQUM7Ozs7OztBQUczRSxpQkFBWSxDQUFDLEtBQUssRUFBRSxDQUNuQixPQUFPLHNFQUFrRSxDQUFDOzs7Ozs7QUFHM0UsaUJBQVksQ0FBQyxLQUFLLEVBQUUsQ0FDbkIsT0FBTyx1RUFBbUUsQ0FBQzs7Ozs7O0FBRzVFLGlCQUFZLENBQUMsS0FBSyxFQUFFLENBQ25CLE9BQU8seUZBQXFGLENBQUM7Ozs7Ozs7OztFQUU5RixDQUFBO0FBQ0QsU0FBUSxFQUFBLG9CQUFHO0FBQ1YsTUFBSSxZQUFZLEVBQUU7QUFDakIsZUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzFCLGVBQVksR0FBRyxTQUFTLENBQUM7R0FDekI7RUFDRDtDQUNELENBQUM7Ozs7Ozs7OztBQ2hDRixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2hCLFFBQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzFCLE9BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3hCLFFBQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzFCLFVBQVMsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQzlCLGVBQWMsRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDO0FBQ3hDLFNBQVEsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQzVCLFFBQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzFCLGdCQUFlLEVBQUUsT0FBTyxDQUFDLGdCQUFnQixDQUFDO0NBQzFDLENBQUM7Ozs7Ozs7OztBQ2JGLElBQUksWUFBWSxDQUFDOztBQUVqQixJQUFJLGVBQWUsR0FBRyxtRUFVckIsQ0FBQzs7QUFFRixJQUFJLFdBQVcsR0FBRyxDQUNqQixvQkFBb0IsRUFDcEIsK0JBQStCLEVBQy9CLDhCQUE4QixFQUM5QiwyQkFBMkIsQ0FDM0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7QUFJYixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2hCLE1BQUssRUFBQSxpQkFBRztBQUNQLGNBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7RUFDMUI7QUFDRCxPQUFNLDJCQUFFO3NGQVdDLE9BQU8sRUFDUixLQUFLOzs7Ozs7O0FBVFosU0FBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFL0IsaUJBQVksQ0FBQyxXQUFXLENBQUMsOEJBQThCLENBQUMsQ0FBQzs7Ozs7O0FBR3pELGlCQUFZLENBQUMsV0FBVyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7Ozs7Ozs7Ozs4QkFHMUQsZUFBZTs7Ozs7Ozs7QUFBMUIsWUFBTztBQUNSLFVBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFOztBQUN4QixVQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7QUFDckMsVUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO0FBQzNCLFVBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUNoQyxVQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMxQyxpQkFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSWpDLGlCQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckIsaUJBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzs7Ozs7Ozs7RUFFckQsQ0FBQTtBQUNELFNBQVEsRUFBQSxvQkFBRztBQUNWLE1BQUksWUFBWSxFQUFFO0FBQ2pCLGVBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMxQixlQUFZLEdBQUcsU0FBUyxDQUFDO0dBQ3pCO0VBQ0Q7Q0FDRCxDQUFDOzs7Ozs7O0FDMURGLElBQUksWUFBWSxDQUFDOzs7O0FBS2pCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDaEIsTUFBSyxFQUFBLGlCQUFHO0FBQ1AsY0FBWSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDN0IsVUFBTyxFQUFFLE1BQU07QUFDZixRQUFLLEVBQUUsTUFBTTtBQUNiLFNBQU0sRUFBRSxNQUFNO0FBQ2Qsb0JBQWlCLEVBQUUsUUFBUTtBQUMzQixnQkFBYSxFQUFFLFFBQVE7QUFDdkIsV0FBUSxFQUFFLFFBQVE7QUFDbEIsbUJBQWdCLEVBQUUsUUFBUTtHQUMxQixDQUFDLENBQUM7RUFDSDtBQUNELE9BQU0sMkJBQUU7Ozs7OztBQUdQLFNBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRS9CLGlCQUFZLENBQ1gsT0FBTyxpTEFDeUUsQ0FBQzs7Ozs7O0FBR2xGLGlCQUFZLENBQUMsS0FBSyxFQUFFLENBQ25CLE9BQU8saUNBQWlDLENBQUM7Ozs7Ozs7OztFQUUxQyxDQUFBO0FBQ0QsU0FBUSxFQUFBLG9CQUFHO0FBQ1YsTUFBSSxZQUFZLEVBQUU7QUFDakIsZUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzFCLGVBQVksR0FBRyxTQUFTLENBQUM7R0FDekI7RUFDRDtDQUNELENBQUM7Ozs7Ozs7QUNyQ0YsSUFBSSxZQUFZLENBQUM7Ozs7QUFLakIsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNoQixNQUFLLEVBQUEsaUJBQUc7QUFDUCxjQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUM3QixXQUFRLEVBQUUsVUFBVTtBQUNwQixRQUFLLEVBQUUsTUFBTTtBQUNiLFNBQU0sRUFBRSxNQUFNO0FBQ2QsTUFBRyxFQUFFLENBQUM7QUFDTixPQUFJLEVBQUUsQ0FBQztBQUNQLGFBQVUsRUFBRSx3QkFBd0I7QUFDcEMsVUFBTyxFQUFFLE1BQU07QUFDZixnQkFBYSxFQUFFLFFBQVE7QUFDdkIsb0JBQWlCLEVBQUUsUUFBUTtBQUMzQixVQUFPLEVBQUUsQ0FBQztBQUNWLFlBQVMsRUFBRSxpQkFBaUI7QUFDNUIsYUFBVSxFQUFFLG9DQUFvQztHQUNoRCxDQUFDLENBQUM7RUFDSDtBQUNELE9BQU0sMkJBQUU7Ozs7O0FBRVAsaUJBQVksQ0FDWCxXQUFXLGtLQVFWLENBQUM7OztBQUdILFNBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7Ozs7Ozs7QUFJL0IsaUJBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQztBQUM3QyxpQkFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0VBRy9CLENBQUE7QUFDRCxTQUFRLEVBQUEsb0JBQUc7QUFDVixNQUFJLFlBQVksRUFBRTtBQUNqQixlQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDMUIsZUFBWSxHQUFHLFNBQVMsQ0FBQztHQUN6QjtFQUNEO0NBQ0QsQ0FBQzs7O0FDbkRGLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQVViLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN0QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsSUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUVsRSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDdEIsZUFBYyxFQUFkLGNBQWM7QUFDZCxRQUFPLEVBQUUsQ0FDUixPQUFPLENBQUMsNkJBQTZCLENBQUM7QUFDdEMsUUFBTyxDQUFDLHFDQUFxQyxDQUFDO0FBQzlDLFFBQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxFQUMxQyxPQUFPLENBQUMsK0NBQStDLENBQUMsRUFDeEQsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDL0MsS0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDO0VBQ25CLENBQUMsRUFDRixPQUFPLENBQUMsaUNBQWlDLENBQUMsRUFDMUMsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7QUFDM0MsY0FBWSxFQUFFO0FBQ2IsT0FBSSxFQUFFLFVBQVU7QUFDaEIsU0FBTSxFQUFFLElBQUk7QUFDWixPQUFJLEVBQUUsSUFBSTtBQUNWLFFBQUssRUFBRSxDQUFDO0FBQ1IsT0FBSSxFQUFDLFNBQVM7R0FDZDtFQUNELENBQUMsQ0FDRjtDQUNELENBQUMsQ0FBQzs7QUFFSCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssZUFBZSxFQUFFO0FBQ3hDLGVBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0NBQzdDOztBQUVELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDakMsZUFBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztDQUNsRDs7QUFHRCxJQUFJLGVBQWUsSUFBSSxTQUFTLEVBQUU7QUFDakMsVUFBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQ3ZDLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNuQixTQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUNsQyxDQUFDLFNBQU0sQ0FBQyxVQUFTLEtBQUssRUFBRTtBQUN4QixTQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixHQUFHLEtBQUssQ0FBQyxDQUFDO0VBQ3BELENBQUMsQ0FBQzs7QUFFSixLQUFJLFNBQVMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFO0FBQ3ZDLFNBQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztFQUNuQztDQUNEOzs7QUN6REQ7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7O0FDREE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTs7QUNGQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTs7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNNQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2puQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyd0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3BsdWdpbnMvdXRpbC1wb2x5ZmlsbHMnKTtcblxuY29uc3Qgc2xpZGVTZWxlY3RvciA9IHNsaWRlSWQgPT4gYC5zbGlkZVtkYXRhLXNsaWRlLWlkPVwiJHtzbGlkZUlkfVwiXSAucGFuZWwuc2xpZGUtY29udGVudCAucGFuZWwtYm9keWA7XG5cbi8vIFNldHVwIGRvY3VtZW50IGxpc3RlbmVycyBhbmQgZXZlbnQgaGFuZGxlcnNcbmZ1bmN0aW9uIEFTbGlkZShzbGlkZURhdGEsIHtwbHVnaW5zID0gW10sIHNsaWRlQ29udGFpbmVyID0gZG9jdW1lbnR9ID0ge30pIHtcblxuXHRjb25zdCBzZXR1cFNsaWRlID0gZnVuY3Rpb24gc2V0dXBTbGlkZShzbGlkZUlkKSB7XG5cblx0XHRsb2NhdGlvbi5oYXNoID0gc2xpZGVJZDtcblxuXHRcdHNsaWRlQ29udGFpbmVyLmZpcmUoJ2Etc2xpZGVzX3NsaWRlLXNldHVwJywge3NsaWRlSWR9KTtcblxuXHRcdGlmIChzbGlkZURhdGFbc2xpZGVJZF0pIHtcblx0XHRcdHNsaWRlRGF0YVtzbGlkZUlkXS5zZXR1cC5iaW5kKHNsaWRlQ29udGFpbmVyLiQoc2xpZGVTZWxlY3RvcihzbGlkZUlkKSkpKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNsaWRlRGF0YVtzbGlkZUlkXSA9IHtcblx0XHRcdFx0c2V0dXAoKSB7fSxcblx0XHRcdFx0YWN0aW9uOiBmdW5jdGlvbiogKCl7eWllbGQ7fSxcblx0XHRcdFx0dGVhcmRvd24oKSB7fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHR0aGlzLmN1cnJlbnRFdmVudHMgPSBzbGlkZURhdGFbc2xpZGVJZF0uYWN0aW9uLmJpbmQoc2xpZGVDb250YWluZXIuJChzbGlkZVNlbGVjdG9yKHNsaWRlSWQpKSkoKTtcblxuXHRcdC8vIGlmIGEgZ28gdG8gbmV3IHNsaWRlIGlzIGFscmVhZHkgdHJpZ2dlcmVkIHRoZW4gY2FuY2VsIGl0IHNvXG5cdFx0Ly8gd2UgZG9uJ3QgYWNjaWRlbnRpYWxseSBnbyB0byB0aGUgd3Jvbmcgc2xpZGUuXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMubmV4dFNsaWRlVGltZU91dCk7XG5cblx0XHQvLyBEbyBmaXJzdCBhY3Rpb25cblx0XHR0aGlzLmN1cnJlbnRFdmVudHMubmV4dCgpO1xuXHR9LmJpbmQodGhpcyk7XG5cblx0ZnVuY3Rpb24gdGVhcmRvd25TbGlkZShzbGlkZUlkKSB7XG5cblx0XHRzbGlkZUNvbnRhaW5lci5maXJlKCdhLXNsaWRlc19zbGlkZS10ZWFyZG93bicsIHtzbGlkZUlkfSk7XG5cdFx0aWYgKHNsaWRlRGF0YVtzbGlkZUlkXSkge1xuXHRcdFx0c2xpZGVEYXRhW3NsaWRlSWRdLnRlYXJkb3duLmJpbmQoc2xpZGVDb250YWluZXIuJChzbGlkZVNlbGVjdG9yKHNsaWRlSWQpKSkoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBTbGlkZSBpcyBhIGRvbSBlbGVtZW50IG9yIGFuIGludGVnZXJcblx0ZnVuY3Rpb24gZ29Ub1NsaWRlKHtzbGlkZX0pIHtcblx0XHRjb25zdCBuZXdTbGlkZSA9IHR5cGVvZiBzbGlkZSA9PT0gXCJudW1iZXJcIiA/ICQkKCcuc2xpZGUnKVtzbGlkZV0gOiBzbGlkZTtcblx0XHRpZiAoIW5ld1NsaWRlKSByZXR1cm47XG5cdFx0Y29uc3QgbmV3U2xpZGVJZCA9IG5ld1NsaWRlLmRhdGFzZXQuc2xpZGVJZDtcblx0XHRjb25zdCBvbGRTbGlkZSA9ICQoJy5zbGlkZS5hY3RpdmUnKTtcblx0XHRpZiAobmV3U2xpZGUgJiYgbmV3U2xpZGUgIT09IG9sZFNsaWRlKSB7XG5cdFx0XHRpZiAob2xkU2xpZGUpIHtcblx0XHRcdFx0b2xkU2xpZGUuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdFx0XHRcdG9sZFNsaWRlLm9uY2UoJ3RyYW5zaXRpb25lbmQnLCAoKSA9PiB0ZWFyZG93blNsaWRlKG9sZFNsaWRlLmRhdGFzZXQuc2xpZGVJZCkpO1xuXHRcdFx0fVxuXHRcdFx0bmV3U2xpZGUub2ZmKCd0cmFuc2l0aW9uZW5kJyk7XG5cdFx0XHRuZXdTbGlkZS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRcdHRlYXJkb3duU2xpZGUobmV3U2xpZGVJZCk7XG5cdFx0XHRzZXR1cFNsaWRlKG5ld1NsaWRlSWQpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdvVG9OZXh0U2xpZGUoKSB7XG5cdFx0Z29Ub1NsaWRlKHtzbGlkZTogJCgnLnNsaWRlLmFjdGl2ZScpLnByZXZBbGwoKS5sZW5ndGggKyAxfSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnb1RvUHJldlNsaWRlKCkge1xuXHRcdGdvVG9TbGlkZSh7c2xpZGU6ICQoJy5zbGlkZS5hY3RpdmUnKS5wcmV2QWxsKCkubGVuZ3RoIC0gMX0pO1xuXHR9XG5cblx0dGhpcy5jdXJyZW50RXZlbnRzID0ge1xuXHRcdG5leHQoKSB7XG5cdFx0XHRyZXR1cm4ge2RvbmU6IGZhbHNlfTtcblx0XHR9XG5cdH07XG5cblx0Ly8gZS5nLiBjbGljayBwcmVzc2VzIG5leHQgZXRjIGV0Y1xuXHRzbGlkZUNvbnRhaW5lci5vbignYS1zbGlkZXNfdHJpZ2dlci1ldmVudCcsIGZ1bmN0aW9uICgpIHtcblx0XHRpZih0aGlzLmN1cnJlbnRFdmVudHMubmV4dCgpLmRvbmUpIHtcblxuXHRcdFx0Ly8gV2FpdCBhIHNtaWRnZSBiZWZvcmUgdHJpZ2dlcmluZyB0aGUgbmV4dCBzbGlkZS5cblx0XHRcdHRoaXMubmV4dFNsaWRlVGltZU91dCA9IHNldFRpbWVvdXQoZ29Ub05leHRTbGlkZSwgMTApO1xuXHRcdH1cblx0fS5iaW5kKHRoaXMpKTtcblxuXHRzbGlkZUNvbnRhaW5lci5vbignYS1zbGlkZXNfbmV4dC1zbGlkZScsICgpID0+IGdvVG9OZXh0U2xpZGUoKSk7XG5cdHNsaWRlQ29udGFpbmVyLm9uKCdhLXNsaWRlc19wcmV2aW91cy1zbGlkZScsICgpID0+IGdvVG9QcmV2U2xpZGUoKSk7XG5cdHNsaWRlQ29udGFpbmVyLm9uKCdhLXNsaWRlc19nb3RvLXNsaWRlJywgZSA9PiBnb1RvU2xpZGUoZS5kZXRhaWwpKTtcblxuXHRwbHVnaW5zLmZvckVhY2gocGx1Z2luID0+IHtcblx0XHRpZiAodHlwZW9mIHBsdWdpbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cGx1Z2luKHtcblx0XHRcdFx0c2xpZGVEYXRhLFxuXHRcdFx0XHRzbGlkZUNvbnRhaW5lclxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFTbGlkZTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi91dGlsLXBvbHlmaWxscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh7c2xpZGVDb250YWluZXJ9KSB7XG5cdGlmIChsb2NhdGlvbi5oYXNoKSB7XG5cblx0XHRjb25zdCBzbGlkZSA9ICQoYC5zbGlkZVtkYXRhLXNsaWRlLWlkPVwiJHtsb2NhdGlvbi5oYXNoLnNsaWNlKDEpfVwiXWApO1xuXG5cdFx0Ly8gRmluZCB0aGUgc2xpZGUgdGhlIGhhc2ggdG8gc2ltdWxhdGUgZGVlcGxpbmtpbmdcblx0XHRpZiAoc2xpZGUpIHtcblx0XHRcdHNsaWRlQ29udGFpbmVyLmZpcmUoJ2Etc2xpZGVzX2dvdG8tc2xpZGUnLCB7c2xpZGV9KTtcblx0XHR9XG5cblx0XHRzbGlkZUNvbnRhaW5lci5zY3JvbGxMZWZ0ID0gMDtcblx0fSBlbHNlIHtcblx0XHRzbGlkZUNvbnRhaW5lci5maXJlKCdhLXNsaWRlc19nb3RvLXNsaWRlJywge3NsaWRlOiAwfSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vdXRpbC1wb2x5ZmlsbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoe3NsaWRlQ29udGFpbmVyfSkge1xuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBlID0+IHtcblx0XHRzd2l0Y2goZS5rZXlDb2RlKSB7XG5cblx0XHRcdC8vIExlZnQgQXJyb3dcblx0XHRcdGNhc2UgMzc6XG5cdFx0XHRcdHNsaWRlQ29udGFpbmVyLmZpcmUoJ2Etc2xpZGVzX3ByZXZpb3VzLXNsaWRlJyk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvLyBSaWdodCBBcnJvd1xuXHRcdFx0Y2FzZSAxMzpcblx0XHRcdGNhc2UgMzk6XG5cdFx0XHRcdHNsaWRlQ29udGFpbmVyLmZpcmUoJ2Etc2xpZGVzX3RyaWdnZXItZXZlbnQnKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjc6XG5cdFx0XHRcdHNsaWRlQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3ByZXNlbnRhdGlvbicpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH0pO1xuXG5cdHNsaWRlQ29udGFpbmVyLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmZpcmUoJ2Etc2xpZGVzX3RyaWdnZXItZXZlbnQnKTtcblx0fSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3V0aWwtcG9seWZpbGxzJyk7XG5cbmNvbnN0IEhhbW1lciA9IHJlcXVpcmUoJ2hhbW1lcmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG5cdHJldHVybiBmdW5jdGlvbiAoe3NsaWRlQ29udGFpbmVyfSkge1xuXG5cdFx0Y29uc3QgdG91Y2hlcyA9IG5ldyBIYW1tZXIoc2xpZGVDb250YWluZXIpO1xuXHRcdHRvdWNoZXMuc2V0KHsgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0hPUklaT05UQUwgfSk7XG5cblx0XHRpZiAoY29uZmlnLnVzZS5pbmRleE9mKCdzd2lwZS1mb3J3YXJkJykgIT09IC0xKSB7XG5cdFx0XHR0b3VjaGVzLm9uKCdzd2lwZWxlZnQnLCAoKSA9PiBzbGlkZUNvbnRhaW5lci5maXJlKCdhLXNsaWRlc19uZXh0LXNsaWRlJykpO1xuXHRcdH1cblxuXHRcdGlmIChjb25maWcudXNlLmluZGV4T2YoJ3N3aXBlLWJhY2snKSAhPT0gLTEpIHtcblx0XHRcdHRvdWNoZXMub24oJ3N3aXBlcmlnaHQnLCAoKSA9PiBzbGlkZUNvbnRhaW5lci5maXJlKCdhLXNsaWRlc19wcmV2aW91cy1zbGlkZScpKTtcdFxuXHRcdH1cblx0fTtcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi91dGlsLXBvbHlmaWxscycpO1xuXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcblxuLy8gUmVuZGVyIHRoZSBzbGlkZXMgbWFya2Rvd24uXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0Y29uc3QgbSA9IG5ldyBNYXAoKTtcblxuXHQvLyBzdG9yZSBhbGwgb2YgdGhlIGlubmVySFRNTHNcblx0JCQoJy5tYXJrZWQnKS5mb3JFYWNoKG8gPT4gbS5zZXQobywgby5pbm5lckhUTUwpKTtcblxuXHQvLyB0aGVuIHdyaXRlIHRoZW0gYWxsIG91dFxuXHRtLmZvckVhY2goKHYsIGspID0+IGsuaW5uZXJIVE1MID0gbWFya2VkKHYpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vdXRpbC1wb2x5ZmlsbHMnKTtcblxuLy8gUmVuZGVyIHRoZSBzbGlkZXMgbWFya2Rvd24uXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh7c2xpZGVDb250YWluZXJ9KSB7XG5cdFxuXHRsZXQgc2xpZGVDb250cm9sbGVyID0gd2luZG93Lm1ha2UuZGl2KCk7XG5cdHNsaWRlQ29udHJvbGxlci5jbGFzc0xpc3QuYWRkKCdzbGlkZS1jb250cm9sbGVyJyk7XG5cblx0Y29uc3QgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG5cdGNsb3NlQnV0dG9uLmlubmVySFRNTCA9ICfDlyc7XG5cdGNsb3NlQnV0dG9uLm9uKCdjbGljaycsICgpID0+IHNsaWRlQ29udHJvbGxlci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSk7XG5cdGNsb3NlQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3NsaWRlLWNvbnRyb2xsZXJfY2xvc2UtYnV0dG9uJyk7XG5cdHNsaWRlQ29udHJvbGxlci5hcHBlbmRDaGlsZChjbG9zZUJ1dHRvbik7XG5cblx0ZnVuY3Rpb24gYXBwZW5kKGVsKSB7XG5cdFx0c2xpZGVDb250cm9sbGVyLmluc2VydEJlZm9yZShlbCwgY2xvc2VCdXR0b24pO1xuXHR9XG5cblx0ZnVuY3Rpb24gbWFrZUFuZEJpbmRCdXR0b24odGV4dCwgZm4pIHtcblx0XHRjb25zdCBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcblx0XHRidXR0b24uaW5uZXJIVE1MID0gdGV4dDtcblx0XHRidXR0b24ub24oJ2NsaWNrJywgZm4pO1xuXHRcdGFwcGVuZChidXR0b24pO1xuXHRcdHJldHVybiBidXR0b247XG5cdH1cblxuXHRtYWtlQW5kQmluZEJ1dHRvbignQmVnaW4nLCAoKSA9PiBzbGlkZUNvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKCdwcmVzZW50YXRpb24nKSk7XG5cdG1ha2VBbmRCaW5kQnV0dG9uKCdUaHVtYm5haWwnLCAoKSA9PiBzbGlkZUNvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKCdoaWRlLXByZXNlbnRhdGlvbicpKTtcblx0c2xpZGVDb250cm9sbGVyLm9uKCdjbGljaycsIChlKSA9PiBlLmNhbmNlbEJ1YmJsZSA9IHRydWUpO1xuXG5cdHNsaWRlQ29udGFpbmVyLmFwcGVuZENoaWxkKHNsaWRlQ29udHJvbGxlcik7XG5cblx0bW9kdWxlLmV4cG9ydHMubWFrZUFuZEJpbmRCdXR0b24gPSBtYWtlQW5kQmluZEJ1dHRvbjtcblx0bW9kdWxlLmV4cG9ydHMuYXBwZW5kID0gYXBwZW5kO1xufTtcbiIsIi8qKlxuICogUG9seWZpbGwgc29tZSB1dGlsaXR5IGZ1bmN0aW9ucy5cbiAqL1xuXG5jb25zdCBtYXJrZWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcblxud2luZG93LiQgPSBleHByID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZXhwcik7XG53aW5kb3cuJCQgPSBleHByID0+IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGV4cHIpXTtcblxuTm9kZS5wcm90b3R5cGUuJCA9IGZ1bmN0aW9uKGV4cHIpIHsgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihleHByKSA7fTtcbk5vZGUucHJvdG90eXBlLiQkID0gZnVuY3Rpb24oZXhwcikgeyByZXR1cm4gWy4uLnRoaXMucXVlcnlTZWxlY3RvckFsbChleHByKV0gO307XG5cbk5vZGUucHJvdG90eXBlLm9uID0gd2luZG93Lm9uID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG5cdGlmICghdGhpcy5mdW5jUmVmKSB0aGlzLmZ1bmNSZWYgPSBuZXcgU2V0KCk7XG5cblx0Ly8gU3RvcmUgaXQgZm9yIGxhdGVyXG5cdHRoaXMuZnVuY1JlZi5hZGQoZm4pO1xuXHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZm4pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLnByZXZBbGwgPSBmdW5jdGlvbiAoKSB7XG5cdGNvbnN0IG5vZGVzID0gWy4uLnRoaXMucGFyZW50Tm9kZS5jaGlsZHJlbl07XG5cdGNvbnN0IHBvcyA9IG5vZGVzLmluZGV4T2YodGhpcyk7XG5cdHJldHVybiBub2Rlcy5zbGljZSgwLCBwb3MpO1xufTtcblxuTm9kZS5wcm90b3R5cGUub2ZmID0gd2luZG93Lm9mZiA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuXHRpZiAoIXRoaXMuZnVuY1JlZikgcmV0dXJuO1xuXHRpZiAoZm4pIHtcblx0XHR0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZm4pO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMuZnVuY1JlZi5mb3JFYWNoKGZuID0+IHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBmbikpO1xuXHR9XG5cdHRoaXMuZnVuY1JlZi5kZWxldGUoZm4pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLm9uY2UgPSB3aW5kb3cub25jZSA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuXHR0aGlzLm9uKG5hbWUsIGZ1bmN0aW9uIHRlbXBGKGUpIHtcblx0XHRmbi5iaW5kKHRoaXMpKGUpO1xuXHRcdHRoaXMub2ZmKG5hbWUsIHRlbXBGKTtcblx0fSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUucmVtb3ZlU2VsZiA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmFkZE1hcmtkb3duID0gZnVuY3Rpb24gKC4uLnN0cikge1xuXHR0aGlzLmFwcGVuZENoaWxkKG1ha2UubWFya2Rvd24oc3RyLmpvaW4oJ1xcbicpKSk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuTm9kZS5wcm90b3R5cGUuYWRkSFRNTCA9IGZ1bmN0aW9uICguLi5zdHIpIHtcblx0dGhpcy5hcHBlbmRDaGlsZChcblx0XHRkb2N1bWVudFxuXHRcdFx0LmNyZWF0ZVJhbmdlKClcblx0XHRcdC5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoXG5cdFx0XHRcdHN0ci5qb2luKCdcXG4nKVxuXHRcdFx0KVxuXHQpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbk5vZGUucHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24gKCkge1xuXHR3aGlsZSh0aGlzLmZpcnN0Q2hpbGQpIHRoaXMucmVtb3ZlQ2hpbGQodGhpcy5maXJzdENoaWxkKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5jc3MgPSBmdW5jdGlvbiAocHJvcHMpIHtcblx0ZnVuY3Rpb24gdW5pdHMocHJvcCwgaSkge1xuXHRcdGlmICh0eXBlb2YgaSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0aWYgKHByb3AubWF0Y2goL3dpZHRofGhlaWdodHx0b3B8bGVmdHxyaWdodHxib3R0b20vKSkge1xuXHRcdFx0XHRyZXR1cm4gaSArIFwicHhcIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGk7XG5cdH1cblx0Zm9yIChsZXQgbiBpbiBwcm9wcykge1xuXHRcdHRoaXMuc3R5bGVbbl0gPSB1bml0cyhuLCBwcm9wc1tuXSk7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKG5hbWUsIGRldGFpbCA9IHt9KSB7XG5cdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQobmFtZSwge2RldGFpbH0pKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5jb25zdCBtYWtlID0ge307XG5tYWtlLmRpdiA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xubWFrZS5iciA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJyk7XG5tYWtlLnAgPSAoKSA9PiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG5tYWtlLnRleHQgPSB0ZXh0ID0+IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xubWFrZS5tYXJrZG93biA9IHRleHQgPT4gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQobWFya2VkKHRleHQpKTtcbm1ha2UuaHRtbCA9IGh0bWwgPT4gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoaHRtbCk7XG5cbndpbmRvdy5tYWtlID0gbWFrZTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi91dGlsLXBvbHlmaWxscycpO1xuY29uc3Qgc2xpZGVDb250cm9sbGVyID0gcmVxdWlyZSgnLi9zbGlkZS1jb250cm9sbGVyJyk7XG5jb25zdCBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG5jb25zdCBQZWVyID0gcmVxdWlyZSgncGVlcmpzJyk7XG5jb25zdCBNQVNURVJfQ09OVFJPTExFUl9OQU1FID0gJ2FkYS1zbGlkZXMtY29udHJvbGxlcic7XG5cbi8vIERlZmluZSBwZWVySlMgRGV0YWlsc1xuXG52YXIgbXlQZWVyOyAvLyBQZWVyXG52YXIgd2ViUlRDU3RhdHVzOyAvLyBTdGF0dXMgYm94XG5cbmZ1bmN0aW9uIHdlYlJUQ1NldHVwKHtwZWVyU2V0dGluZ3MsIHBlZXJDb250cm9sbGVyLCBzbGlkZUNvbnRhaW5lcn0pIHtcblxuXHRpZiAobXlQZWVyKSB7XG5cdFx0bXlQZWVyLmRlc3Ryb3koKTtcblx0fVxuXG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0bXlQZWVyID0gKHBlZXJDb250cm9sbGVyID8gbmV3IFBlZXIoTUFTVEVSX0NPTlRST0xMRVJfTkFNRSwgcGVlclNldHRpbmdzKSA6IG5ldyBQZWVyKHBlZXJTZXR0aW5ncykpXG5cdFx0XHQub24oJ2Vycm9yJywgZSA9PiB7XG5cdFx0XHRcdGlmIChlLnR5cGUgPT09IFwidW5hdmFpbGFibGUtaWRcIikge1xuXHRcdFx0XHRcdHJlamVjdChFcnJvcignQ2Fubm90IHRha2UgY29udHJvbCwgY29udHJvbGxlciBhbHJlYWR5IHByZXNlbnQuJykpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlamVjdChlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5vbignb3BlbicsIHJlc29sdmUpO1xuXHR9KVxuXHQudGhlbihpZCA9PiB7XG5cblx0XHRjbGFzcyBXZWJydGNVc2VyIHtcblx0XHRcdGNvbnN0cnVjdG9yKGNvbnRyb2xsZXIpIHtcblx0XHRcdFx0Y29uc3QgZXYgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cdFx0XHRcdHRoaXMub24gPSBldi5vbi5iaW5kKHRoaXMpO1xuXHRcdFx0XHR0aGlzLmZpcmUgPSBldi5lbWl0LmJpbmQodGhpcyk7XG5cdFx0XHRcdHRoaXMuc2xpZGVDbGllbnRzID0gW107XG5cdFx0XHRcdHRoaXMuY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG5cdFx0XHR9XG5cblx0XHRcdGFkZENsaWVudChkYXRhQ29ubikge1xuXHRcdFx0XHR0aGlzLnNsaWRlQ2xpZW50cy5wdXNoKGRhdGFDb25uKTtcblx0XHRcdH1cblxuXHRcdFx0c2VuZERhdGEoZGF0YUNvbm4sIHR5cGUsIGRhdGEpIHtcblx0XHRcdFx0ZGF0YUNvbm4uc2VuZCh7dHlwZSwgZGF0YX0pO1xuXHRcdFx0fVxuXG5cdFx0XHRzZW5kU2lnbmFsVG9DbGllbnRzKHR5cGUsIGRhdGEpIHtcblx0XHRcdFx0dGhpcy5zbGlkZUNsaWVudHMuZm9yRWFjaChkYyA9PiB0aGlzLnNlbmREYXRhKGRjLCB0eXBlLCBkYXRhKSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRlbGwgYWxsIG9mIHRoZSBjbGllbnRzIHRvIG1vdmUgb24gb25lIHNsaWRlXG5cdFx0XHRyZXF1ZXN0U2xpZGUoaSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnUmVxdWVzdGluZyBzbGlkZScsIGkpO1xuXHRcdFx0XHR0aGlzLnNlbmRTaWduYWxUb0NsaWVudHMoJ2dvVG9TbGlkZScsIGkpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUZWxsIGFsbCBvZiB0aGUgY2xpZW50cyB0byBtb3ZlIG9uIG9uZSBldmVudFxuXHRcdFx0dHJpZ2dlclJlbW90ZUV2ZW50KCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnVHJpZ2dlcmluZyByZW1vdGUgaW50ZXJhY3Rpb24gZXZlbnQnKTtcblx0XHRcdFx0dGhpcy5zZW5kU2lnbmFsVG9DbGllbnRzKCd0cmlnZ2VyRXZlbnQnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0bGV0IHVzZXIgPSBuZXcgV2VicnRjVXNlcighIXBlZXJDb250cm9sbGVyKTtcblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdFx0aWYgKHBlZXJDb250cm9sbGVyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdZb3UgaGF2ZSB0aGUgcG93ZXInLCBpZCk7XG5cdFx0XHRcdHNsaWRlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2NvbnRyb2xsZXInKTtcblx0XHRcdFx0bXlQZWVyLm9uKCdjb25uZWN0aW9uJywgZGF0YUNvbm4gPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdyZWNpZXZlZCBjb25uZWN0aW9uIGZyb20nLCBkYXRhQ29ubi5wZWVyKTtcblx0XHRcdFx0XHR1c2VyLmFkZENsaWVudChkYXRhQ29ubik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ1lvdSBhcmUgYSBjbGllbnQnLCBpZCk7XG5cdFx0XHRcdG15UGVlci5jb25uZWN0KE1BU1RFUl9DT05UUk9MTEVSX05BTUUpLm9uKCdkYXRhJywgZGF0YSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ3JlY2lldmVkIGluc3RydWN0aW9ucycsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblx0XHRcdFx0XHR1c2VyLmZpcmUoZGF0YS50eXBlLCBkYXRhLmRhdGEpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0bXlQZWVyLm9uKCdjb25uZWN0aW9uJywgZGF0YUNvbm4gPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdyZWNpZXZlZCBjb25uZWN0aW9uIGZyb20nLCBkYXRhQ29ubi5wZWVyKTtcblx0XHRcdFx0XHR1c2VyLmFkZENsaWVudChkYXRhQ29ubik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmVzb2x2ZSh1c2VyKTtcblx0XHR9KTtcblx0fSlcblx0LnRoZW4odXNlciA9PiB7XG5cblx0XHRzbGlkZUNvbnRhaW5lci5vbignYS1zbGlkZXNfc2xpZGUtc2V0dXAnLCAoe2RldGFpbDoge3NsaWRlSWR9fSkgPT4gIHVzZXIucmVxdWVzdFNsaWRlLmJpbmQodXNlcikoc2xpZGVJZCkpO1xuXHRcdHNsaWRlQ29udGFpbmVyLm9uKCdhLXNsaWRlc190cmlnZ2VyLWV2ZW50JywgKCkgPT4gdXNlci50cmlnZ2VyUmVtb3RlRXZlbnQuYmluZCh1c2VyKSgpKTtcblx0XHR1c2VyLm9uKCdnb1RvU2xpZGUnLCBzbGlkZSA9PiBzbGlkZUNvbnRhaW5lci5maXJlKCdhLXNsaWRlc19nb3RvLXNsaWRlJywge3NsaWRlOiBzbGlkZUNvbnRhaW5lci4kKGAuc2xpZGVbZGF0YS1zbGlkZS1pZD1cIiR7c2xpZGV9XCJdYCl9KSk7XG5cdFx0dXNlci5vbigndHJpZ2dlckV2ZW50JywgKCkgPT4gc2xpZGVDb250YWluZXIuZmlyZSgnYS1zbGlkZXNfdHJpZ2dlci1ldmVudCcpKTtcblxuXHRcdC8vIEZ1cnRoZXIgRXZlbnQgSGFuZGxpbmdcblx0XHRteVBlZXIub24oJ2Vycm9yJywgZSA9PiB7XG5cblx0XHRcdC8vIEhhbmRsZSB0aGUgY291bGQgbm90IGNvbm5lY3Qgc2l0dWF0aW9uXG5cdFx0XHRpZiAoZS50eXBlID09PSBcInBlZXItdW5hdmFpbGFibGVcIiAmJiBlLm1lc3NhZ2UgPT09ICdDb3VsZCBub3QgY29ubmVjdCB0byBwZWVyIGFkYS1zbGlkZXMtY29udHJvbGxlcicpIHtcblxuXHRcdFx0XHQvLyBXYWl0IGEgZmV3IHNlY29uZHMgYW5kIHRyeSByZWNvbm5lY3Rpbmdcblx0XHRcdFx0Y29uc29sZS5sb2coJ0xvc3QgY29ubmVjdGlvbiB0byBjbGllbnQuJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHRcdFx0bXlQZWVyLmRlc3Ryb3koKTtcblx0XHRcdFx0d2ViUlRDU3RhdHVzLmlubmVySFRNTCA9IGAke2UudHlwZX06ICR7ZS5tZXNzYWdlfWA7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5jbGFzc0xpc3QucmVtb3ZlKCdncmVlbicpO1xuXHRcdFx0XHR3ZWJSVENTdGF0dXMuY2xhc3NMaXN0LmFkZCgncmVkJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRteVBlZXIub24oJ2Rpc2Nvbm5lY3RlZCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRpZiAoIXRoaXMuZGVzdHJveWVkKSB7XG5cdFx0XHRcdFx0dGhpcy5yZWNvbm5lY3QoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgMzAwMCk7XG5cdFx0fS5iaW5kKG15UGVlcikpO1xuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoe3BlZXJTZXR0aW5nc30pIHtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKHtzbGlkZUNvbnRhaW5lcn0pIHtcblxuXHRcdHNsaWRlQ29udHJvbGxlci5tYWtlQW5kQmluZEJ1dHRvbignQmUgU2xpZGUgQ29udHJvbGxlcicsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHdlYlJUQ1NldHVwKHtcblx0XHRcdFx0cGVlclNldHRpbmdzLFxuXHRcdFx0XHRwZWVyQ29udHJvbGxlcjogdHJ1ZSxcblx0XHRcdFx0c2xpZGVDb250YWluZXJcblx0XHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHR3ZWJSVENTdGF0dXMuY2xhc3NMaXN0LnJlbW92ZSgncmVkJyk7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5jbGFzc0xpc3QuYWRkKCdncmVlbicpO1xuXHRcdFx0XHR3ZWJSVENTdGF0dXMuaW5uZXJIVE1MID0gJ0NvbnRyb2xsZXInO1xuXHRcdFx0fSkuY2F0Y2goZSA9PiB7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5jbGFzc0xpc3QucmVtb3ZlKCdncmVlbicpO1xuXHRcdFx0XHR3ZWJSVENTdGF0dXMuY2xhc3NMaXN0LmFkZCgncmVkJyk7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5pbm5lckhUTUwgPSBlLm1lc3NhZ2U7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHNsaWRlQ29udHJvbGxlci5tYWtlQW5kQmluZEJ1dHRvbignUmVjaWV2ZSBDb250cm9sJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0d2ViUlRDU2V0dXAoe1xuXHRcdFx0XHRwZWVyU2V0dGluZ3MsXG5cdFx0XHRcdHBlZXJDb250cm9sbGVyOiBmYWxzZSxcblx0XHRcdFx0c2xpZGVDb250YWluZXJcblx0XHRcdH0pXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5jbGFzc0xpc3QucmVtb3ZlKCdyZWQnKTtcblx0XHRcdFx0d2ViUlRDU3RhdHVzLmNsYXNzTGlzdC5hZGQoJ2dyZWVuJyk7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5pbm5lckhUTUwgPSAnQ29udHJvbGxlZCc7XG5cdFx0XHR9KS5jYXRjaChlID0+IHtcblx0XHRcdFx0d2ViUlRDU3RhdHVzLmNsYXNzTGlzdC5yZW1vdmUoJ2dyZWVuJyk7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5jbGFzc0xpc3QuYWRkKCdyZWQnKTtcblx0XHRcdFx0d2ViUlRDU3RhdHVzLmlubmVySFRNTCA9IGUubWVzc2FnZTtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0d2ViUlRDU3RhdHVzID0gd2luZG93Lm1ha2UuZGl2KCk7XG5cdFx0c2xpZGVDb250cm9sbGVyLmFwcGVuZCh3ZWJSVENTdGF0dXMpO1xuXHRcdHdlYlJUQ1N0YXR1cy5jbGFzc0xpc3QuYWRkKCdyZWQnKTtcblx0XHR3ZWJSVENTdGF0dXMuY2xhc3NMaXN0LmFkZCgnc3RhdHVzJyk7XG5cdFx0d2ViUlRDU3RhdHVzLmlubmVySFRNTCA9ICdOb3QgQ29ubmVjdGVkJztcblxuXHRcdC8vIGlmIHRoZSBjbGllbnQgc2VhcmNoIHBhcmFtIGlzIHByZXNlbnQgdGhlbiBqdW1wXG5cdFx0Ly8gc3RyYWlnaHQgaW50byBwcmVzZW50YXRpb24gYW5kIHRyeSB0byBjb25uZWN0LlxuXHRcdGlmIChsb2NhdGlvbi5zZWFyY2ggPT09IFwiP2NsaWVudFwiKSB7XG5cdFx0XHRzbGlkZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdwcmVzZW50YXRpb24nKTtcblx0XHRcdHdlYlJUQ1NldHVwKHtcblx0XHRcdFx0cGVlclNldHRpbmdzLFxuXHRcdFx0XHRwZWVyQ29udHJvbGxlcjogZmFsc2UsXG5cdFx0XHRcdHNsaWRlQ29udGFpbmVyXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHR3ZWJSVENTdGF0dXMuY2xhc3NMaXN0LnJlbW92ZSgncmVkJyk7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5jbGFzc0xpc3QuYWRkKCdncmVlbicpO1xuXHRcdFx0XHR3ZWJSVENTdGF0dXMuaW5uZXJIVE1MID0gJ0NvbnRyb2xsZWQnO1xuXHRcdFx0fSkuY2F0Y2goZSA9PiB7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5jbGFzc0xpc3QucmVtb3ZlKCdncmVlbicpO1xuXHRcdFx0XHR3ZWJSVENTdGF0dXMuY2xhc3NMaXN0LmFkZCgncmVkJyk7XG5cdFx0XHRcdHdlYlJUQ1N0YXR1cy5pbm5lckhUTUwgPSBlLm1lc3NhZ2U7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59O1xuIiwibGV0IGFwcGVuZFRhcmdldDtcbmNvbnN0IHRlbXBsYXRlcyA9ICB7XG5cdG1vZGFsOiBgXG5cdFx0PGRpdiBjbGFzcz1cIm1vZGFsIGZhZGVcIj5cblx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbC1kaWFsb2dcIj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1vZGFsLWNvbnRlbnRcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG5cdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIiBhcmlhLWhpZGRlbj1cInRydWVcIj7DlzwvYnV0dG9uPlxuXHRcdFx0XHRcdFx0PGxlZ2VuZD5NeSBNb2RhbDwvbGVnZW5kPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5IGZvcm1cIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJlbW9qaS1pbWFnZS1jb250YWluZXIgYmFkLWFuaW0tZGl2XCI+8J+MnTwvZGl2PlxuXHRcdFx0XHRcdFx0PHA+UGVsbGVudGVzcXVlIGV1aXNtb2QgZmFjaWxpc2lzIGR1aS4gQ3JhcyBkaWN0dW0gbGVvIG5vbiBtZXR1cyBmYXVjaWJ1cywgYXQgbGFjaW5pYSBlcmF0IGV1aXNtb2QuIE51bmMgc2VkIGZhY2lsaXNpcyBkdWkuIFV0IHBlbGxlbnRlc3F1ZSwgZG9sb3IgcHJldGl1bSByaG9uY3VzIHZhcml1cywgc2FwaWVuIGRvbG9yIHZvbHV0cGF0IGVsaXQsIGF0IHBvcnR0aXRvciByaXN1cyBtYXVyaXMgc2VtcGVyIHRlbGx1cy4gVXQgcHVsdmluYXIgYXJjdSB1cm5hLCBpZCB0aW5jaWR1bnQgdGVsbHVzIGNvbnZhbGxpcyBzb2xsaWNpdHVkaW4uIFByYWVzZW50IG5vbiBuaXNpIG5pc2wuIFZlc3RpYnVsdW0gbGFjaW5pYSBsaWd1bGEgbmlzaSwgc2l0IGFtZXQgbWF0dGlzIGxlY3R1cyBzYWdpdHRpcyBzaXQgYW1ldC4gRXRpYW0gYSBlcmF0IHJ1dHJ1bSwgY3Vyc3VzIG1hZ25hIGF0LCBtYXR0aXMgb3JjaS4gVmVzdGlidWx1bSBhbnRlIGlwc3VtIHByaW1pcyBpbiBmYXVjaWJ1cyBvcmNpIGx1Y3R1cyBldCB1bHRyaWNlcyBwb3N1ZXJlIGN1YmlsaWEgQ3VyYWU7IE51bmMgdml0YWUgcmlzdXMgb2Rpby4gRG9uZWMgZWdlc3RhcyBmZXVnaWF0IGV4LCBsb2JvcnRpcyBhbGlxdWV0IGxlbyB0ZW1wdXMgc2VkLiBOdWxsYSBwZWxsZW50ZXNxdWUgbmlzaSB2ZWwgbmVxdWUgbG9ib3J0aXMsIGluIGN1cnN1cyBmZWxpcyBwcmV0aXVtLjwvcD5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibW9kYWwtZm9vdGVyXCI+XG5cdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdFwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+Q2xvc2U8L2J1dHRvbj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5cblx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtcHJpbWFyeSBwcmV0ZW5kLXdlYi1hcHAtd2l0aC1tb2RhbFwiPlxuXHRcdFx0PGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj5NeSBXZWIgQXBwPC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwid29ya3NwYWNlIGNvbnRhaW5lci1mbHVpZFwiPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJyb3dcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb2wtc20tNlwiPlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPlxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LiBOdWxsYW0gaW50ZXJkdW0gbGVjdHVzIGEgbnVuYyB1bGxhbWNvcnBlciBkaWduaXNzaW0uIFNlZCBhYyBtYWduYSBub24gbWFnbmEgZnJpbmdpbGxhIHJ1dHJ1bSBzaXQgYW1ldCB1bGxhbWNvcnBlciBtYXVyaXMuXG5cdFx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sLXNtLTZcIj5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIj5cblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4gTnVsbGFtIGludGVyZHVtIGxlY3R1cyBhIG51bmMgdWxsYW1jb3JwZXIgZGlnbmlzc2ltLiBTZWQgYWMgbWFnbmEgbm9uIG1hZ25hIGZyaW5naWxsYSBydXRydW0gc2l0IGFtZXQgdWxsYW1jb3JwZXIgbWF1cmlzLlxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1zdWNjZXNzXCI+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPk5vdGlmaWNhdGlvbnM8L2Rpdj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5IG5vdGlmaWNhdGlvbnMtZ28taGVyZVwiPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+V2lkZ2V0IDIuPC9kaXY+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPlxuXHRcdFx0XHRcdFx0XHRMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LiBOdWxsYW0gaW50ZXJkdW0gbGVjdHVzIGEgbnVuYyB1bGxhbWNvcnBlciBkaWduaXNzaW0uIFNlZCBhYyBtYWduYSBub24gbWFnbmEgZnJpbmdpbGxhIHJ1dHJ1bSBzaXQgYW1ldCB1bGxhbWNvcnBlciBtYXVyaXMuXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj5XaWRnZXQgMy48L2Rpdj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+XG5cdFx0XHRcdFx0XHRcdExvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNjaW5nIGVsaXQuIE51bGxhbSBpbnRlcmR1bSBsZWN0dXMgYSBudW5jIHVsbGFtY29ycGVyIGRpZ25pc3NpbS4gU2VkIGFjIG1hZ25hIG5vbiBtYWduYSBmcmluZ2lsbGEgcnV0cnVtIHNpdCBhbWV0IHVsbGFtY29ycGVyIG1hdXJpcy5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdDwvZGl2PmAsXG5cdGNvbnRhaW5tZW50OiBgXG4gICAge1xuICAgICAgICBoZWlnaHQ6IFxcPGZpeGVkIHZhbHVlXFw+O1xuICAgICAgICB3aWR0aDogXFw8Zml4ZWQgdmFsdWUgb3IgYSAlXFw+O1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIGNvbnRhaW46IHN0cmljdDsgLy8g4pyoIEluIGRyYWZ0IOKcqFxuICAgIH1gXG59O1xuXG5sZXQgdDtcblxuLy8gSW4gdGhpcyBjb250ZXh0IHRoaXMgcmVmZXJzIHRvIHRoZSBET00gZWxlbWVudFxuLy8gd2hpY2ggaXMgZGlzcGxheWVkIGFzIHRoZSBzbGlkZXNob3cuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2V0dXAoKSB7XG5cdFx0YXBwZW5kVGFyZ2V0ID0gbWFrZS5kaXYoKTtcblx0fSxcblx0YWN0aW9uOiBmdW5jdGlvbiogKCkge1xuXHRcdHRoaXMuYXBwZW5kQ2hpbGQoYXBwZW5kVGFyZ2V0KTtcblxuXHRcdGFwcGVuZFRhcmdldC5hZGRIVE1MKHRlbXBsYXRlcy5tb2RhbCk7XG5cblx0XHRzZXRUaW1lb3V0KCgpID0+IGFwcGVuZFRhcmdldC4kKCcubW9kYWwnKS5jc3Moe1xuXHRcdFx0dHJhbnNmb3JtOiAnc2NhbGVYKDEpJ1xuXHRcdH0pLCA1MDApO1xuXHRcdHlpZWxkO1xuXG5cdFx0YXBwZW5kVGFyZ2V0LmVtcHR5KCkuYWRkTWFya2Rvd24odGVtcGxhdGVzLmNvbnRhaW5tZW50KTtcblx0XHR5aWVsZDtcblx0fSxcblx0dGVhcmRvd24oKSB7XG5cblx0XHRjbGVhckludGVydmFsKHQpO1xuXHRcdGlmIChhcHBlbmRUYXJnZXQpIHtcblx0XHRcdGFwcGVuZFRhcmdldC5yZW1vdmVTZWxmKCk7XG5cdFx0XHRhcHBlbmRUYXJnZXQgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG59O1xuIiwidmFyIGFwcGVuZFRhcmdldDtcblxuXG4vLyBJbiB0aGlzIGNvbnRleHQgdGhpcyByZWZlcnMgdG8gdGhlIERPTSBlbGVtZW50XG4vLyB3aGljaCBpcyBkaXNwbGF5ZWQgYXMgdGhlIHNsaWRlc2hvdy5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzZXR1cCgpIHtcblx0XHRhcHBlbmRUYXJnZXQgPSBtYWtlLmRpdigpLmNzcyh7XG5cdFx0XHRkaXNwbGF5OiAnZmxleCcsXG5cdFx0XHR3aWR0aDogJzEwMCUnLFxuXHRcdFx0aGVpZ2h0OiAnMTAwJScsXG5cdFx0XHRcImp1c3RpZnktY29udGVudFwiOiAnY2VudGVyJyxcblx0XHRcdFwiYWxpZ24taXRlbXNcIjogJ2NlbnRlcicsXG5cdFx0XHRvdmVyZmxvdzogXCJoaWRkZW5cIlxuXHRcdH0pO1xuXHR9LFxuXHRhY3Rpb246IGZ1bmN0aW9uKiAoKSB7XG5cblx0XHQvLyBBcHBlbmQgdGhlIHRhcmdldCB0byB0aGUgZG9tXG5cdFx0dGhpcy5hcHBlbmRDaGlsZChhcHBlbmRUYXJnZXQpO1xuXG5cdFx0YXBwZW5kVGFyZ2V0LmVtcHR5KClcblx0XHQuYWRkSFRNTChgPGlmcmFtZSBzcmM9XCJodHRwczovL2FkYXJvc2VlZHdhcmRzLmdpdGh1Yi5pby9Tb3VuZFRoaW5nL2luZGV4Lmh0bWxcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7XCIgc2VhbWxlc3M9dHJ1ZT5gKTtcblx0XHR5aWVsZDtcblxuXHRcdGFwcGVuZFRhcmdldC5lbXB0eSgpXG5cdFx0LmFkZEhUTUwoYDxpbWcgc3JjPVwiaW1hZ2VzL2NhcmRib2FyZC5qcGdcIiAvPmApO1xuXHRcdHlpZWxkO1xuXHR9LFxuXHR0ZWFyZG93bigpIHtcblx0XHRpZiAoYXBwZW5kVGFyZ2V0KSB7XG5cdFx0XHRhcHBlbmRUYXJnZXQucmVtb3ZlU2VsZigpO1xuXHRcdFx0YXBwZW5kVGFyZ2V0ID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxufTtcbiIsImxldCBhcHBlbmRUYXJnZXQ7XG5jb25zdCBjb250ZW50ID0ge1xuXHRzcXVpZGdlOiBgPGNlbnRlcj48ZGl2IGNsYXNzPVwic3F1aWRnZVwiPjxwPlxuXHRcdDxkaXYgY2xhc3M9XCJlbW9qaS1pbWFnZS1jb250YWluZXIgYmFkLWFuaW0tZGl2IGJhZDJcIj7wn4ydPC9kaXY+PGRpdiBjbGFzcz1cImVtb2ppLWltYWdlLWNvbnRhaW5lclwiPvCfjYQ8L2Rpdj5Mb3JlbSBJcHN1bSBpcyBzaW1wbHkgZHVtbXkgdGV4dCBvZiB0aGUgcHJpbnRpbmcgYW5kIHR5cGVzZXR0aW5nIGluZHVzdHJ5LiBMb3JlbSBJcHN1bSBoYXMgYmVlbiB0aGUgaW5kdXN0cnkncyBzdGFuZGFyZCBkdW1teSB0ZXh0IGV2ZXIgc2luY2UgdGhlIDE1MDBzLCBRdWlzcXVlIHBlbGxlbnRlc3F1J2UgbWFsZXN1YWRhIGV4LCB1dCBtYWxlc3VhZGEgbnVuYyBlbGVtZW50dW0gdGluY2lkdW50LiBDcmFzIHB1bHZpbmFyIGNvbnNlY3RldHVyIG9kaW8gbm9uIHBlbGxlbnRlc3F1ZS4gVmVzdGlidWx1bSBhbnRlIGlwc3VtIHByaW1pcyBpbiBmYXVjaWJ1cyBvcmNpIGx1Y3R1cyBldCB1bHRyaWNlcyBwb3N1ZXJlIGN1YmlsaWEgQ3VyYWU7IERvbmVjIHF1aXMgdWxsYW1jb3JwZXIgbWkuIFBlbGxlbnRlc3F1ZSBqdXN0byBlcm9zLCBjb25zZXF1YXQgYXQgZWZmaWNpdHVyIHZpdGFlLCB0cmlzdGlxdWUgYXQgZG9sb3IuIEV0aWFtIHBvc3VlcmUgc2FwaWVuIHVybmEsIGEgZWdlc3RhcyBlcm9zIHRpbmNpZHVudCBub24uIFF1aXNxdWUgYmxhbmRpdCwgbG9yZW0gdnVscHV0YXRlIGVmZmljaXR1ciB0ZW1wdXMsIGVuaW0gbWFzc2Egc29kYWxlcyBtZXR1cywgc2l0IGFtZXQgbW9sZXN0aWUgcmlzdXMgbGliZXJvIGFsaXF1YW0gZXJvcy4gUHJhZXNlbnQgbGliZXJvIGVyYXQsIGV1aXNtb2QgZWZmaWNpdHVyIGZpbmlidXMgdmVsLCB0cmlzdGlxdWUgZXUgbWFzc2EuIE51bGxhbSBmZXJtZW50dW0gc2NlbGVyaXNxdWUgZGlhbSB1dCB2YXJpdXMuIFBoYXNlbGx1cyBtaSBwdXJ1cywgZmFjaWxpc2lzIG5vbiB0aW5jaWR1bnQgc2VkLCBsdWN0dXMgdXQgYW50ZS4gQ2xhc3MgYXB0ZW50IHRhY2l0aSBzb2Npb3NxdSBhZCBsaXRvcmEgdG9ycXVlbnQgcGVyIGNvbnViaWEgbm9zdHJhLCBwZXIgaW5jZXB0b3MgaGltZW5hZW9zLlxuXHRcdDwvcD48cD5cblx0XHRTdXNwZW5kaXNzZSBoZW5kcmVyaXQgbWFsZXN1YWRhIG1pLiBRdWlzcXVlIGVsZW1lbnR1bSBxdWlzIGF1Z3VlIGZyaW5naWxsYSBlZmZpY2l0dXIuIFN1c3BlbmRpc3NlIHBvdGVudGkuIFV0IG5vbiBzYXBpZW4gcGxhY2VyYXQgZXJhdCBsdWN0dXMgZWZmaWNpdHVyLiBJbnRlZ2VyIHNpdCBhbWV0IGxvcmVtIHZlbCBsaWJlcm8gdGluY2lkdW50IGNvbnNlY3RldHVyIGVnZXQgc2l0IGFtZXQgcmlzdXMuIFF1aXNxdWUgcnV0cnVtIHF1aXMgZXJhdCBuZWMgZWZmaWNpdHVyLiBEb25lYyBpZCBzZW0gZGlnbmlzc2ltLCBncmF2aWRhIGZlbGlzIGluLCBkYXBpYnVzIGVzdC5cblx0XHQ8L3A+XG5cdFx0PGRpdiBjbGFzcz1cImVtb2ppLWltYWdlLWNvbnRhaW5lciBiYWQtYW5pbS1kaXZcIj7wn4ydPC9kaXY+XG5cdFx0PHA+XG5cdFx0XHRcdFBlbGxlbnRlc3F1ZSBldWlzbW9kIGZhY2lsaXNpcyBkdWkuIENyYXMgZGljdHVtIGxlbyBub24gbWV0dXMgZmF1Y2lidXMsIGF0IGxhY2luaWEgZXJhdCBldWlzbW9kLiBOdW5jIHNlZCBmYWNpbGlzaXMgZHVpLiBVdCBwZWxsZW50ZXNxdWUsIGRvbG9yIHByZXRpdW0gcmhvbmN1cyB2YXJpdXMsIHNhcGllbiBkb2xvciB2b2x1dHBhdCBlbGl0LCBhdCBwb3J0dGl0b3IgcmlzdXMgbWF1cmlzIHNlbXBlciB0ZWxsdXMuIFV0IHB1bHZpbmFyIGFyY3UgdXJuYSwgaWQgdGluY2lkdW50IHRlbGx1cyBjb252YWxsaXMgc29sbGljaXR1ZGluLiBQcmFlc2VudCBub24gbmlzaSBuaXNsLiBWZXN0aWJ1bHVtIGxhY2luaWEgbGlndWxhIG5pc2ksIHNpdCBhbWV0IG1hdHRpcyBsZWN0dXMgc2FnaXR0aXMgc2l0IGFtZXQuIEV0aWFtIGEgZXJhdCBydXRydW0sIGN1cnN1cyBtYWduYSBhdCwgbWF0dGlzIG9yY2kuIFZlc3RpYnVsdW0gYW50ZSBpcHN1bSBwcmltaXMgaW4gZmF1Y2lidXMgb3JjaSBsdWN0dXMgZXQgdWx0cmljZXMgcG9zdWVyZSBjdWJpbGlhIEN1cmFlOyBOdW5jIHZpdGFlIHJpc3VzIG9kaW8uIERvbmVjIGVnZXN0YXMgZmV1Z2lhdCBleCwgbG9ib3J0aXMgYWxpcXVldCBsZW8gdGVtcHVzIHNlZC4gTnVsbGEgcGVsbGVudGVzcXVlIG5pc2kgdmVsIG5lcXVlIGxvYm9ydGlzLCBpbiBjdXJzdXMgZmVsaXMgcHJldGl1bS5cblx0XHQ8L3A+PHA+XG5cdFx0XHRcdEFsaXF1YW0gZmVsaXMgdG9ydG9yLCBlZmZpY2l0dXIgaWQgcXVhbSBhbGlxdWV0LCBtb2xsaXMgbW9sZXN0aWUgZXN0LiBDdXJhYml0dXIgc2VkIGVyb3Mgc29kYWxlcywgZ3JhdmlkYSBhbnRlIGV0LCBwcmV0aXVtIG5pc2wuIE51bmMgcGVsbGVudGVzcXVlIGFyY3UgdXQgdHJpc3RpcXVlIHNvZGFsZXMuIFByYWVzZW50IHZhcml1cyBwaGFyZXRyYSBkb2xvciB2aXRhZSBsYW9yZWV0LiBEb25lYyB0aW5jaWR1bnQgdmVsaXQgbmVjIGxpYmVybyBsb2JvcnRpcywgbm9uIGVsZWlmZW5kIG51bmMgZmluaWJ1cy4gRG9uZWMgcGVsbGVudGVzcXVlIGR1aSBzY2VsZXJpc3F1ZSBlbmltIGNvbnZhbGxpcyBhbGlxdWFtLiBQZWxsZW50ZXNxdWUgcGhhcmV0cmEgc2VkIGxpZ3VsYSB2ZWwgbWF4aW11cy4gQWVuZWFuIGVnZXQgbHVjdHVzIGVuaW0sIGEgdWxsYW1jb3JwZXIganVzdG8uIE51bGxhIGV0IGVsZW1lbnR1bSBhbnRlLCB0ZW1wb3IgZGljdHVtIG5lcXVlLiBWaXZhbXVzIGltcGVyZGlldCBpbXBlcmRpZXQgbWkuIE51bmMgc2VkIG51bGxhIG5lYyB1cm5hIHNvZGFsZXMgZmluaWJ1cyBzZWQgZWdldCB0b3J0b3IuIEFlbmVhbiBldWlzbW9kIGRpYW0gbWF1cmlzLCBldSBlbGVpZmVuZCBlbmltIGF1Y3RvciBldS4gSW4gc2l0IGFtZXQgZmFjaWxpc2lzIGRvbG9yLCBldCBjb21tb2RvIG5pc2kuIEFsaXF1YW0gcXVpcyBsb2JvcnRpcyBkaWFtLiBQZWxsZW50ZXNxdWUgdHJpc3RpcXVlIHZlaGljdWxhIG5pc2wsIGlkIGRpZ25pc3NpbSBqdXN0byBhdWN0b3IgdmVsLlxuXHRcdDwvcD48cD5cblx0XHRcdFx0Q3VyYWJpdHVyIHV0IHVsdHJpY2llcyBzYXBpZW4sIHZlbCB0ZW1wb3IgbmlzbC4gRXRpYW0gcHJldGl1bSBpbiBpcHN1bSBldSBlbGVpZmVuZC4gTW9yYmkgc29kYWxlcyBxdWlzIG5pc2wgZXUgZGFwaWJ1cy4gQ3JhcyBlbGVtZW50dW0gaW50ZXJkdW0gbGlndWxhIG5lYyB2aXZlcnJhLiBEb25lYyBtYXhpbXVzIHJ1dHJ1bSBlbGl0LCB1dCBlbGVtZW50dW0gZG9sb3IgdGluY2lkdW50IGV1LiBJbiBtb2xlc3RpZSBhYyBudWxsYSB2ZWwgbW9sbGlzLiBQcmFlc2VudCByaG9uY3VzIHR1cnBpcyBsb3JlbSwgdml0YWUgaW50ZXJkdW0gZG9sb3IgY29uZ3VlIG5vbi4gVXQgY29uZ3VlIGNvbW1vZG8gbWkgcGVsbGVudGVzcXVlIGx1Y3R1cy4gSW4gYXQgbnVsbGEgdGVtcHVzLCBjb25kaW1lbnR1bSBhbnRlIGluLCBydXRydW0gZmVsaXMuIEN1cmFiaXR1ciBhIGRpY3R1bSBsZWN0dXMuIFZpdmFtdXMgcXVpcyB1cm5hIHV0IGVzdCBzYWdpdHRpcyBncmF2aWRhLiBFdGlhbSBwcmV0aXVtIGF1Y3RvciBtYWduYSBhdCBlZ2VzdGFzLlxuXHRcdDwvcD48L2Rpdj48L2NlbnRlcj5cblx0YFxufTtcbmxldCB0O1xuXG4vLyBJbiB0aGlzIGNvbnRleHQgdGhpcyByZWZlcnMgdG8gdGhlIERPTSBlbGVtZW50XG4vLyB3aGljaCBpcyBkaXNwbGF5ZWQgYXMgdGhlIHNsaWRlc2hvdy5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzZXR1cCgpIHtcblx0XHRhcHBlbmRUYXJnZXQgPSBtYWtlLmRpdigpO1xuXHR9LFxuXHRhY3Rpb246IGZ1bmN0aW9uKiAoKSB7XG5cdFx0dGhpcy5hcHBlbmRDaGlsZChhcHBlbmRUYXJnZXQpO1xuXG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciBwcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcblx0XHRhcHBlbmRUYXJnZXQuZW1wdHkoKS5hcHBlbmRDaGlsZChwcmUpO1xuXHRcdHQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG5cdFx0XHRwcmUuYWRkSFRNTChpKysgJSAyID09PSAxID8gJ215VmFyID0gZWwuY2xpZW50SGVpZ2h0O1xcbicgOiAnZWwuaGVpZ2h0ID0gKG15VmFyICsgMSkgKyBcInB4XCJcXG4nKTtcblx0XHR9LCA4MDApO1xuXHRcdHlpZWxkO1xuXG5cblx0XHRjbGVhckludGVydmFsKHQpO1xuXHRcdHByZS5pbm5lckhUTUwgPSAnJztcblx0XHR0ID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdFx0cHJlLmFkZEhUTUwoJ215RG9tRWwuaW5uZXJIVE1MICs9IFwiSSBrbm93IGEgc29uZyB3aGljaFxcJ2xsIGdldCBvbiB5b3VyIG5lcnZlcy4uLlwiO1xcbicpO1xuXHRcdH0sIDgwMCk7XG5cdFx0eWllbGQ7XG5cblx0XHRjbGVhckludGVydmFsKHQpO1xuXHRcdGFwcGVuZFRhcmdldC5pbm5lckhUTUwgPSAnPGltZyBzcmM9XCJpbWFnZXMvZmFzdGRvbS5wbmdcIiAvPic7XG5cdFx0eWllbGQ7XG5cblx0XHRhcHBlbmRUYXJnZXQuaW5uZXJIVE1MID0gYFxuXHRcdFx0PGRpdiBjbGFzcz1cImZhc3Rkb20tY29udGFpbmVyIHVuc29ydGVkXCI+XG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmYXN0ZG9tIHJlYWRcIiBzdHlsZT1cIm9yZGVyOiAxO1wiPjxwcmU+cmVhZEZ1bmMxKCk8L3ByZT48L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cImZhc3Rkb20gd3JpdGVcIiBzdHlsZT1cIm9yZGVyOiAyO1wiPjxwcmU+d3JpdGVGdW5jMSgpPC9wcmU+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmYXN0ZG9tIHJlYWRcIiBzdHlsZT1cIm9yZGVyOiAxO1wiPjxwcmU+cmVhZEZ1bmMyKCk8L3ByZT48L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cImZhc3Rkb20gd3JpdGVcIiBzdHlsZT1cIm9yZGVyOiAyO1wiPjxwcmU+d3JpdGVGdW5jMigpPC9wcmU+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmYXN0ZG9tIHJlYWRcIiBzdHlsZT1cIm9yZGVyOiAxO1wiPjxwcmU+cmVhZEZ1bmMzKCk8L3ByZT48L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cImZhc3Rkb20gd3JpdGVcIiBzdHlsZT1cIm9yZGVyOiAyO1wiPjxwcmU+d3JpdGVGdW5jMygpPC9wcmU+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJmYXN0ZG9tIHJlYWRcIiBzdHlsZT1cIm9yZGVyOiAxO1wiPjxwcmU+cmVhZEZ1bmM0KCk8L3ByZT48L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cImZhc3Rkb20gd3JpdGVcIiBzdHlsZT1cIm9yZGVyOiAyO1wiPjxwcmU+d3JpdGVGdW5jNCgpPC9wcmU+PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHRgO1xuXG5cdFx0Y29uc3QgbSA9IG5ldyBNYXAoKTtcblx0XHRhcHBlbmRUYXJnZXQuJCQoJy5mYXN0ZG9tJykuZm9yRWFjaChlbCA9PiBtLnNldChlbCwgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpKTtcblxuXHRcdGFwcGVuZFRhcmdldC4kKCcuZmFzdGRvbS1jb250YWluZXInKS5jbGFzc0xpc3QucmVtb3ZlKCd1bnNvcnRlZCcpO1xuXG5cdFx0Y29uc3Qgc2NhbGUgPSAkKCcuc2xpZGUtY29udGFpbmVyLnByZXNlbnRhdGlvbicpID8gMSA6IDAuNDtcblxuXHRcdG0uZm9yRWFjaCgocmVjdDEsIGVsKSA9PiB7XG5cdFx0XHRjb25zdCByZWN0MiA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0ZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgkeyhyZWN0MS5sZWZ0IC0gcmVjdDIubGVmdCkvc2NhbGV9cHgsICR7KHJlY3QxLnRvcCAtIHJlY3QyLnRvcCkvc2NhbGV9cHgpYDtcblx0XHR9KTtcblxuXHRcdHlpZWxkO1xuXG5cdFx0bS5mb3JFYWNoKChyZWN0MSwgZWwpID0+IGVsLmNzcyh7XG5cdFx0XHR0cmFuc2Zvcm06IGBzY2FsZSgxKWAsXG5cdFx0XHR0cmFuc2l0aW9uOiBgdHJhbnNmb3JtIDJzIGVhc2VgXG5cdFx0fSkpO1xuXHRcdHlpZWxkO1xuXG5cdFx0YXBwZW5kVGFyZ2V0LmlubmVySFRNTCA9IGNvbnRlbnQuc3F1aWRnZTtcblx0XHR5aWVsZDtcblxuXHRcdGFwcGVuZFRhcmdldC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImZhbmN5XCI+TG9yZW0gSXBzdW0gaXMgc2ltcGx5IGR1bW15IHRleHQgb2YgdGhlIHByaW50aW5nIGFuZCBcblx0XHRcdFx0XHRcdFx0XHR0eXBlc2V0dGluZyBpbmR1c3RyeS4gTG9yZW0gSXBzdW0gaGFzIGJlZW4gdGhlIGluZHVzdHJ5J3Mgc3RhbmRhcmQgXG5cdFx0XHRcdFx0XHRcdFx0ZHVtbXkgdGV4dCBldmVyIHNpbmNlIHRoZSAxNTAwcywgUXVpc3F1ZSBwZWxsZW50ZXNxdSdlIG1hbGVzdVxuXHRcdFx0XHRcdFx0XHRcdGFkYSBleCxcblx0XHRcdFx0XHRcdFx0XHQgdXQgbWFsZXN1YWRhIG51bmMgZWxlbWVudHVtIHRpbmNpZHVudC4gQ3JhcyBwdWx2aW5hciBjb25zZWN0ZXR1ciBcblx0XHRcdFx0XHRcdFx0XHQgb2RpbyBub24gcGVsbGVudGVzcXVlLiBWZXN0aWJ1bHVtIGFudGUgaXBzdW0gcHJpbWlzIGluIFxuXHRcdFx0XHRcdFx0XHRcdCBmYXVjaWJ1cyBvcmNpIGx1Y3R1cyBldCB1bHRyaWNlcyBwb3N1ZXJlIGN1YmlsaWEgQ3VyYWU7IERvbmVjIHF1aXNcblx0XHRcdFx0XHRcdFx0XHQgIHVsbGFtY29ycGVyIG1pLiBQZWxsZW50ZXNxdWUganVzdG8gZXJvcywgY29uc2VxdWF0IGF0IGVmZmljaXR1ciB2aXRhZVxuXHRcdFx0XHRcdFx0XHRcdCAgLCB0cmlzdGlxdWUgYXQgZG9sb3IuIEV0aWFtIHBvc3VlcmUgc2FwaWVuIHVybmEsIGEgZWdlc3RhcyBlcm9zIHRpbmNpZHVudCBub24uXG5cdFx0XHRcdFx0XHRcdFx0PC9kaXY+YDtcblx0XHR5aWVsZDtcblxuXHRcdGFwcGVuZFRhcmdldC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInByZXR0eTFcIj7wn4ydPC9kaXY+JyArIFxuXHRcdFx0XHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwicHJldHR5MlwiPvCfjJ08L2Rpdj4nICsgXG5cdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJwcmV0dHkzXCI+8J+MnTwvZGl2PicgKyBcblx0XHRcdFx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cInByZXR0eTRcIj7wn4ydPC9kaXY+JyArIFxuXHRcdFx0XHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwicHJldHR5NVwiPvCfjJ08L2Rpdj4nICsgXG5cdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJwcmV0dHk2XCI+8J+MnTwvZGl2PicgKyBcblx0XHRcdFx0XHRcdFx0XHQnPGRpdiBjbGFzcz1cInByZXR0eTdcIj7wn4ydPC9kaXY+JyArIFxuXHRcdFx0XHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwicHJldHR5OFwiPvCfjJ08L2Rpdj4nICsgXG5cdFx0XHRcdFx0XHRcdFx0JzxkaXYgY2xhc3M9XCJwcmV0dHk5XCI+8J+MnTwvZGl2Pic7XG5cdFx0eWllbGQ7XG5cblx0fSxcblx0dGVhcmRvd24oKSB7XG5cblx0XHRjbGVhckludGVydmFsKHQpO1xuXHRcdGlmIChhcHBlbmRUYXJnZXQpIHtcblx0XHRcdGFwcGVuZFRhcmdldC5yZW1vdmVTZWxmKCk7XG5cdFx0XHRhcHBlbmRUYXJnZXQgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG59O1xuIiwibGV0IGFwcGVuZFRhcmdldDtcbmNvbnN0IFRXRUVOID0gcmVxdWlyZSgndHdlZW4uanMnKTsgXG5cbmNvbnN0IHRlbXBsYXRlcyA9IHtcblx0ZGVtb0FwcDogYFxuXHRcdDxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1wcmltYXJ5IHByZXRlbmQtd2ViLWFwcFwiPlxuXHRcdFx0PGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj5NeSBXZWIgQXBwPC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwtYm9keSBwcmV0ZW5kLXdlYi1hcHAtYm9keVwiPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtc3VjY2Vzc1wiPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+Tm90aWZpY2F0aW9uczwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5IG5vdGlmaWNhdGlvbnMtZ28taGVyZVwiPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPldpZGdldCAyLjwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+XG5cdFx0XHRcdFx0XHRMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzY2luZyBlbGl0LiBOdWxsYW0gaW50ZXJkdW0gbGVjdHVzIGEgbnVuYyB1bGxhbWNvcnBlciBkaWduaXNzaW0uIFNlZCBhYyBtYWduYSBub24gbWFnbmEgZnJpbmdpbGxhIHJ1dHJ1bSBzaXQgYW1ldCB1bGxhbWNvcnBlciBtYXVyaXMuXG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+V2lkZ2V0IDMuPC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj5cblx0XHRcdFx0XHRcdExvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNjaW5nIGVsaXQuIE51bGxhbSBpbnRlcmR1bSBsZWN0dXMgYSBudW5jIHVsbGFtY29ycGVyIGRpZ25pc3NpbS4gU2VkIGFjIG1hZ25hIG5vbiBtYWduYSBmcmluZ2lsbGEgcnV0cnVtIHNpdCBhbWV0IHVsbGFtY29ycGVyIG1hdXJpcy5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQ8L2Rpdj5gLFxuXG5cdG5vdGlmaWNhdGlvbjpcblx0XHRjID0+IGA8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGlzbWlzc2FibGUgYWxlcnQtd2FybmluZ1wiPlxuXHRcdFx0PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cImFsZXJ0XCI+w5c8L2J1dHRvbj48Yj5XYXJuaW5nICR7Y308L2I+OiBTZXJ2ZXIgUm9vbSBPbiBGaXJlXG5cdFx0PC9kaXY+YFxufTtcblxubGV0IHRpbWVvdXQ7XG5sZXQgcmFmO1xuXG4vLyBJbiB0aGlzIGNvbnRleHQgdGhpcyByZWZlcnMgdG8gdGhlIERPTSBlbGVtZW50XG4vLyB3aGljaCBpcyBkaXNwbGF5ZWQgYXMgdGhlIHNsaWRlc2hvdy5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzZXR1cCgpIHtcblx0XHRhcHBlbmRUYXJnZXQgPSBtYWtlLmRpdigpO1xuXHRcdGxldCB0ID0gMDtcblx0XHQoZnVuY3Rpb24gYW5pbWF0ZSgpIHtcblx0XHRcdFRXRUVOLnVwZGF0ZSh0KTtcblx0XHRcdHQgKz0gMTY7XG5cdFx0XHRyYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG5cdFx0fSkoKTtcblx0fSxcblx0YWN0aW9uOiBmdW5jdGlvbiogKCkge1xuXHRcdHRoaXMuYXBwZW5kQ2hpbGQoYXBwZW5kVGFyZ2V0KTtcblxuXHRcdGZ1bmN0aW9uIGRpc3BsYXlCb3VuZGluZ1JlY3RzKGVscykge1xuXHRcdFx0ZWxzLmZvckVhY2goZWwgPT4ge1xuXHRcdFx0XHR2YXIgZGltZW5zaW9ucyA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHR2YXIgZGltZW5zaW9uSW5kaWNhdG9yID0gbWFrZS5kaXYoKTtcblx0XHRcdFx0ZGltZW5zaW9uSW5kaWNhdG9yLmNsYXNzTGlzdC5hZGQoXCJkaW1lbnNpb25JbmRpY2F0b3JcIik7XG5cdFx0XHRcdGRpbWVuc2lvbkluZGljYXRvci5kYXRhc2V0LnRsPSBgJHtwYXJzZUludChkaW1lbnNpb25zLmxlZnQsIDEwKX0sICR7cGFyc2VJbnQoZGltZW5zaW9ucy50b3AsIDEwKX1gO1xuXHRcdFx0XHRkaW1lbnNpb25JbmRpY2F0b3IuZGF0YXNldC5icj0gYCR7cGFyc2VJbnQoZGltZW5zaW9ucy5yaWdodCwgMTApfSwgJHtwYXJzZUludChkaW1lbnNpb25zLmJvdHRvbSwgMTApfWA7XG5cdFx0XHRcdGRpbWVuc2lvbkluZGljYXRvci5jc3MoZGltZW5zaW9ucyk7XG5cdFx0XHRcdCQoJy5zbGlkZS1jb250YWluZXInKS5hcHBlbmRDaGlsZChkaW1lbnNpb25JbmRpY2F0b3IpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0bGV0IG5vdGlmaWNhdGlvbkNvdW50ID0gMDtcblx0XHRjb25zdCBhZGROb3RpZmljYXRpb24gPSAoKSA9PiB7XG5cdFx0XHRsZXQgbmV3Tm90aWZpY2F0aW9uID0gbWFrZS5kaXYoKS5hZGRIVE1MKHRlbXBsYXRlcy5ub3RpZmljYXRpb24oKytub3RpZmljYXRpb25Db3VudCkpO1xuXHRcdFx0YXBwZW5kVGFyZ2V0LiQoJy5ub3RpZmljYXRpb25zLWdvLWhlcmUnKS5wcmVwZW5kKG5ld05vdGlmaWNhdGlvbik7XG5cdFx0XHRyZXR1cm4gbmV3Tm90aWZpY2F0aW9uO1xuXHRcdH07XG5cblx0XHQvLyB5aWVsZHMgYXQgaW50ZXJlc3RpbmcgcG9pbnRzXG5cdFx0ZnVuY3Rpb24gKm1hZ2ljVHJhbnNmb3JtR2VuICh7XG5cdFx0XHRmbixcblx0XHRcdGVsZW1lbnRzVG9XYXRjaCxcblx0XHRcdGNhbGxiYWNrLFxuXHRcdFx0dGltZVxuXHRcdH0pIHtcblx0XHRcdGxldCBtZWFzdXJlbWVudHMgPSBlbGVtZW50c1RvV2F0Y2gubWFwKGVsID0+IHtcblx0XHRcdFx0bGV0IG91dHB1dCA9IHtcblx0XHRcdFx0XHRlbCxcblx0XHRcdFx0XHRpbml0aWFsRGltZW5zaW9uczogZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBjYWxjdWxhdGUgdGhlIGNoaWxkcmVuJ3Mgb2Zmc2V0c1xuXHRcdFx0bWVhc3VyZW1lbnRzLmZvckVhY2gobSA9PiB7XG5cblx0XHRcdFx0Ly8gU2V0IHRoZSBjaGlsZCB0cmFuc2Zvcm0gb2Zmc2V0cyB0byB0aGUgcGFyZW50cyB0b3AgbGVmdFxuXHRcdFx0XHQvLyBzbyB0aGF0IHdoZW4gc2NhbGVkIGRvd24gdGhleSBhbHNvIHJldHVuIHRvIHRoZWlyIG9yaWduYWwgcG9zaXRpb24uXG5cdFx0XHRcdFsuLi5tLmVsLmNoaWxkcmVuXS5mb3JFYWNoKGVsICA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgc2l6ZSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRcdGxldCBvZmZzZXRGcm9tUGFyZW50ID0ge1xuXHRcdFx0XHRcdFx0eDogc2l6ZS5sZWZ0IC0gbS5pbml0aWFsRGltZW5zaW9ucy5sZWZ0LFxuXHRcdFx0XHRcdFx0eTogc2l6ZS50b3AgLSBtLmluaXRpYWxEaW1lbnNpb25zLnRvcFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0ZWwuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gYCR7b2Zmc2V0RnJvbVBhcmVudC54fXB4ICR7b2Zmc2V0RnJvbVBhcmVudC55fXB4YDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gRGVtb25zdHJhdGUgbWVhc3VyaW5nXG5cdFx0XHRkaXNwbGF5Qm91bmRpbmdSZWN0cyhlbGVtZW50c1RvV2F0Y2gpO1xuXHRcdFx0eWllbGQ7XG5cdFx0XHQkJCgnLmRpbWVuc2lvbkluZGljYXRvcicpLmZvckVhY2goaSA9PiBpLnJlbW92ZVNlbGYoKSk7XG5cblx0XHRcdC8vIFJ1biB0aGUgZnVuY3Rpb24gd2hpY2ggbWFrZXMgY2hhbmdlcy5cblx0XHRcdGZuKCk7XG5cblx0XHRcdC8vIERlbW9uc3RyYXRlIG1lYXN1cmluZ1xuXHRcdFx0ZGlzcGxheUJvdW5kaW5nUmVjdHMoZWxlbWVudHNUb1dhdGNoKTtcblx0XHRcdHlpZWxkO1xuXHRcdFx0JCQoJy5kaW1lbnNpb25JbmRpY2F0b3InKS5mb3JFYWNoKGkgPT4gaS5yZW1vdmVTZWxmKCkpO1xuXG5cdFx0XHQvLyBjYWxjdWxhdGUgdGhlIG5ldyBzaXplL29mZnNldCBvZiBlYWNoIGVsXG5cdFx0XHRtZWFzdXJlbWVudHMuZm9yRWFjaChtID0+IHtcblx0XHRcdFx0bS5uZXdEaW1lbnNpb25zID0gbS5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0bS5lbC5zdHlsZS50cmFuc2l0aW9uID0gXCIwc1wiO1xuXHRcdFx0XHRtLmVsLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IFwiMCAwIDBcIjtcblx0XHRcdFx0bS5uZXdUcmFuc2Zvcm0gPSB7XG5cdFx0XHRcdFx0c2NhbGVZOiBtLmluaXRpYWxEaW1lbnNpb25zLmhlaWdodCAvIG0ubmV3RGltZW5zaW9ucy5oZWlnaHQsXG5cdFx0XHRcdFx0c2NhbGVYOiBtLmluaXRpYWxEaW1lbnNpb25zLndpZHRoIC8gbS5uZXdEaW1lbnNpb25zLndpZHRoLFxuXHRcdFx0XHRcdG9mZnNldFg6IG0uaW5pdGlhbERpbWVuc2lvbnMubGVmdCAtIG0ubmV3RGltZW5zaW9ucy5sZWZ0LFxuXHRcdFx0XHRcdG9mZnNldFk6IG0uaW5pdGlhbERpbWVuc2lvbnMudG9wIC0gbS5uZXdEaW1lbnNpb25zLnRvcFxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFNldCB0aGUgdHJhbnNmb3JtcyBvZiB0aGUgZWxcblx0XHRcdGZ1bmN0aW9uIHNldEVsU2l6ZShtKSB7XG5cdFx0XHRcdG0uZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke20ubmV3VHJhbnNmb3JtLm9mZnNldFggKiBtLm5ld1RyYW5zZm9ybS5zY2FsZVh9cHgsICR7bS5uZXdUcmFuc2Zvcm0ub2Zmc2V0WSAqIG0ubmV3VHJhbnNmb3JtLnNjYWxlWX1weCkgc2NhbGUoJHttLm5ld1RyYW5zZm9ybS5zY2FsZVh9LCAke20ubmV3VHJhbnNmb3JtLnNjYWxlWX0pYDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gc2V0IGl0J3MgY2hpbGRyZW4ncyB0cmFuc2Zvcm1zIHRvIHRoZSBpbnZlcnNlIG9mIGl0J3Mgb3duXG5cdFx0XHRmdW5jdGlvbiBzZXRDaGlsZHJlblNjYWxlKG0pIHtcblx0XHRcdFx0Wy4uLm0uZWwuY2hpbGRyZW5dLmZvckVhY2goZWwgID0+IHtcblx0XHRcdFx0XHRlbC5zdHlsZS50cmFuc2Zvcm0gPSBgc2NhbGUoJHsxL20ubmV3VHJhbnNmb3JtLnNjYWxlWH0sICR7MS9tLm5ld1RyYW5zZm9ybS5zY2FsZVl9KWA7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZXN0b3JlIHRoZSBpbml0aWFsIHNpemVzXG5cdFx0XHRtZWFzdXJlbWVudHMuZm9yRWFjaChzZXRFbFNpemUpO1xuXHRcdFx0eWllbGQ7XG5cblx0XHRcdC8vIFNjYWxlIHRoZSBjaGlsZHJlbiB0b29cblx0XHRcdG1lYXN1cmVtZW50cy5mb3JFYWNoKHNldENoaWxkcmVuU2NhbGUpO1xuXHRcdFx0eWllbGQ7XG5cblx0XHRcdC8vIEFuaW1hdGUgdGhlIHJlc3RvcmF0aW9uXG5cdFx0XHRQcm9taXNlLmFsbChtZWFzdXJlbWVudHMubWFwKG0gPT4ge1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG5cdFx0XHRcdFx0bmV3IFRXRUVOLlR3ZWVuKCBtLm5ld1RyYW5zZm9ybSApXG5cdFx0XHRcdFx0XHQudG8oIHtcblx0XHRcdFx0XHRcdFx0c2NhbGVZOiAxLFxuXHRcdFx0XHRcdFx0XHRzY2FsZVg6IDEsXG5cdFx0XHRcdFx0XHRcdG9mZnNldFg6IDAsXG5cdFx0XHRcdFx0XHRcdG9mZnNldFk6IDBcblx0XHRcdFx0XHRcdH0sIHRpbWUgfHwgMTAwMCApXG5cdFx0XHRcdFx0XHQuZWFzaW5nKCBUV0VFTi5FYXNpbmcuUXVhZHJhdGljLk91dCApXG5cdFx0XHRcdFx0XHQub25VcGRhdGUoIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0bS5uZXdUcmFuc2Zvcm0uc2NhbGVYID0gdGhpcy5zY2FsZVg7XG5cdFx0XHRcdFx0XHRcdG0ubmV3VHJhbnNmb3JtLnNjYWxlWSA9IHRoaXMuc2NhbGVZO1xuXHRcdFx0XHRcdFx0XHRtLm5ld1RyYW5zZm9ybS5vZmZzZXRYID0gdGhpcy5vZmZzZXRYO1xuXHRcdFx0XHRcdFx0XHRtLm5ld1RyYW5zZm9ybS5vZmZzZXRZID0gdGhpcy5vZmZzZXRZO1xuXHRcdFx0XHRcdFx0XHRzZXRFbFNpemUobSk7XG5cdFx0XHRcdFx0XHRcdHNldENoaWxkcmVuU2NhbGUobSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0Lm9uQ29tcGxldGUocmVzb2x2ZSlcblx0XHRcdFx0XHRcdC5zdGFydCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pKVxuXHRcdFx0LnRoZW4oY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge30pO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uICpjaGFuZ2VDb250ZW50KCkge1xuXG5cdFx0XHR5aWVsZCBhZGROb3RpZmljYXRpb24oKTtcblx0XHRcdHlpZWxkIGFkZE5vdGlmaWNhdGlvbigpO1xuXG5cdFx0XHRsZXQgbXlUaGluZyA9IG1ha2UuZGl2KCk7XG5cdFx0XHRteVRoaW5nLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPlxuXHRcdFx0XHRcdExvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNjaW5nIGVsaXQuIE51bGxhbSBpbnRlcmR1bSBsZWN0dXMgYSBudW5jIHVsbGFtY29ycGVyIGRpZ25pc3NpbS4gU2VkIGFjIG1hZ25hIG5vbiBtYWduYSBmcmluZ2lsbGEgcnV0cnVtIHNpdCBhbWV0IHVsbGFtY29ycGVyIG1hdXJpcy5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L2Rpdj5gO1xuXG5cdFx0XHQkKCcucHJldGVuZC13ZWItYXBwLWJvZHknKS5wcmVwZW5kKG15VGhpbmcpO1xuXHRcdFx0eWllbGQgbXlUaGluZztcblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlIGRlbW9BcHBcblx0XHRhcHBlbmRUYXJnZXQuZW1wdHkoKS5hZGRIVE1MKHRlbXBsYXRlcy5kZW1vQXBwKTtcblxuXHRcdGNvbnN0IG5haXZlQ29udGVudCA9IGNoYW5nZUNvbnRlbnQoKTtcblx0XHR0aW1lb3V0ID0gc2V0SW50ZXJ2YWwoKCkgPT4gbmFpdmVDb250ZW50Lm5leHQoKSwgMjAwMCk7XG5cdFx0eWllbGQ7XG5cblx0XHRjbGVhckludGVydmFsKHRpbWVvdXQpO1xuXHRcdGFwcGVuZFRhcmdldC5lbXB0eSgpLmFkZEhUTUwodGVtcGxhdGVzLmRlbW9BcHApO1xuXG5cdFx0bGV0IHNtb290aEFkZGluZyA9IHRydWU7XG5cdFx0Y29uc3Qgc21vb3RoQ29udGVudCA9IGNoYW5nZUNvbnRlbnQoKTtcblx0XHQoZnVuY3Rpb24gc21vb3RoQWRkKCkge1xuXHRcdFx0bGV0IG5ld0VsO1xuXHRcdFx0Y29uc3QgbWFnaWNUcmFuc2Zvcm0xID0gbWFnaWNUcmFuc2Zvcm1HZW4oe1xuXHRcdFx0XHRmbjogKCkgPT4ge1xuXHRcdFx0XHRcdG5ld0VsID0gc21vb3RoQ29udGVudC5uZXh0KCkudmFsdWU7XG5cdFx0XHRcdFx0aWYgKG5ld0VsKSBuZXdFbC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZWxlbWVudHNUb1dhdGNoOiBhcHBlbmRUYXJnZXQuJCQoJy5wYW5lbDpub3QoLnByZXRlbmQtd2ViLWFwcCknKSxcblx0XHRcdFx0dGltZTogMTAwMCxcblx0XHRcdFx0Y2FsbGJhY2s6ICgpID0+IHsgXG5cdFx0XHRcdFx0aWYgKG5ld0VsKSBuZXdFbC5jc3Moe1xuXHRcdFx0XHRcdFx0dHJhbnNpdGlvbjogJ29wYWNpdHkgMC4zcyBlYXNlJyxcblx0XHRcdFx0XHRcdG9wYWNpdHk6IDFcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZiAoc21vb3RoQWRkaW5nKSBzbW9vdGhBZGQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIEp1c3QgZG8gaXQgYWxsIGluIG9uZSBnbztcblx0XHRcdGZvciAobGV0IGkgb2YgbWFnaWNUcmFuc2Zvcm0xKXt9XG5cdFx0fSkoKTtcblxuXHRcdHlpZWxkO1xuXG5cdFx0Ly8gU3RvcCBhZGRpbmcgbW9yZVxuXHRcdHNtb290aEFkZGluZyA9IGZhbHNlO1xuXG5cdFx0Ly8gUmVzZXQgdGhlbiBnbyB0aHJvdWdoIGFnYWluIHRoaXMgdGltZSBzdGVwIGJ5IHN0ZXBcblx0XHQvLyBzaG93aW5nIHRoZSBjaGlsZCBlbGVtZW50IHRoZSB3aG9sZSB0aW1lXG5cdFx0Ly8gXG5cdFx0YXBwZW5kVGFyZ2V0LmVtcHR5KCkuYWRkSFRNTCh0ZW1wbGF0ZXMuZGVtb0FwcCk7XG5cdFx0Y29uc3QgbWFnaWNUcmFuc2Zvcm0yID0gbWFnaWNUcmFuc2Zvcm1HZW4oe1xuXHRcdFx0Zm46IGFkZE5vdGlmaWNhdGlvbixcblx0XHRcdGVsZW1lbnRzVG9XYXRjaDogYXBwZW5kVGFyZ2V0LiQkKCcucGFuZWw6bm90KC5wcmV0ZW5kLXdlYi1hcHApJyksXG5cdFx0XHR0aW1lOiAxMDAwXG5cdFx0fSk7XG5cblx0XHQvLyBwYXVzZSBhdCBlYWNoIHlpZWxkXG5cdFx0Zm9yIChsZXQgaSBvZiBtYWdpY1RyYW5zZm9ybTIpIHlpZWxkIGk7XG5cdFx0eWllbGQ7XG5cdH0sXG5cdHRlYXJkb3duKCkge1xuXHRcdGNsZWFySW50ZXJ2YWwodGltZW91dCk7XG5cdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmKTtcblx0XHRpZiAoYXBwZW5kVGFyZ2V0KSB7XG5cdFx0XHRhcHBlbmRUYXJnZXQucmVtb3ZlU2VsZigpO1xuXHRcdFx0YXBwZW5kVGFyZ2V0ID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxufTtcbiIsInZhciBhcHBlbmRUYXJnZXQ7XG5cblxuLy8gSW4gdGhpcyBjb250ZXh0IHRoaXMgcmVmZXJzIHRvIHRoZSBET00gZWxlbWVudFxuLy8gd2hpY2ggaXMgZGlzcGxheWVkIGFzIHRoZSBzbGlkZXNob3cuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2V0dXAoKSB7XG5cdFx0YXBwZW5kVGFyZ2V0ID0gbWFrZS5kaXYoKTtcblx0fSxcblx0YWN0aW9uOiBmdW5jdGlvbiogKCkge1xuXG5cdFx0Ly8gQXBwZW5kIHRoZSB0YXJnZXQgdG8gdGhlIGRvbVxuXHRcdHRoaXMuYXBwZW5kQ2hpbGQoYXBwZW5kVGFyZ2V0KTtcblxuXHRcdGFwcGVuZFRhcmdldC5lbXB0eSgpXG5cdFx0LmFkZEhUTUwoYDxpbWcgc3JjPVwiaW1hZ2VzL3dpbGUuanBnXCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiPmApO1xuXHRcdHlpZWxkO1xuXG5cdFx0YXBwZW5kVGFyZ2V0LmVtcHR5KClcblx0XHQuYWRkSFRNTChgPGltZyBzcmM9XCJpbWFnZXMvd2lsZS5naWZcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7XCI+YCk7XG5cdFx0eWllbGQ7XG5cblx0XHRhcHBlbmRUYXJnZXQuZW1wdHkoKVxuXHRcdC5hZGRIVE1MKGA8aW1nIHNyYz1cImltYWdlcy9jaG9jby5qcGdcIiBzdHlsZT1cIndpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7XCI+YCk7XG5cdFx0eWllbGQ7XG5cblx0XHRhcHBlbmRUYXJnZXQuZW1wdHkoKVxuXHRcdC5hZGRIVE1MKGA8dmlkZW8gc3JjPVwiaW1hZ2VzL2FuZ2VsYS53ZWJtXCIgc3R5bGU9XCJ3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlO1wiIGF1dG9wbGF5IGxvb3A+YCk7XG5cdFx0eWllbGQ7XG5cdH0sXG5cdHRlYXJkb3duKCkge1xuXHRcdGlmIChhcHBlbmRUYXJnZXQpIHtcblx0XHRcdGFwcGVuZFRhcmdldC5yZW1vdmVTZWxmKCk7XG5cdFx0XHRhcHBlbmRUYXJnZXQgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG59O1xuIiwiLyoqXG4gKiBUaGUga2V5IG5hbWVzIG1hdGNoIHRoZSBzbGlkZUlkIGluIHRoZSBfcG9zdHMgZGlyZWN0b3J5XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdCcvamFuayc6IHJlcXVpcmUoJy4vamFuaycpLFxuXHQnL2RvbSc6IHJlcXVpcmUoJy4vZG9tJyksXG5cdCcvZG9tMic6IHJlcXVpcmUoJy4vZG9tMicpLCAvLyBQYWdlIHJlbW92ZWRcblx0Jy93b3JrZXInOiByZXF1aXJlKCcuL3dvcmtlcicpLFxuXHQnL2NvbnRhaW5tZW50JzogcmVxdWlyZSgnLi9jb250YWlubWVudCcpLFxuXHQnL2RlbW9zJzogcmVxdWlyZSgnLi9kZW1vcycpLFxuXHQnL3NpbWQnOiByZXF1aXJlKCcuL3NpbWQnKSxcblx0Jy9mcm9udGxvYWRpbmcnOiByZXF1aXJlKCcuL2Zyb250bG9hZGluZycpLFxufTtcbiIsInZhciBhcHBlbmRUYXJnZXQ7XG5cbnZhciBjb250ZW50VG9BcHBlbmQgPSBbXG5cbmAjIyBTbG93IPCfkKJcbiogTGF5b3V0XG4qIFBhaW50YCxcblxuYCMjIEZhc3Qg8J+QsFxuKiBDb21wb3NpdGVcbnlpZWxkYFxuXG5dO1xuXG52YXIgY3NzVHJpZ2dlcnMgPSBbXG5cdCcjIyBHcmVhdCBSZXNvdXJjZTonLFxuXHRcIiMjIyBQYXVsIExld2lzJ3MgQ1NTIFRyaWdnZXJzXCIsXG5cdCchW10oaW1hZ2VzL2Nzcy10cmlnZ2Vycy5wbmcpJyxcblx0JyMgaHR0cDovL2Nzc3RyaWdnZXJzLmNvbS8nXG5dLmpvaW4oJ1xcbicpO1xuXG4vLyBJbiB0aGlzIGNvbnRleHQgdGhpcyByZWZlcnMgdG8gdGhlIERPTSBlbGVtZW50XG4vLyB3aGljaCBpcyBkaXNwbGF5ZWQgYXMgdGhlIHNsaWRlc2hvdy5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzZXR1cCgpIHtcblx0XHRhcHBlbmRUYXJnZXQgPSBtYWtlLmRpdigpO1xuXHR9LFxuXHRhY3Rpb246IGZ1bmN0aW9uKiAoKSB7XG5cblx0XHQvLyBBcHBlbmQgdGhlIHRhcmdldCB0byB0aGUgZG9tXG5cdFx0dGhpcy5hcHBlbmRDaGlsZChhcHBlbmRUYXJnZXQpO1xuXG5cdFx0YXBwZW5kVGFyZ2V0LmFkZE1hcmtkb3duKCcjIFBlcmZvcm1hbmNlLCB3aGF0IGlzIGphbms/Jyk7XG5cdFx0eWllbGQ7XG5cblx0XHRhcHBlbmRUYXJnZXQuYWRkTWFya2Rvd24oJzxkaXY+PGltZyBzcmM9XCJpbWFnZXMvamFuay1wcm9maWxlLnBuZ1wiIC8+PC9kaXY+Jyk7XG5cdFx0eWllbGQ7XG5cblx0XHRmb3IobGV0IGNvbnRlbnQgb2YgY29udGVudFRvQXBwZW5kKSB7XG5cdFx0XHRjb25zdCBjaGlsZCA9IG1ha2UuZGl2KCk7XG5cdFx0XHRjaGlsZC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG5cdFx0XHRjaGlsZC5zdHlsZS5mbG9hdCA9ICdsZWZ0Jztcblx0XHRcdGNoaWxkLnN0eWxlLnBhZGRpbmcgPSAnMCAwLjVlbSc7XG5cdFx0XHRjaGlsZC5hcHBlbmRDaGlsZChtYWtlLm1hcmtkb3duKGNvbnRlbnQpKTtcblx0XHRcdGFwcGVuZFRhcmdldC5hcHBlbmRDaGlsZChjaGlsZCk7XG5cdFx0XHR5aWVsZDtcblx0XHR9XG5cblx0XHRhcHBlbmRUYXJnZXQuZW1wdHkoKTtcblx0XHRhcHBlbmRUYXJnZXQuYXBwZW5kQ2hpbGQobWFrZS5tYXJrZG93bihjc3NUcmlnZ2VycykpO1xuXHRcdHlpZWxkO1xuXHR9LFxuXHR0ZWFyZG93bigpIHtcblx0XHRpZiAoYXBwZW5kVGFyZ2V0KSB7XG5cdFx0XHRhcHBlbmRUYXJnZXQucmVtb3ZlU2VsZigpO1xuXHRcdFx0YXBwZW5kVGFyZ2V0ID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxufTtcbiIsInZhciBhcHBlbmRUYXJnZXQ7XG5cblxuLy8gSW4gdGhpcyBjb250ZXh0IHRoaXMgcmVmZXJzIHRvIHRoZSBET00gZWxlbWVudFxuLy8gd2hpY2ggaXMgZGlzcGxheWVkIGFzIHRoZSBzbGlkZXNob3cuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0c2V0dXAoKSB7XG5cdFx0YXBwZW5kVGFyZ2V0ID0gbWFrZS5kaXYoKS5jc3Moe1xuXHRcdFx0ZGlzcGxheTogJ2ZsZXgnLFxuXHRcdFx0d2lkdGg6ICcxMDAlJyxcblx0XHRcdGhlaWdodDogJzEwMCUnLFxuXHRcdFx0XCJqdXN0aWZ5LWNvbnRlbnRcIjogJ2NlbnRlcicsXG5cdFx0XHRcImFsaWduLWl0ZW1zXCI6ICdjZW50ZXInLFxuXHRcdFx0b3ZlcmZsb3c6IFwiaGlkZGVuXCIsXG5cdFx0XHRcImZsZXgtZGlyZWN0aW9uXCI6ICdjb2x1bW4nXG5cdFx0fSk7XG5cdH0sXG5cdGFjdGlvbjogZnVuY3Rpb24qICgpIHtcblxuXHRcdC8vIEFwcGVuZCB0aGUgdGFyZ2V0IHRvIHRoZSBkb21cblx0XHR0aGlzLmFwcGVuZENoaWxkKGFwcGVuZFRhcmdldCk7XG5cblx0XHRhcHBlbmRUYXJnZXRcblx0XHQuYWRkSFRNTChgPGgyIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyOyBmb250LXdlaWdodDogMTAwOyBmb250LXNpemU6IDVlbTsgbWFyZ2luOiAwO1wiPlNJTUQ8L2gyPlxuXHRcdFx0XHQgIDxoMyBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjsgZm9udC13ZWlnaHQ6IDEwMDtcIj4oUHJvbm91bmNlZCBTSU0tREVFKTwvaDM+YCk7XG5cdFx0eWllbGQ7XG5cblx0XHRhcHBlbmRUYXJnZXQuZW1wdHkoKVxuXHRcdC5hZGRIVE1MKGA8aW1nIHNyYz1cImltYWdlcy9TSU1ELnBuZ1wiIC8+YCk7XG5cdFx0eWllbGQ7XG5cdH0sXG5cdHRlYXJkb3duKCkge1xuXHRcdGlmIChhcHBlbmRUYXJnZXQpIHtcblx0XHRcdGFwcGVuZFRhcmdldC5yZW1vdmVTZWxmKCk7XG5cdFx0XHRhcHBlbmRUYXJnZXQgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG59O1xuIiwidmFyIGFwcGVuZFRhcmdldDtcblxuXG4vLyBJbiB0aGlzIGNvbnRleHQgdGhpcyByZWZlcnMgdG8gdGhlIERPTSBlbGVtZW50XG4vLyB3aGljaCBpcyBkaXNwbGF5ZWQgYXMgdGhlIHNsaWRlc2hvdy5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzZXR1cCgpIHtcblx0XHRhcHBlbmRUYXJnZXQgPSBtYWtlLmRpdigpLmNzcyh7XG5cdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJyxcblx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRoZWlnaHQ6ICcxMDAlJyxcblx0XHRcdHRvcDogMCxcblx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRiYWNrZ3JvdW5kOiAncmdiYSgyNTUsMjU1LDI1NSwwLjk1KScsXG5cdFx0XHRkaXNwbGF5OiAnZmxleCcsXG5cdFx0XHRcImFsaWduLWl0ZW1zXCI6ICdjZW50ZXInLFxuXHRcdFx0XCJqdXN0aWZ5LWNvbnRlbnRcIjogJ2NlbnRlcicsXG5cdFx0XHRvcGFjaXR5OiAwLFxuXHRcdFx0dHJhbnNmb3JtOiAnc2NhbGUoMC41LCAwLjUpJyxcblx0XHRcdHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gMXMgZWFzZSwgb3BhY2l0eSAxcyBlYXNlJyxcblx0XHR9KTtcblx0fSxcblx0YWN0aW9uOiBmdW5jdGlvbiogKCkge1xuXG5cdFx0YXBwZW5kVGFyZ2V0XG5cdFx0LmFkZE1hcmtkb3duKGBcblx0XHRcdHdvcmtlck1lc3NhZ2Uoe1xuXHRcdFx0XHRhY3Rpb246ICdkb1RoaW5nJyxcblx0XHRcdFx0bXlWYXI6IDRcblx0XHRcdH0pXG5cdFx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdFx0Y29uc29sZS5sb2coZGF0YS5yZXNwb25zZSk7XG5cdFx0XHR9KTtcblx0XHRgKTtcblxuXHRcdC8vIEFwcGVuZCB0aGUgdGFyZ2V0IHRvIHRoZSBkb21cblx0XHR0aGlzLmFwcGVuZENoaWxkKGFwcGVuZFRhcmdldCk7XG5cblx0XHR5aWVsZDtcblxuXHRcdGFwcGVuZFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGUoMSwgMSknO1xuXHRcdGFwcGVuZFRhcmdldC5zdHlsZS5vcGFjaXR5ID0gMTtcblxuXHRcdHlpZWxkO1xuXHR9LFxuXHR0ZWFyZG93bigpIHtcblx0XHRpZiAoYXBwZW5kVGFyZ2V0KSB7XG5cdFx0XHRhcHBlbmRUYXJnZXQucmVtb3ZlU2VsZigpO1xuXHRcdFx0YXBwZW5kVGFyZ2V0ID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDb25zdGFudHNcbiAqL1xuXG4vKipcbiAqIERlcGVuZGVuY2llc1xuICovXG5cbmNvbnN0IEFTbGlkZXMgPSByZXF1aXJlKCcuL2Etc2xpZGVzJyk7XG5jb25zdCBzbGlkZURhdGEgPSByZXF1aXJlKCcuL2NvbnRlbnQnKTtcbmNvbnN0IHNsaWRlQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNsaWRlLWNvbnRhaW5lcicpO1xuXG5uZXcgQVNsaWRlcyhzbGlkZURhdGEsIHtcblx0c2xpZGVDb250YWluZXIsXG5cdHBsdWdpbnM6IFtcblx0XHRyZXF1aXJlKCcuL2Etc2xpZGVzL3BsdWdpbnMvbWFya2Rvd24nKSwgLy8gbmVlZHMgdG8gYmUgcnVuIGZpcnN0XG5cdFx0cmVxdWlyZSgnLi9hLXNsaWRlcy9wbHVnaW5zL3NsaWRlLWNvbnRyb2xsZXInKSwgLy8gbmVlZHMgdG8gYmUgcnVuIGJlZm9yZSBidXR0b25zIGFyZSBhZGRlZCB0byBpdC5cblx0XHRyZXF1aXJlKCcuL2Etc2xpZGVzL3BsdWdpbnMvZGVlcC1saW5raW5nJyksXG5cdFx0cmVxdWlyZSgnLi9hLXNsaWRlcy9wbHVnaW5zL2ludGVyYWN0aW9uLWtleWJvYXJkLW1vdXNlJyksXG5cdFx0cmVxdWlyZSgnLi9hLXNsaWRlcy9wbHVnaW5zL2ludGVyYWN0aW9uLXRvdWNoJykoe1xuXHRcdFx0dXNlOiBbJ3N3aXBlLWJhY2snXVxuXHRcdH0pLFxuXHRcdHJlcXVpcmUoJy4vYS1zbGlkZXMvcGx1Z2lucy9kZWVwLWxpbmtpbmcnKSxcblx0XHRyZXF1aXJlKCcuL2Etc2xpZGVzL3BsdWdpbnMvd2VicnRjLWJyaWRnZScpKHtcblx0XHRcdHBlZXJTZXR0aW5nczoge1xuXHRcdFx0XHRob3N0OiAnMWFtLmNsdWInLFxuXHRcdFx0XHRzZWN1cmU6IHRydWUsXG5cdFx0XHRcdHBvcnQ6IDkwMDAsXG5cdFx0XHRcdGRlYnVnOiAyLFxuXHRcdFx0XHRwYXRoOlwiL3BlZXJqc1wiXG5cdFx0XHR9XG5cdFx0fSlcblx0XVxufSk7XG5cbmlmIChsb2NhdGlvbi5zZWFyY2ggPT09ICc/cHJlc2VudGF0aW9uJykge1xuXHRzbGlkZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdwcmVzZW50YXRpb24nKTtcbn1cblxuaWYgKGxvY2F0aW9uLnNlYXJjaCA9PT0gJz9ub3RlcycpIHtcblx0c2xpZGVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlkZS1wcmVzZW50YXRpb24nKTtcbn1cblxuXG5pZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xuXHRuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3Rlcignc3cuanMnKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlZykge1xuXHRcdFx0Y29uc29sZS5sb2coJ3N3IHJlZ2lzdGVyZWQnLCByZWcpO1xuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnc3cgcmVnaXN0cmF0aW9uIGZhaWxlZCB3aXRoICcgKyBlcnJvcik7XG5cdFx0fSk7XG5cblx0aWYgKG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmNvbnRyb2xsZXIpIHtcblx0XHRjb25zb2xlLmxvZygnT2ZmbGluaW5nIEF2YWlsYWJsZScpO1xuXHR9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vbWFwXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9wcm9taXNlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3NldFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9zeW1ib2xcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2l0ZXJhdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcblxuICAgICAgX09iamVjdCRkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSkoKTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9BcnJheSRmcm9tID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9hcnJheS9mcm9tXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXG4gICAgcmV0dXJuIGFycjI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIF9BcnJheSRmcm9tKGFycik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5hcnJheS5mcm9tJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuQXJyYXkuZnJvbTsiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yJyk7IiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm1hcCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLnRvLWpzb24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy8kLmNvcmUnKS5NYXA7IiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpe1xuICByZXR1cm4gJC5jcmVhdGUoUCwgRCk7XG59OyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2Mpe1xuICByZXR1cm4gJC5zZXREZXNjKGl0LCBrZXksIGRlc2MpO1xufTsiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYucHJvbWlzZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzLyQuY29yZScpLlByb21pc2U7IiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnNldCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcuc2V0LnRvLWpzb24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy8kLmNvcmUnKS5TZXQ7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuU3ltYm9sOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC53a3MnKSgnaXRlcmF0b3InKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoIWlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJylcbiAgLy8gRVMzIHdyb25nIGhlcmVcbiAgLCBBUkcgPSBjb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IChPID0gT2JqZWN0KGl0KSlbVEFHXSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59OyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgaGlkZSAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIGN0eCAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIHNwZWNpZXMgICAgICA9IHJlcXVpcmUoJy4vJC5zcGVjaWVzJylcbiAgLCBzdHJpY3ROZXcgICAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpXG4gICwgZGVmaW5lZCAgICAgID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKVxuICAsIGZvck9mICAgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHN0ZXAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLXN0ZXAnKVxuICAsIElEICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKSgnaWQnKVxuICAsICRoYXMgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIGlzT2JqZWN0ICAgICA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCBTVVBQT1JUX0RFU0MgPSByZXF1aXJlKCcuLyQuc3VwcG9ydC1kZXNjJylcbiAgLCBTSVpFICAgICAgICAgPSBTVVBQT1JUX0RFU0MgPyAnX3MnIDogJ3NpemUnXG4gICwgaWQgICAgICAgICAgID0gMDtcblxudmFyIGZhc3RLZXkgPSBmdW5jdGlvbihpdCwgY3JlYXRlKXtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZighaXNPYmplY3QoaXQpKXJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCcgPyBpdCA6ICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XG4gIGlmKCEkaGFzKGl0LCBJRCkpe1xuICAgIC8vIGNhbid0IHNldCBpZCB0byBmcm96ZW4gb2JqZWN0XG4gICAgaWYoIWlzRXh0ZW5zaWJsZShpdCkpcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBpZFxuICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBvYmplY3QgaWRcbiAgICBoaWRlKGl0LCBJRCwgKytpZCk7XG4gIC8vIHJldHVybiBvYmplY3QgaWQgd2l0aCBwcmVmaXhcbiAgfSByZXR1cm4gJ08nICsgaXRbSURdO1xufTtcblxudmFyIGdldEVudHJ5ID0gZnVuY3Rpb24odGhhdCwga2V5KXtcbiAgLy8gZmFzdCBjYXNlXG4gIHZhciBpbmRleCA9IGZhc3RLZXkoa2V5KSwgZW50cnk7XG4gIGlmKGluZGV4ICE9PSAnRicpcmV0dXJuIHRoYXQuX2lbaW5kZXhdO1xuICAvLyBmcm96ZW4gb2JqZWN0IGNhc2VcbiAgZm9yKGVudHJ5ID0gdGhhdC5fZjsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgaWYoZW50cnkuayA9PSBrZXkpcmV0dXJuIGVudHJ5O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0Q29uc3RydWN0b3I6IGZ1bmN0aW9uKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpe1xuICAgIHZhciBDID0gd3JhcHBlcihmdW5jdGlvbih0aGF0LCBpdGVyYWJsZSl7XG4gICAgICBzdHJpY3ROZXcodGhhdCwgQywgTkFNRSk7XG4gICAgICB0aGF0Ll9pID0gJC5jcmVhdGUobnVsbCk7IC8vIGluZGV4XG4gICAgICB0aGF0Ll9mID0gdW5kZWZpbmVkOyAgICAgIC8vIGZpcnN0IGVudHJ5XG4gICAgICB0aGF0Ll9sID0gdW5kZWZpbmVkOyAgICAgIC8vIGxhc3QgZW50cnlcbiAgICAgIHRoYXRbU0laRV0gPSAwOyAgICAgICAgICAgLy8gc2l6ZVxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZXF1aXJlKCcuLyQubWl4JykoQy5wcm90b3R5cGUsIHtcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgLy8gMjMuMi4zLjIgU2V0LnByb3RvdHlwZS5jbGVhcigpXG4gICAgICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKXtcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXQuX2ksIGVudHJ5ID0gdGhhdC5fZjsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGRlbGV0ZSBkYXRhW2VudHJ5LmldO1xuICAgICAgICB9XG4gICAgICAgIHRoYXQuX2YgPSB0aGF0Ll9sID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGF0W1NJWkVdID0gMDtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XG4gICAgICAgIGlmKGVudHJ5KXtcbiAgICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XG4gICAgICAgICAgZGVsZXRlIHRoYXQuX2lbZW50cnkuaV07XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYocHJldilwcmV2Lm4gPSBuZXh0O1xuICAgICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcbiAgICAgICAgICBpZih0aGF0Ll9mID09IGVudHJ5KXRoYXQuX2YgPSBuZXh0O1xuICAgICAgICAgIGlmKHRoYXQuX2wgPT0gZW50cnkpdGhhdC5fbCA9IHByZXY7XG4gICAgICAgICAgdGhhdFtTSVpFXS0tO1xuICAgICAgICB9IHJldHVybiAhIWVudHJ5O1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjIuMy42IFNldC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgICAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0sIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzLl9mKXtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKFNVUFBPUlRfREVTQykkLnNldERlc2MoQy5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZGVmaW5lZCh0aGlzW1NJWkVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gQztcbiAgfSxcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpXG4gICAgICAsIHByZXYsIGluZGV4O1xuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxuICAgIGlmKGVudHJ5KXtcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQuX2wgPSBlbnRyeSA9IHtcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICAgIHA6IHByZXYgPSB0aGF0Ll9sLCAgICAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxuICAgICAgfTtcbiAgICAgIGlmKCF0aGF0Ll9mKXRoYXQuX2YgPSBlbnRyeTtcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XG4gICAgICB0aGF0W1NJWkVdKys7XG4gICAgICAvLyBhZGQgdG8gaW5kZXhcbiAgICAgIGlmKGluZGV4ICE9PSAnRicpdGhhdC5faVtpbmRleF0gPSBlbnRyeTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBnZXRFbnRyeTogZ2V0RW50cnksXG4gIHNldFN0cm9uZzogZnVuY3Rpb24oQywgTkFNRSwgSVNfTUFQKXtcbiAgICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cbiAgICAvLyAyMy4xLjMuNCwgMjMuMS4zLjgsIDIzLjEuMy4xMSwgMjMuMS4zLjEyLCAyMy4yLjMuNSwgMjMuMi4zLjgsIDIzLjIuMy4xMCwgMjMuMi4zLjExXG4gICAgcmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoQywgTkFNRSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICAgICAgdGhpcy5fdCA9IGl0ZXJhdGVkOyAgLy8gdGFyZ2V0XG4gICAgICB0aGlzLl9rID0ga2luZDsgICAgICAvLyBraW5kXG4gICAgICB0aGlzLl9sID0gdW5kZWZpbmVkOyAvLyBwcmV2aW91c1xuICAgIH0sIGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICwga2luZCAgPSB0aGF0Ll9rXG4gICAgICAgICwgZW50cnkgPSB0aGF0Ll9sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgIC8vIGdldCBuZXh0IGVudHJ5XG4gICAgICBpZighdGhhdC5fdCB8fCAhKHRoYXQuX2wgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoYXQuX3QuX2YpKXtcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cbiAgICAgICAgdGhhdC5fdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHN0ZXAoMSk7XG4gICAgICB9XG4gICAgICAvLyByZXR1cm4gc3RlcCBieSBraW5kXG4gICAgICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xuICAgICAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycgLCAhSVNfTUFQLCB0cnVlKTtcblxuICAgIC8vIGFkZCBbQEBzcGVjaWVzXSwgMjMuMS4yLjIsIDIzLjIuMi4yXG4gICAgc3BlY2llcyhDKTtcbiAgICBzcGVjaWVzKHJlcXVpcmUoJy4vJC5jb3JlJylbTkFNRV0pOyAvLyBmb3Igd3JhcHBlclxuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciBmb3JPZiAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgY2xhc3NvZiA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUpe1xuICByZXR1cm4gZnVuY3Rpb24gdG9KU09OKCl7XG4gICAgaWYoY2xhc3NvZih0aGlzKSAhPSBOQU1FKXRocm93IFR5cGVFcnJvcihOQU1FICsgXCIjdG9KU09OIGlzbid0IGdlbmVyaWNcIik7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvck9mKHRoaXMsIGZhbHNlLCBhcnIucHVzaCwgYXJyKTtcbiAgICByZXR1cm4gYXJyO1xuICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGhpZGUgICAgICAgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgZm9yT2YgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHN0cmljdE5ldyAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIHdyYXBwZXIsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBJU19XRUFLKXtcbiAgdmFyIEJhc2UgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpW05BTUVdXG4gICAgLCBDICAgICA9IEJhc2VcbiAgICAsIEFEREVSID0gSVNfTUFQID8gJ3NldCcgOiAnYWRkJ1xuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXG4gICAgLCBPICAgICA9IHt9O1xuICBpZighcmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpIHx8IHR5cGVvZiBDICE9ICdmdW5jdGlvbidcbiAgICB8fCAhKElTX1dFQUsgfHwgcHJvdG8uZm9yRWFjaCAmJiAhcmVxdWlyZSgnLi8kLmZhaWxzJykoZnVuY3Rpb24oKXsgbmV3IEMoKS5lbnRyaWVzKCkubmV4dCgpOyB9KSlcbiAgKXtcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3Iod3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUik7XG4gICAgcmVxdWlyZSgnLi8kLm1peCcpKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgfSBlbHNlIHtcbiAgICBDID0gd3JhcHBlcihmdW5jdGlvbih0YXJnZXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0YXJnZXQsIEMsIE5BTUUpO1xuICAgICAgdGFyZ2V0Ll9jID0gbmV3IEJhc2U7XG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGFyZ2V0W0FEREVSXSwgdGFyZ2V0KTtcbiAgICB9KTtcbiAgICAkLmVhY2guY2FsbCgnYWRkLGNsZWFyLGRlbGV0ZSxmb3JFYWNoLGdldCxoYXMsc2V0LGtleXMsdmFsdWVzLGVudHJpZXMnLnNwbGl0KCcsJyksZnVuY3Rpb24oS0VZKXtcbiAgICAgIHZhciBjaGFpbiA9IEtFWSA9PSAnYWRkJyB8fCBLRVkgPT0gJ3NldCc7XG4gICAgICBpZihLRVkgaW4gcHJvdG8gJiYgIShJU19XRUFLICYmIEtFWSA9PSAnY2xlYXInKSloaWRlKEMucHJvdG90eXBlLCBLRVksIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY1tLRVldKGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBjaGFpbiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZignc2l6ZScgaW4gcHJvdG8pJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Muc2l6ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlcXVpcmUoJy4vJC50YWcnKShDLCBOQU1FKTtcblxuICBPW05BTUVdID0gQztcbiAgJGRlZigkZGVmLkcgKyAkZGVmLlcgKyAkZGVmLkYsIE8pO1xuXG4gIGlmKCFJU19XRUFLKWNvbW1vbi5zZXRTdHJvbmcoQywgTkFNRSwgSVNfTUFQKTtcblxuICByZXR1cm4gQztcbn07IiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi8kLmEtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9IHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICAgIH07XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgY3R4ID0gZnVuY3Rpb24oZm4sIHRoYXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG52YXIgJGRlZiA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHBcbiAgICAsIGlzR2xvYmFsID0gdHlwZSAmICRkZWYuR1xuICAgICwgaXNQcm90byAgPSB0eXBlICYgJGRlZi5QXG4gICAgLCB0YXJnZXQgICA9IGlzR2xvYmFsID8gZ2xvYmFsIDogdHlwZSAmICRkZWYuU1xuICAgICAgICA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGV4cG9ydHMgID0gaXNHbG9iYWwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgaWYoaXNHbG9iYWwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICEodHlwZSAmICRkZWYuRikgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XG4gICAgaWYob3duICYmIGtleSBpbiBleHBvcnRzKWNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBpZihpc0dsb2JhbCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJylleHAgPSBzb3VyY2Vba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGVsc2UgaWYodHlwZSAmICRkZWYuQiAmJiBvd24pZXhwID0gY3R4KG91dCwgZ2xvYmFsKTtcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxuICAgIGVsc2UgaWYodHlwZSAmICRkZWYuVyAmJiB0YXJnZXRba2V5XSA9PSBvdXQpIWZ1bmN0aW9uKEMpe1xuICAgICAgZXhwID0gZnVuY3Rpb24ocGFyYW0pe1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEMgPyBuZXcgQyhwYXJhbSkgOiBDKHBhcmFtKTtcbiAgICAgIH07XG4gICAgICBleHBbUFJPVE9UWVBFXSA9IENbUFJPVE9UWVBFXTtcbiAgICB9KG91dCk7XG4gICAgZWxzZSBleHAgPSBpc1Byb3RvICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4cG9ydFxuICAgIGV4cG9ydHNba2V5XSA9IGV4cDtcbiAgICBpZihpc1Byb3RvKShleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KSlba2V5XSA9IG91dDtcbiAgfVxufTtcbi8vIHR5cGUgYml0bWFwXG4kZGVmLkYgPSAxOyAgLy8gZm9yY2VkXG4kZGVmLkcgPSAyOyAgLy8gZ2xvYmFsXG4kZGVmLlMgPSA0OyAgLy8gc3RhdGljXG4kZGVmLlAgPSA4OyAgLy8gcHJvdG9cbiRkZWYuQiA9IDE2OyAvLyBiaW5kXG4kZGVmLlcgPSAzMjsgLy8gd3JhcFxubW9kdWxlLmV4cG9ydHMgPSAkZGVmOyIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0JylcbiAgLCBkb2N1bWVudCA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKS5kb2N1bWVudFxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcbiAgLCBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTsiLCIvLyBhbGwgZW51bWVyYWJsZSBvYmplY3Qga2V5cywgaW5jbHVkZXMgc3ltYm9sc1xudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIga2V5cyAgICAgICA9ICQuZ2V0S2V5cyhpdClcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHM7XG4gIGlmKGdldFN5bWJvbHMpe1xuICAgIHZhciBzeW1ib2xzID0gZ2V0U3ltYm9scyhpdClcbiAgICAgICwgaXNFbnVtICA9ICQuaXNFbnVtXG4gICAgICAsIGkgICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShzeW1ib2xzLmxlbmd0aCA+IGkpaWYoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpa2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsInZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuLyQuaXMtYXJyYXktaXRlcicpXG4gICwgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgICA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldEl0ZXJGbihpdGVyYWJsZSlcbiAgICAsIGYgICAgICA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxuICAgICwgaW5kZXggID0gMFxuICAgICwgbGVuZ3RoLCBzdGVwLCBpdGVyYXRvcjtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYoaXNBcnJheUl0ZXIoaXRlckZuKSlmb3IobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgIGVudHJpZXMgPyBmKGFuT2JqZWN0KHN0ZXAgPSBpdGVyYWJsZVtpbmRleF0pWzBdLCBzdGVwWzFdKSA6IGYoaXRlcmFibGVbaW5kZXhdKTtcbiAgfSBlbHNlIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKGl0ZXJhYmxlKTsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyApe1xuICAgIGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpO1xuICB9XG59OyIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b1N0cmluZyAgPSB7fS50b1N0cmluZ1xuICAsIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0JylcbiAgLCBnZXROYW1lcyAgPSByZXF1aXJlKCcuLyQnKS5nZXROYW1lcztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24oaXQpe1xuICB0cnkge1xuICAgIHJldHVybiBnZXROYW1lcyhpdCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICBpZih3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJylyZXR1cm4gZ2V0V2luZG93TmFtZXMoaXQpO1xuICByZXR1cm4gZ2V0TmFtZXModG9JT2JqZWN0KGl0KSk7XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgVU5ERUZJTkVEID0gJ3VuZGVmaW5lZCc7XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9IFVOREVGSU5FRCAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gVU5ERUZJTkVEICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59OyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi8kLnByb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpLmRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsiLCIvLyBmYXN0IGFwcGx5LCBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIGFyZ3MsIHRoYXQpe1xuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XG4gIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gIH0gcmV0dXJuICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzKTtcbn07IiwiLy8gaW5kZXhlZCBvYmplY3QsIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gMCBpbiBPYmplY3QoJ3onKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTsiLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiAoSXRlcmF0b3JzLkFycmF5IHx8IEFycmF5LnByb3RvdHlwZVtJVEVSQVRPUl0pID09PSBpdDtcbn07IiwiLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCAhPT0gbnVsbCAmJiAodHlwZW9mIGl0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nKTtcbn07IiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoKGUpe1xuICAgIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gICAgaWYocmV0ICE9PSB1bmRlZmluZWQpYW5PYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi8kJylcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLmhpZGUnKShJdGVyYXRvclByb3RvdHlwZSwgcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpe1xuICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSAkLmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSwge25leHQ6IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJykoMSxuZXh0KX0pO1xuICByZXF1aXJlKCcuLyQudGFnJykoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBMSUJSQVJZICAgICAgICAgPSByZXF1aXJlKCcuLyQubGlicmFyeScpXG4gICwgJGRlZiAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHJlZGVmICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmJylcbiAgLCBoaWRlICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgaGFzICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgU1lNQk9MX0lURVJBVE9SID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgSXRlcmF0b3JzICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgQlVHR1kgICAgICAgICAgID0gIShbXS5rZXlzICYmICduZXh0JyBpbiBbXS5rZXlzKCkpIC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgLCBGRl9JVEVSQVRPUiAgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICAgPSAna2V5cydcbiAgLCBWQUxVRVMgICAgICAgICAgPSAndmFsdWVzJztcbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH07XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFKXtcbiAgcmVxdWlyZSgnLi8kLml0ZXItY3JlYXRlJykoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24oa2luZCl7XG4gICAgc3dpdGNoKGtpbmQpe1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gIH07XG4gIHZhciBUQUcgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgcHJvdG8gICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgX25hdGl2ZSAgPSBwcm90b1tTWU1CT0xfSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXG4gICAgLCBfZGVmYXVsdCA9IF9uYXRpdmUgfHwgY3JlYXRlTWV0aG9kKERFRkFVTFQpXG4gICAgLCBtZXRob2RzLCBrZXk7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoX25hdGl2ZSl7XG4gICAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0gcmVxdWlyZSgnLi8kJykuZ2V0UHJvdG8oX2RlZmF1bHQuY2FsbChuZXcgQmFzZSkpO1xuICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICByZXF1aXJlKCcuLyQudGFnJykoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgLy8gRkYgZml4XG4gICAgaWYoIUxJQlJBUlkgJiYgaGFzKHByb3RvLCBGRl9JVEVSQVRPUikpaGlkZShJdGVyYXRvclByb3RvdHlwZSwgU1lNQk9MX0lURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgfVxuICAvLyBEZWZpbmUgaXRlcmF0b3JcbiAgaWYoIUxJQlJBUlkgfHwgRk9SQ0UpaGlkZShwcm90bywgU1lNQk9MX0lURVJBVE9SLCBfZGVmYXVsdCk7XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gX2RlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9IHJldHVyblRoaXM7XG4gIGlmKERFRkFVTFQpe1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICBrZXlzOiAgICBJU19TRVQgICAgICAgICAgICA/IF9kZWZhdWx0IDogY3JlYXRlTWV0aG9kKEtFWVMpLFxuICAgICAgdmFsdWVzOiAgREVGQVVMVCA9PSBWQUxVRVMgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZChWQUxVRVMpLFxuICAgICAgZW50cmllczogREVGQVVMVCAhPSBWQUxVRVMgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZCgnZW50cmllcycpXG4gICAgfTtcbiAgICBpZihGT1JDRSlmb3Ioa2V5IGluIG1ldGhvZHMpe1xuICAgICAgaWYoIShrZXkgaW4gcHJvdG8pKSRyZWRlZihwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZGVmKCRkZWYuUCArICRkZWYuRiAqIEJVR0dZLCBOQU1FLCBtZXRob2RzKTtcbiAgfVxufTsiLCJ2YXIgU1lNQk9MX0lURVJBVE9SID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgU0FGRV9DTE9TSU5HICAgID0gZmFsc2U7XG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bU1lNQk9MX0lURVJBVE9SXSgpO1xuICByaXRlclsncmV0dXJuJ10gPSBmdW5jdGlvbigpeyBTQUZFX0NMT1NJTkcgPSB0cnVlOyB9O1xuICBBcnJheS5mcm9tKHJpdGVyLCBmdW5jdGlvbigpeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIGlmKCFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbU1lNQk9MX0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uKCl7IHNhZmUgPSB0cnVlOyB9O1xuICAgIGFycltTWU1CT0xfSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge307IiwidmFyICRPYmplY3QgPSBPYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiAgICAgJE9iamVjdC5jcmVhdGUsXG4gIGdldFByb3RvOiAgICRPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIGlzRW51bTogICAgIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLFxuICBnZXREZXNjOiAgICAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgc2V0RGVzYzogICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxuICBnZXRLZXlzOiAgICAkT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgICRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogJE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXG4gIGVhY2g6ICAgICAgIFtdLmZvckVhY2hcbn07IiwidmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLWlvYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBlbCl7XG4gIHZhciBPICAgICAgPSB0b0lPYmplY3Qob2JqZWN0KVxuICAgICwga2V5cyAgID0gJC5nZXRLZXlzKE8pXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICwgaW5kZXggID0gMFxuICAgICwga2V5O1xuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7IiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxyXG4gICwgbWFjcm90YXNrID0gcmVxdWlyZSgnLi8kLnRhc2snKS5zZXRcclxuICAsIE9ic2VydmVyICA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyXHJcbiAgLCBwcm9jZXNzICAgPSBnbG9iYWwucHJvY2Vzc1xyXG4gICwgaXNOb2RlICAgID0gcmVxdWlyZSgnLi8kLmNvZicpKHByb2Nlc3MpID09ICdwcm9jZXNzJ1xyXG4gICwgaGVhZCwgbGFzdCwgbm90aWZ5O1xyXG5cclxudmFyIGZsdXNoID0gZnVuY3Rpb24oKXtcclxuICB2YXIgcGFyZW50LCBkb21haW47XHJcbiAgaWYoaXNOb2RlICYmIChwYXJlbnQgPSBwcm9jZXNzLmRvbWFpbikpe1xyXG4gICAgcHJvY2Vzcy5kb21haW4gPSBudWxsO1xyXG4gICAgcGFyZW50LmV4aXQoKTtcclxuICB9XHJcbiAgd2hpbGUoaGVhZCl7XHJcbiAgICBkb21haW4gPSBoZWFkLmRvbWFpbjtcclxuICAgIGlmKGRvbWFpbilkb21haW4uZW50ZXIoKTtcclxuICAgIGhlYWQuZm4uY2FsbCgpOyAvLyA8LSBjdXJyZW50bHkgd2UgdXNlIGl0IG9ubHkgZm9yIFByb21pc2UgLSB0cnkgLyBjYXRjaCBub3QgcmVxdWlyZWRcclxuICAgIGlmKGRvbWFpbilkb21haW4uZXhpdCgpO1xyXG4gICAgaGVhZCA9IGhlYWQubmV4dDtcclxuICB9IGxhc3QgPSB1bmRlZmluZWQ7XHJcbiAgaWYocGFyZW50KXBhcmVudC5lbnRlcigpO1xyXG59XHJcblxyXG4vLyBOb2RlLmpzXHJcbmlmKGlzTm9kZSl7XHJcbiAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcclxuICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xyXG4gIH07XHJcbi8vIGJyb3dzZXJzIHdpdGggTXV0YXRpb25PYnNlcnZlclxyXG59IGVsc2UgaWYoT2JzZXJ2ZXIpe1xyXG4gIHZhciB0b2dnbGUgPSAxXHJcbiAgICAsIG5vZGUgICA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcclxuICBuZXcgT2JzZXJ2ZXIoZmx1c2gpLm9ic2VydmUobm9kZSwge2NoYXJhY3RlckRhdGE6IHRydWV9KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcclxuICBub3RpZnkgPSBmdW5jdGlvbigpe1xyXG4gICAgbm9kZS5kYXRhID0gdG9nZ2xlID0gLXRvZ2dsZTtcclxuICB9O1xyXG4vLyBmb3Igb3RoZXIgZW52aXJvbm1lbnRzIC0gbWFjcm90YXNrIGJhc2VkIG9uOlxyXG4vLyAtIHNldEltbWVkaWF0ZVxyXG4vLyAtIE1lc3NhZ2VDaGFubmVsXHJcbi8vIC0gd2luZG93LnBvc3RNZXNzYWdcclxuLy8gLSBvbnJlYWR5c3RhdGVjaGFuZ2VcclxuLy8gLSBzZXRUaW1lb3V0XHJcbn0gZWxzZSB7XHJcbiAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcclxuICAgIC8vIHN0cmFuZ2UgSUUgKyB3ZWJwYWNrIGRldiBzZXJ2ZXIgYnVnIC0gdXNlIC5jYWxsKGdsb2JhbClcclxuICAgIG1hY3JvdGFzay5jYWxsKGdsb2JhbCwgZmx1c2gpO1xyXG4gIH07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXNhcChmbil7XHJcbiAgdmFyIHRhc2sgPSB7Zm46IGZuLCBuZXh0OiB1bmRlZmluZWQsIGRvbWFpbjogaXNOb2RlICYmIHByb2Nlc3MuZG9tYWlufTtcclxuICBpZihsYXN0KWxhc3QubmV4dCA9IHRhc2s7XHJcbiAgaWYoIWhlYWQpe1xyXG4gICAgaGVhZCA9IHRhc2s7XHJcbiAgICBub3RpZnkoKTtcclxuICB9IGxhc3QgPSB0YXNrO1xyXG59OyIsInZhciAkcmVkZWYgPSByZXF1aXJlKCcuLyQucmVkZWYnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0LCBzcmMpe1xuICBmb3IodmFyIGtleSBpbiBzcmMpJHJlZGVmKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XG4gIHJldHVybiB0YXJnZXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5oaWRlJyk7IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuaXMgfHwgZnVuY3Rpb24gaXMoeCwgeSl7XG4gIHJldHVybiB4ID09PSB5ID8geCAhPT0gMCB8fCAxIC8geCA9PT0gMSAvIHkgOiB4ICE9IHggJiYgeSAhPSB5O1xufTsiLCIvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29yayB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG52YXIgZ2V0RGVzYyAgPSByZXF1aXJlKCcuLyQnKS5nZXREZXNjXG4gICwgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0JylcbiAgLCBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKTtcbnZhciBjaGVjayA9IGZ1bmN0aW9uKE8sIHByb3RvKXtcbiAgYW5PYmplY3QoTyk7XG4gIGlmKCFpc09iamVjdChwcm90bykgJiYgcHJvdG8gIT09IG51bGwpdGhyb3cgVHlwZUVycm9yKHByb3RvICsgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xufTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgID8gZnVuY3Rpb24oYnVnZ3ksIHNldCl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsIGdldERlc2MoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgICAgc2V0KHt9LCBbXSk7XG4gICAgICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZTsgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xuICAgICAgICAgIGNoZWNrKE8sIHByb3RvKTtcbiAgICAgICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcbiAgICAgICAgICByZXR1cm4gTztcbiAgICAgICAgfTtcbiAgICAgIH0oKVxuICAgIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59OyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJ1xuICAsIHN0b3JlICA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB7fSk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBTUEVDSUVTID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEMpe1xuICBpZihyZXF1aXJlKCcuLyQuc3VwcG9ydC1kZXNjJykgJiYgIShTUEVDSUVTIGluIEMpKSQuc2V0RGVzYyhDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH1cbiAgfSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl0aHJvdyBUeXBlRXJyb3IobmFtZSArIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xuICByZXR1cm4gZnVuY3Rpb24odGhhdCwgcG9zKXtcbiAgICB2YXIgcyA9IFN0cmluZyhkZWZpbmVkKHRoYXQpKVxuICAgICAgLCBpID0gdG9JbnRlZ2VyKHBvcylcbiAgICAgICwgbCA9IHMubGVuZ3RoXG4gICAgICAsIGEsIGI7XG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGxcbiAgICAgIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07IiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi8kLmZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsInZhciBoYXMgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgaGlkZSA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCBUQUcgID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCB0YWcsIHN0YXQpe1xuICBpZihpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKWhpZGUoaXQsIFRBRywgdGFnKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGN0eCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGludm9rZSAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxuICAsIGh0bWwgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5odG1sJylcbiAgLCBjZWwgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZG9tLWNyZWF0ZScpXG4gICwgZ2xvYmFsICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgcHJvY2VzcyAgICAgICAgICAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBzZXRUYXNrICAgICAgICAgICAgPSBnbG9iYWwuc2V0SW1tZWRpYXRlXG4gICwgY2xlYXJUYXNrICAgICAgICAgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXG4gICwgTWVzc2FnZUNoYW5uZWwgICAgID0gZ2xvYmFsLk1lc3NhZ2VDaGFubmVsXG4gICwgY291bnRlciAgICAgICAgICAgID0gMFxuICAsIHF1ZXVlICAgICAgICAgICAgICA9IHt9XG4gICwgT05SRUFEWVNUQVRFQ0hBTkdFID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSdcbiAgLCBkZWZlciwgY2hhbm5lbCwgcG9ydDtcbnZhciBydW4gPSBmdW5jdGlvbigpe1xuICB2YXIgaWQgPSArdGhpcztcbiAgaWYocXVldWUuaGFzT3duUHJvcGVydHkoaWQpKXtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgICBmbigpO1xuICB9XG59O1xudmFyIGxpc3RuZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xufTtcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcbmlmKCFzZXRUYXNrIHx8ICFjbGVhclRhc2spe1xuICBzZXRUYXNrID0gZnVuY3Rpb24gc2V0SW1tZWRpYXRlKGZuKXtcbiAgICB2YXIgYXJncyA9IFtdLCBpID0gMTtcbiAgICB3aGlsZShhcmd1bWVudHMubGVuZ3RoID4gaSlhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbigpe1xuICAgICAgaW52b2tlKHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nID8gZm4gOiBGdW5jdGlvbihmbiksIGFyZ3MpO1xuICAgIH07XG4gICAgZGVmZXIoY291bnRlcik7XG4gICAgcmV0dXJuIGNvdW50ZXI7XG4gIH07XG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGlkKXtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICB9O1xuICAvLyBOb2RlLmpzIDAuOC1cbiAgaWYocmVxdWlyZSgnLi8kLmNvZicpKHByb2Nlc3MpID09ICdwcm9jZXNzJyl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGN0eChydW4sIGlkLCAxKSk7XG4gICAgfTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBNZXNzYWdlQ2hhbm5lbCwgaW5jbHVkZXMgV2ViV29ya2Vyc1xuICB9IGVsc2UgaWYoTWVzc2FnZUNoYW5uZWwpe1xuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgcG9ydCAgICA9IGNoYW5uZWwucG9ydDI7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0bmVyO1xuICAgIGRlZmVyID0gY3R4KHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xuICAvLyBCcm93c2VycyB3aXRoIHBvc3RNZXNzYWdlLCBza2lwIFdlYldvcmtlcnNcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgJ29iamVjdCdcbiAgfSBlbHNlIGlmKGdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmIHR5cGVvZiBwb3N0TWVzc2FnZSA9PSAnZnVuY3Rpb24nICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0KXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShpZCArICcnLCAnKicpO1xuICAgIH07XG4gICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0bmVyLCBmYWxzZSk7XG4gIC8vIElFOC1cbiAgfSBlbHNlIGlmKE9OUkVBRFlTVEFURUNIQU5HRSBpbiBjZWwoJ3NjcmlwdCcpKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIHJ1bi5jYWxsKGlkKTtcbiAgICAgIH07XG4gICAgfTtcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcbiAgfSBlbHNlIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcbiAgICB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiAgIHNldFRhc2ssXG4gIGNsZWFyOiBjbGVhclRhc2tcbn07IiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59OyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xyXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vJC5pb2JqZWN0JylcclxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcclxuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XHJcbn07IiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi8kLnRvLWludGVnZXInKVxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59OyIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07IiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9OyIsInZhciBzdG9yZSAgPSByZXF1aXJlKCcuLyQuc2hhcmVkJykoJ3drcycpXG4gICwgU3ltYm9sID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpLlN5bWJvbDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFN5bWJvbCAmJiBTeW1ib2xbbmFtZV0gfHwgKFN5bWJvbCB8fCByZXF1aXJlKCcuLyQudWlkJykpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07IiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ICE9IHVuZGVmaW5lZClyZXR1cm4gaXRbSVRFUkFUT1JdIHx8IGl0WydAQGl0ZXJhdG9yJ10gfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07IiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpXG4gICwgZ2V0ICAgICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuY29yZScpLmdldEl0ZXJhdG9yID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgaXRlckZuID0gZ2V0KGl0KTtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICByZXR1cm4gYW5PYmplY3QoaXRlckZuLmNhbGwoaXQpKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgJGRlZiAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b09iamVjdCAgICA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuLyQuaXMtYXJyYXktaXRlcicpXG4gICwgdG9MZW5ndGggICAgPSByZXF1aXJlKCcuLyQudG8tbGVuZ3RoJylcbiAgLCBnZXRJdGVyRm4gICA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgQXJyYXkuZnJvbShpdGVyKTsgfSksICdBcnJheScsIHtcbiAgLy8gMjIuMS4yLjEgQXJyYXkuZnJvbShhcnJheUxpa2UsIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICBmcm9tOiBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZS8qLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCovKXtcbiAgICB2YXIgTyAgICAgICA9IHRvT2JqZWN0KGFycmF5TGlrZSlcbiAgICAgICwgQyAgICAgICA9IHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXlcbiAgICAgICwgbWFwZm4gICA9IGFyZ3VtZW50c1sxXVxuICAgICAgLCBtYXBwaW5nID0gbWFwZm4gIT09IHVuZGVmaW5lZFxuICAgICAgLCBpbmRleCAgID0gMFxuICAgICAgLCBpdGVyRm4gID0gZ2V0SXRlckZuKE8pXG4gICAgICAsIGxlbmd0aCwgcmVzdWx0LCBzdGVwLCBpdGVyYXRvcjtcbiAgICBpZihtYXBwaW5nKW1hcGZuID0gY3R4KG1hcGZuLCBhcmd1bWVudHNbMl0sIDIpO1xuICAgIC8vIGlmIG9iamVjdCBpc24ndCBpdGVyYWJsZSBvciBpdCdzIGFycmF5IHdpdGggZGVmYXVsdCBpdGVyYXRvciAtIHVzZSBzaW1wbGUgY2FzZVxuICAgIGlmKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKXtcbiAgICAgIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKE8pLCByZXN1bHQgPSBuZXcgQzsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBtYXBmbiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IocmVzdWx0ID0gbmV3IEMobGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciBzZXRVbnNjb3BlID0gcmVxdWlyZSgnLi8kLnVuc2NvcGUnKVxuICAsIHN0ZXAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1zdGVwJylcbiAgLCBJdGVyYXRvcnMgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgdG9JT2JqZWN0ICA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwga2luZCAgPSB0aGlzLl9rXG4gICAgLCBpbmRleCA9IHRoaXMuX2krKztcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbnNldFVuc2NvcGUoJ2tleXMnKTtcbnNldFVuc2NvcGUoJ3ZhbHVlcycpO1xuc2V0VW5zY29wZSgnZW50cmllcycpOyIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMSBNYXAgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnTWFwJywgZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIE1hcCgpeyByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50c1swXSk7IH07XG59LCB7XG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudjtcbiAgfSxcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpOyIsbnVsbCwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIExJQlJBUlkgICAgPSByZXF1aXJlKCcuLyQubGlicmFyeScpXG4gICwgZ2xvYmFsICAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIGN0eCAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBjbGFzc29mICAgID0gcmVxdWlyZSgnLi8kLmNsYXNzb2YnKVxuICAsICRkZWYgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBpc09iamVjdCAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgYW5PYmplY3QgICA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIGFGdW5jdGlvbiAgPSByZXF1aXJlKCcuLyQuYS1mdW5jdGlvbicpXG4gICwgc3RyaWN0TmV3ICA9IHJlcXVpcmUoJy4vJC5zdHJpY3QtbmV3JylcbiAgLCBmb3JPZiAgICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgc2V0UHJvdG8gICA9IHJlcXVpcmUoJy4vJC5zZXQtcHJvdG8nKS5zZXRcbiAgLCBzYW1lICAgICAgID0gcmVxdWlyZSgnLi8kLnNhbWUnKVxuICAsIHNwZWNpZXMgICAgPSByZXF1aXJlKCcuLyQuc3BlY2llcycpXG4gICwgU1BFQ0lFUyAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnc3BlY2llcycpXG4gICwgUkVDT1JEICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKSgncmVjb3JkJylcbiAgLCBhc2FwICAgICAgID0gcmVxdWlyZSgnLi8kLm1pY3JvdGFzaycpXG4gICwgUFJPTUlTRSAgICA9ICdQcm9taXNlJ1xuICAsIHByb2Nlc3MgICAgPSBnbG9iYWwucHJvY2Vzc1xuICAsIGlzTm9kZSAgICAgPSBjbGFzc29mKHByb2Nlc3MpID09ICdwcm9jZXNzJ1xuICAsIFAgICAgICAgICAgPSBnbG9iYWxbUFJPTUlTRV1cbiAgLCBXcmFwcGVyO1xuXG52YXIgdGVzdFJlc29sdmUgPSBmdW5jdGlvbihzdWIpe1xuICB2YXIgdGVzdCA9IG5ldyBQKGZ1bmN0aW9uKCl7fSk7XG4gIGlmKHN1Yil0ZXN0LmNvbnN0cnVjdG9yID0gT2JqZWN0O1xuICByZXR1cm4gUC5yZXNvbHZlKHRlc3QpID09PSB0ZXN0O1xufTtcblxudmFyIHVzZU5hdGl2ZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciB3b3JrcyA9IGZhbHNlO1xuICBmdW5jdGlvbiBQMih4KXtcbiAgICB2YXIgc2VsZiA9IG5ldyBQKHgpO1xuICAgIHNldFByb3RvKHNlbGYsIFAyLnByb3RvdHlwZSk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cbiAgdHJ5IHtcbiAgICB3b3JrcyA9IFAgJiYgUC5yZXNvbHZlICYmIHRlc3RSZXNvbHZlKCk7XG4gICAgc2V0UHJvdG8oUDIsIFApO1xuICAgIFAyLnByb3RvdHlwZSA9ICQuY3JlYXRlKFAucHJvdG90eXBlLCB7Y29uc3RydWN0b3I6IHt2YWx1ZTogUDJ9fSk7XG4gICAgLy8gYWN0dWFsIEZpcmVmb3ggaGFzIGJyb2tlbiBzdWJjbGFzcyBzdXBwb3J0LCB0ZXN0IHRoYXRcbiAgICBpZighKFAyLnJlc29sdmUoNSkudGhlbihmdW5jdGlvbigpe30pIGluc3RhbmNlb2YgUDIpKXtcbiAgICAgIHdvcmtzID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIGFjdHVhbCBWOCBidWcsIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTYyXG4gICAgaWYod29ya3MgJiYgcmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpKXtcbiAgICAgIHZhciB0aGVuYWJsZVRoZW5Hb3R0ZW4gPSBmYWxzZTtcbiAgICAgIFAucmVzb2x2ZSgkLnNldERlc2Moe30sICd0aGVuJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7IHRoZW5hYmxlVGhlbkdvdHRlbiA9IHRydWU7IH1cbiAgICAgIH0pKTtcbiAgICAgIHdvcmtzID0gdGhlbmFibGVUaGVuR290dGVuO1xuICAgIH1cbiAgfSBjYXRjaChlKXsgd29ya3MgPSBmYWxzZTsgfVxuICByZXR1cm4gd29ya3M7XG59KCk7XG5cbi8vIGhlbHBlcnNcbnZhciBpc1Byb21pc2UgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpc09iamVjdChpdCkgJiYgKHVzZU5hdGl2ZSA/IGNsYXNzb2YoaXQpID09ICdQcm9taXNlJyA6IFJFQ09SRCBpbiBpdCk7XG59O1xudmFyIHNhbWVDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKGEsIGIpe1xuICAvLyBsaWJyYXJ5IHdyYXBwZXIgc3BlY2lhbCBjYXNlXG4gIGlmKExJQlJBUlkgJiYgYSA9PT0gUCAmJiBiID09PSBXcmFwcGVyKXJldHVybiB0cnVlO1xuICByZXR1cm4gc2FtZShhLCBiKTtcbn07XG52YXIgZ2V0Q29uc3RydWN0b3IgPSBmdW5jdGlvbihDKXtcbiAgdmFyIFMgPSBhbk9iamVjdChDKVtTUEVDSUVTXTtcbiAgcmV0dXJuIFMgIT0gdW5kZWZpbmVkID8gUyA6IEM7XG59O1xudmFyIGlzVGhlbmFibGUgPSBmdW5jdGlvbihpdCl7XG4gIHZhciB0aGVuO1xuICByZXR1cm4gaXNPYmplY3QoaXQpICYmIHR5cGVvZiAodGhlbiA9IGl0LnRoZW4pID09ICdmdW5jdGlvbicgPyB0aGVuIDogZmFsc2U7XG59O1xudmFyIG5vdGlmeSA9IGZ1bmN0aW9uKHJlY29yZCwgaXNSZWplY3Qpe1xuICBpZihyZWNvcmQubilyZXR1cm47XG4gIHJlY29yZC5uID0gdHJ1ZTtcbiAgdmFyIGNoYWluID0gcmVjb3JkLmM7XG4gIGFzYXAoZnVuY3Rpb24oKXtcbiAgICB2YXIgdmFsdWUgPSByZWNvcmQudlxuICAgICAgLCBvayAgICA9IHJlY29yZC5zID09IDFcbiAgICAgICwgaSAgICAgPSAwO1xuICAgIHZhciBydW4gPSBmdW5jdGlvbihyZWFjdCl7XG4gICAgICB2YXIgY2IgPSBvayA/IHJlYWN0Lm9rIDogcmVhY3QuZmFpbFxuICAgICAgICAsIHJldCwgdGhlbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKGNiKXtcbiAgICAgICAgICBpZighb2spcmVjb3JkLmggPSB0cnVlO1xuICAgICAgICAgIHJldCA9IGNiID09PSB0cnVlID8gdmFsdWUgOiBjYih2YWx1ZSk7XG4gICAgICAgICAgaWYocmV0ID09PSByZWFjdC5QKXtcbiAgICAgICAgICAgIHJlYWN0LnJlaihUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJldCkpe1xuICAgICAgICAgICAgdGhlbi5jYWxsKHJldCwgcmVhY3QucmVzLCByZWFjdC5yZWopO1xuICAgICAgICAgIH0gZWxzZSByZWFjdC5yZXMocmV0KTtcbiAgICAgICAgfSBlbHNlIHJlYWN0LnJlaih2YWx1ZSk7XG4gICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgIHJlYWN0LnJlaihlcnIpO1xuICAgICAgfVxuICAgIH07XG4gICAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSlydW4oY2hhaW5baSsrXSk7IC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXG4gICAgY2hhaW4ubGVuZ3RoID0gMDtcbiAgICByZWNvcmQubiA9IGZhbHNlO1xuICAgIGlmKGlzUmVqZWN0KXNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGlmKGlzVW5oYW5kbGVkKHJlY29yZC5wKSl7XG4gICAgICAgIGlmKGlzTm9kZSl7XG4gICAgICAgICAgcHJvY2Vzcy5lbWl0KCd1bmhhbmRsZWRSZWplY3Rpb24nLCB2YWx1ZSwgcmVjb3JkLnApO1xuICAgICAgICB9IGVsc2UgaWYoZ2xvYmFsLmNvbnNvbGUgJiYgY29uc29sZS5lcnJvcil7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IHJlY29yZC5hID0gdW5kZWZpbmVkO1xuICAgIH0sIDEpO1xuICB9KTtcbn07XG52YXIgaXNVbmhhbmRsZWQgPSBmdW5jdGlvbihwcm9taXNlKXtcbiAgdmFyIHJlY29yZCA9IHByb21pc2VbUkVDT1JEXVxuICAgICwgY2hhaW4gID0gcmVjb3JkLmEgfHwgcmVjb3JkLmNcbiAgICAsIGkgICAgICA9IDBcbiAgICAsIHJlYWN0O1xuICBpZihyZWNvcmQuaClyZXR1cm4gZmFsc2U7XG4gIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpe1xuICAgIHJlYWN0ID0gY2hhaW5baSsrXTtcbiAgICBpZihyZWFjdC5mYWlsIHx8ICFpc1VuaGFuZGxlZChyZWFjdC5QKSlyZXR1cm4gZmFsc2U7XG4gIH0gcmV0dXJuIHRydWU7XG59O1xudmFyICRyZWplY3QgPSBmdW5jdGlvbih2YWx1ZSl7XG4gIHZhciByZWNvcmQgPSB0aGlzO1xuICBpZihyZWNvcmQuZClyZXR1cm47XG4gIHJlY29yZC5kID0gdHJ1ZTtcbiAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcbiAgcmVjb3JkLnYgPSB2YWx1ZTtcbiAgcmVjb3JkLnMgPSAyO1xuICByZWNvcmQuYSA9IHJlY29yZC5jLnNsaWNlKCk7XG4gIG5vdGlmeShyZWNvcmQsIHRydWUpO1xufTtcbnZhciAkcmVzb2x2ZSA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdmFyIHJlY29yZCA9IHRoaXNcbiAgICAsIHRoZW47XG4gIGlmKHJlY29yZC5kKXJldHVybjtcbiAgcmVjb3JkLmQgPSB0cnVlO1xuICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxuICB0cnkge1xuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XG4gICAgICBhc2FwKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB3cmFwcGVyID0ge3I6IHJlY29yZCwgZDogZmFsc2V9OyAvLyB3cmFwXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgoJHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgoJHJlamVjdCwgd3JhcHBlciwgMSkpO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICRyZWplY3QuY2FsbCh3cmFwcGVyLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZC52ID0gdmFsdWU7XG4gICAgICByZWNvcmQucyA9IDE7XG4gICAgICBub3RpZnkocmVjb3JkLCBmYWxzZSk7XG4gICAgfVxuICB9IGNhdGNoKGUpe1xuICAgICRyZWplY3QuY2FsbCh7cjogcmVjb3JkLCBkOiBmYWxzZX0sIGUpOyAvLyB3cmFwXG4gIH1cbn07XG5cbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXG5pZighdXNlTmF0aXZlKXtcbiAgLy8gMjUuNC4zLjEgUHJvbWlzZShleGVjdXRvcilcbiAgUCA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xuICAgIGFGdW5jdGlvbihleGVjdXRvcik7XG4gICAgdmFyIHJlY29yZCA9IHtcbiAgICAgIHA6IHN0cmljdE5ldyh0aGlzLCBQLCBQUk9NSVNFKSwgICAgICAgICAvLyA8LSBwcm9taXNlXG4gICAgICBjOiBbXSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gYXdhaXRpbmcgcmVhY3Rpb25zXG4gICAgICBhOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gY2hlY2tlZCBpbiBpc1VuaGFuZGxlZCByZWFjdGlvbnNcbiAgICAgIHM6IDAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBzdGF0ZVxuICAgICAgZDogZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGRvbmVcbiAgICAgIHY6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxuICAgICAgaDogZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGhhbmRsZWQgcmVqZWN0aW9uXG4gICAgICBuOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gbm90aWZ5XG4gICAgfTtcbiAgICB0aGlzW1JFQ09SRF0gPSByZWNvcmQ7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWN1dG9yKGN0eCgkcmVzb2x2ZSwgcmVjb3JkLCAxKSwgY3R4KCRyZWplY3QsIHJlY29yZCwgMSkpO1xuICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICRyZWplY3QuY2FsbChyZWNvcmQsIGVycik7XG4gICAgfVxuICB9O1xuICByZXF1aXJlKCcuLyQubWl4JykoUC5wcm90b3R5cGUsIHtcbiAgICAvLyAyNS40LjUuMyBQcm9taXNlLnByb3RvdHlwZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxuICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xuICAgICAgdmFyIFMgPSBhbk9iamVjdChhbk9iamVjdCh0aGlzKS5jb25zdHJ1Y3RvcilbU1BFQ0lFU107XG4gICAgICB2YXIgcmVhY3QgPSB7XG4gICAgICAgIG9rOiAgIHR5cGVvZiBvbkZ1bGZpbGxlZCA9PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiB0cnVlLFxuICAgICAgICBmYWlsOiB0eXBlb2Ygb25SZWplY3RlZCA9PSAnZnVuY3Rpb24nICA/IG9uUmVqZWN0ZWQgIDogZmFsc2VcbiAgICAgIH07XG4gICAgICB2YXIgcHJvbWlzZSA9IHJlYWN0LlAgPSBuZXcgKFMgIT0gdW5kZWZpbmVkID8gUyA6IFApKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgICAgcmVhY3QucmVzID0gYUZ1bmN0aW9uKHJlcyk7XG4gICAgICAgIHJlYWN0LnJlaiA9IGFGdW5jdGlvbihyZWopO1xuICAgICAgfSk7XG4gICAgICB2YXIgcmVjb3JkID0gdGhpc1tSRUNPUkRdO1xuICAgICAgcmVjb3JkLmMucHVzaChyZWFjdCk7XG4gICAgICBpZihyZWNvcmQuYSlyZWNvcmQuYS5wdXNoKHJlYWN0KTtcbiAgICAgIGlmKHJlY29yZC5zKW5vdGlmeShyZWNvcmQsIGZhbHNlKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH0sXG4gICAgLy8gMjUuNC41LjEgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2gob25SZWplY3RlZClcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBleHBvcnRcbiRkZWYoJGRlZi5HICsgJGRlZi5XICsgJGRlZi5GICogIXVzZU5hdGl2ZSwge1Byb21pc2U6IFB9KTtcbnJlcXVpcmUoJy4vJC50YWcnKShQLCBQUk9NSVNFKTtcbnNwZWNpZXMoUCk7XG5zcGVjaWVzKFdyYXBwZXIgPSByZXF1aXJlKCcuLyQuY29yZScpW1BST01JU0VdKTtcblxuLy8gc3RhdGljc1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC41IFByb21pc2UucmVqZWN0KHIpXG4gIHJlamVjdDogZnVuY3Rpb24gcmVqZWN0KHIpe1xuICAgIHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbihyZXMsIHJlail7IHJlaihyKTsgfSk7XG4gIH1cbn0pO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAoIXVzZU5hdGl2ZSB8fCB0ZXN0UmVzb2x2ZSh0cnVlKSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjYgUHJvbWlzZS5yZXNvbHZlKHgpXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoeCl7XG4gICAgcmV0dXJuIGlzUHJvbWlzZSh4KSAmJiBzYW1lQ29uc3RydWN0b3IoeC5jb25zdHJ1Y3RvciwgdGhpcylcbiAgICAgID8geCA6IG5ldyB0aGlzKGZ1bmN0aW9uKHJlcyl7IHJlcyh4KTsgfSk7XG4gIH1cbn0pO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhKHVzZU5hdGl2ZSAmJiByZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXtcbiAgUC5hbGwoaXRlcilbJ2NhdGNoJ10oZnVuY3Rpb24oKXt9KTtcbn0pKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpe1xuICAgIHZhciBDICAgICAgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKVxuICAgICAgLCB2YWx1ZXMgPSBbXTtcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCB2YWx1ZXMucHVzaCwgdmFsdWVzKTtcbiAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXG4gICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcbiAgICAgIGlmKHJlbWFpbmluZykkLmVhY2guY2FsbCh2YWx1ZXMsIGZ1bmN0aW9uKHByb21pc2UsIGluZGV4KXtcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzKHJlc3VsdHMpO1xuICAgICAgICB9LCByZWopO1xuICAgICAgfSk7XG4gICAgICBlbHNlIHJlcyhyZXN1bHRzKTtcbiAgICB9KTtcbiAgfSxcbiAgLy8gMjUuNC40LjQgUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKVxuICByYWNlOiBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKXtcbiAgICB2YXIgQyA9IGdldENvbnN0cnVjdG9yKHRoaXMpO1xuICAgIHJldHVybiBuZXcgQyhmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uKHByb21pc2Upe1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihyZXMsIHJlaik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHN0cm9uZyA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXN0cm9uZycpO1xuXG4vLyAyMy4yIFNldCBPYmplY3RzXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdTZXQnLCBmdW5jdGlvbihnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24gU2V0KCl7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzWzBdKTsgfTtcbn0sIHtcbiAgLy8gMjMuMi4zLjEgU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXG4gIGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKXtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZyk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykodHJ1ZSk7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwgaW5kZXggPSB0aGlzLl9pXG4gICAgLCBwb2ludDtcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHt2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlfTtcbiAgcG9pbnQgPSAkYXQoTywgaW5kZXgpO1xuICB0aGlzLl9pICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHt2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlfTtcbn0pOyIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciAkICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZ2xvYmFsICAgICAgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBoYXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIFNVUFBPUlRfREVTQyAgID0gcmVxdWlyZSgnLi8kLnN1cHBvcnQtZGVzYycpXG4gICwgJGRlZiAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcmVkZWYgICAgICAgICA9IHJlcXVpcmUoJy4vJC5yZWRlZicpXG4gICwgc2hhcmVkICAgICAgICAgPSByZXF1aXJlKCcuLyQuc2hhcmVkJylcbiAgLCBzZXRUYWcgICAgICAgICA9IHJlcXVpcmUoJy4vJC50YWcnKVxuICAsIHVpZCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpXG4gICwgd2tzICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQud2tzJylcbiAgLCBrZXlPZiAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5rZXlvZicpXG4gICwgJG5hbWVzICAgICAgICAgPSByZXF1aXJlKCcuLyQuZ2V0LW5hbWVzJylcbiAgLCBlbnVtS2V5cyAgICAgICA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKVxuICAsIGlzT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgYW5PYmplY3QgICAgICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCB0b0lPYmplY3QgICAgICA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0JylcbiAgLCBjcmVhdGVEZXNjICAgICA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJylcbiAgLCBnZXREZXNjICAgICAgICA9ICQuZ2V0RGVzY1xuICAsIHNldERlc2MgICAgICAgID0gJC5zZXREZXNjXG4gICwgX2NyZWF0ZSAgICAgICAgPSAkLmNyZWF0ZVxuICAsIGdldE5hbWVzICAgICAgID0gJG5hbWVzLmdldFxuICAsICRTeW1ib2wgICAgICAgID0gZ2xvYmFsLlN5bWJvbFxuICAsIHNldHRlciAgICAgICAgID0gZmFsc2VcbiAgLCBISURERU4gICAgICAgICA9IHdrcygnX2hpZGRlbicpXG4gICwgaXNFbnVtICAgICAgICAgPSAkLmlzRW51bVxuICAsIFN5bWJvbFJlZ2lzdHJ5ID0gc2hhcmVkKCdzeW1ib2wtcmVnaXN0cnknKVxuICAsIEFsbFN5bWJvbHMgICAgID0gc2hhcmVkKCdzeW1ib2xzJylcbiAgLCB1c2VOYXRpdmUgICAgICA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbidcbiAgLCBPYmplY3RQcm90byAgICA9IE9iamVjdC5wcm90b3R5cGU7XG5cbnZhciBzZXRTeW1ib2xEZXNjID0gU1VQUE9SVF9ERVNDID8gZnVuY3Rpb24oKXsgLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkXG4gIHRyeSB7XG4gICAgcmV0dXJuIF9jcmVhdGUoc2V0RGVzYyh7fSwgSElEREVOLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBzZXREZXNjKHRoaXMsIEhJRERFTiwge3ZhbHVlOiBmYWxzZX0pW0hJRERFTl07XG4gICAgICB9XG4gICAgfSkpW0hJRERFTl0gfHwgc2V0RGVzYztcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oaXQsIGtleSwgRCl7XG4gICAgICB2YXIgcHJvdG9EZXNjID0gZ2V0RGVzYyhPYmplY3RQcm90bywga2V5KTtcbiAgICAgIGlmKHByb3RvRGVzYylkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgICAgIHNldERlc2MoaXQsIGtleSwgRCk7XG4gICAgICBpZihwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKXNldERlc2MoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbiAgICB9O1xuICB9XG59KCkgOiBzZXREZXNjO1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uKHRhZyl7XG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSBfY3JlYXRlKCRTeW1ib2wucHJvdG90eXBlKTtcbiAgc3ltLl9rID0gdGFnO1xuICBTVVBQT1JUX0RFU0MgJiYgc2V0dGVyICYmIHNldFN5bWJvbERlc2MoT2JqZWN0UHJvdG8sIHRhZywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIGlmKGhhcyh0aGlzLCBISURERU4pICYmIGhhcyh0aGlzW0hJRERFTl0sIHRhZykpdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldFN5bWJvbERlc2ModGhpcywgdGFnLCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHN5bTtcbn07XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKXtcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSl7XG4gICAgaWYoIUQuZW51bWVyYWJsZSl7XG4gICAgICBpZighaGFzKGl0LCBISURERU4pKXNldERlc2MoaXQsIEhJRERFTiwgY3JlYXRlRGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSlpdFtISURERU5dW2tleV0gPSBmYWxzZTtcbiAgICAgIEQgPSBfY3JlYXRlKEQsIHtlbnVtZXJhYmxlOiBjcmVhdGVEZXNjKDAsIGZhbHNlKX0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIHNldERlc2MoaXQsIGtleSwgRCk7XG59O1xudmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCl7XG4gIGFuT2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9JT2JqZWN0KFApKVxuICAgICwgaSAgICA9IDBcbiAgICAsIGwgPSBrZXlzLmxlbmd0aFxuICAgICwga2V5O1xuICB3aGlsZShsID4gaSkkZGVmaW5lUHJvcGVydHkoaXQsIGtleSA9IGtleXNbaSsrXSwgUFtrZXldKTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciAkY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGl0LCBQKXtcbiAgcmV0dXJuIFAgPT09IHVuZGVmaW5lZCA/IF9jcmVhdGUoaXQpIDogJGRlZmluZVByb3BlcnRpZXMoX2NyZWF0ZShpdCksIFApO1xufTtcbnZhciAkcHJvcGVydHlJc0VudW1lcmFibGUgPSBmdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShrZXkpe1xuICB2YXIgRSA9IGlzRW51bS5jYWxsKHRoaXMsIGtleSk7XG4gIHJldHVybiBFIHx8ICFoYXModGhpcywga2V5KSB8fCAhaGFzKEFsbFN5bWJvbHMsIGtleSkgfHwgaGFzKHRoaXMsIEhJRERFTikgJiYgdGhpc1tISURERU5dW2tleV1cbiAgICA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICB2YXIgRCA9IGdldERlc2MoaXQgPSB0b0lPYmplY3QoaXQpLCBrZXkpO1xuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIHZhciBuYW1lcyAgPSBnZXROYW1lcyh0b0lPYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZighaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4pcmVzdWx0LnB1c2goa2V5KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgJGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCl7XG4gIHZhciBuYW1lcyAgPSBnZXROYW1lcyh0b0lPYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkpcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYoIXVzZU5hdGl2ZSl7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKXtcbiAgICBpZih0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCl0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xuICAgIHJldHVybiB3cmFwKHVpZChhcmd1bWVudHNbMF0pKTtcbiAgfTtcbiAgJHJlZGVmKCRTeW1ib2wucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xuICAgIHJldHVybiB0aGlzLl9rO1xuICB9KTtcblxuICAkLmNyZWF0ZSAgICAgPSAkY3JlYXRlO1xuICAkLmlzRW51bSAgICAgPSAkcHJvcGVydHlJc0VudW1lcmFibGU7XG4gICQuZ2V0RGVzYyAgICA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICQuc2V0RGVzYyAgICA9ICRkZWZpbmVQcm9wZXJ0eTtcbiAgJC5zZXREZXNjcyAgID0gJGRlZmluZVByb3BlcnRpZXM7XG4gICQuZ2V0TmFtZXMgICA9ICRuYW1lcy5nZXQgPSAkZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgJC5nZXRTeW1ib2xzID0gJGdldE93blByb3BlcnR5U3ltYm9scztcblxuICBpZihTVVBQT1JUX0RFU0MgJiYgIXJlcXVpcmUoJy4vJC5saWJyYXJ5Jykpe1xuICAgICRyZWRlZihPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxufVxuXG4vLyBNUyBFZGdlIGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyB7fVxuLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgaW4gb2JqZWN0cyB0byBKU09OIGFzIG51bGxcbmlmKCF1c2VOYXRpdmUgfHwgcmVxdWlyZSgnLi8kLmZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFt7YTogJFN5bWJvbCgpfSwgWyRTeW1ib2woKV1dKSAhPSAnW3t9LFtudWxsXV0nO1xufSkpJHJlZGVmKCRTeW1ib2wucHJvdG90eXBlLCAndG9KU09OJywgZnVuY3Rpb24gdG9KU09OKCl7XG4gIGlmKHVzZU5hdGl2ZSAmJiBpc09iamVjdCh0aGlzKSlyZXR1cm4gdGhpcztcbn0pO1xuXG52YXIgc3ltYm9sU3RhdGljcyA9IHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbihrZXkpe1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioa2V5KXtcbiAgICByZXR1cm4ga2V5T2YoU3ltYm9sUmVnaXN0cnksIGtleSk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24oKXsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSBmYWxzZTsgfVxufTtcbi8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxuLy8gMTkuNC4yLjMgU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZVxuLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXG4vLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcbi8vIDE5LjQuMi44IFN5bWJvbC5yZXBsYWNlXG4vLyAxOS40LjIuOSBTeW1ib2wuc2VhcmNoXG4vLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcbi8vIDE5LjQuMi4xMSBTeW1ib2wuc3BsaXRcbi8vIDE5LjQuMi4xMiBTeW1ib2wudG9QcmltaXRpdmVcbi8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcbi8vIDE5LjQuMi4xNCBTeW1ib2wudW5zY29wYWJsZXNcbiQuZWFjaC5jYWxsKChcbiAgICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLCcgK1xuICAgICdzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuICApLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGl0KXtcbiAgICB2YXIgc3ltID0gd2tzKGl0KTtcbiAgICBzeW1ib2xTdGF0aWNzW2l0XSA9IHVzZU5hdGl2ZSA/IHN5bSA6IHdyYXAoc3ltKTtcbiAgfVxuKTtcblxuc2V0dGVyID0gdHJ1ZTtcblxuJGRlZigkZGVmLkcgKyAkZGVmLlcsIHtTeW1ib2w6ICRTeW1ib2x9KTtcblxuJGRlZigkZGVmLlMsICdTeW1ib2wnLCBzeW1ib2xTdGF0aWNzKTtcblxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJGNyZWF0ZSxcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiAkZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMTkuNC4zLjUgU3ltYm9sLnByb3RvdHlwZVtAQHRvU3RyaW5nVGFnXVxuc2V0VGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRhZyhnbG9iYWwuSlNPTiwgJ0pTT04nLCB0cnVlKTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5QLCAnTWFwJywge3RvSlNPTjogcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdNYXAnKX0pOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlAsICdTZXQnLCB7dG9KU09OOiByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ1NldCcpfSk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuSFRNTENvbGxlY3Rpb24gPSBJdGVyYXRvcnMuQXJyYXk7IiwiLy8gVGhpcyBtZXRob2Qgb2Ygb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0IG5lZWRzIHRvIGJlXG4vLyBrZXB0IGlkZW50aWNhbCB0byB0aGUgd2F5IGl0IGlzIG9idGFpbmVkIGluIHJ1bnRpbWUuanNcbnZhciBnID1cbiAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gIHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOlxuICB0eXBlb2Ygc2VsZiA9PT0gXCJvYmplY3RcIiA/IHNlbGYgOiB0aGlzO1xuXG4vLyBVc2UgYGdldE93blByb3BlcnR5TmFtZXNgIGJlY2F1c2Ugbm90IGFsbCBicm93c2VycyBzdXBwb3J0IGNhbGxpbmdcbi8vIGBoYXNPd25Qcm9wZXJ0eWAgb24gdGhlIGdsb2JhbCBgc2VsZmAgb2JqZWN0IGluIGEgd29ya2VyLiBTZWUgIzE4My5cbnZhciBoYWRSdW50aW1lID0gZy5yZWdlbmVyYXRvclJ1bnRpbWUgJiZcbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZykuaW5kZXhPZihcInJlZ2VuZXJhdG9yUnVudGltZVwiKSA+PSAwO1xuXG4vLyBTYXZlIHRoZSBvbGQgcmVnZW5lcmF0b3JSdW50aW1lIGluIGNhc2UgaXQgbmVlZHMgdG8gYmUgcmVzdG9yZWQgbGF0ZXIuXG52YXIgb2xkUnVudGltZSA9IGhhZFJ1bnRpbWUgJiYgZy5yZWdlbmVyYXRvclJ1bnRpbWU7XG5cbi8vIEZvcmNlIHJlZXZhbHV0YXRpb24gb2YgcnVudGltZS5qcy5cbmcucmVnZW5lcmF0b3JSdW50aW1lID0gdW5kZWZpbmVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3J1bnRpbWVcIik7XG5cbmlmIChoYWRSdW50aW1lKSB7XG4gIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHJ1bnRpbWUuXG4gIGcucmVnZW5lcmF0b3JSdW50aW1lID0gb2xkUnVudGltZTtcbn0gZWxzZSB7XG4gIC8vIFJlbW92ZSB0aGUgZ2xvYmFsIHByb3BlcnR5IGFkZGVkIGJ5IHJ1bnRpbWUuanMuXG4gIGRlbGV0ZSBnLnJlZ2VuZXJhdG9yUnVudGltZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiBtb2R1bGUuZXhwb3J0cywgX19lc01vZHVsZTogdHJ1ZSB9O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9tYXN0ZXIvTElDRU5TRSBmaWxlLiBBblxuICogYWRkaXRpb25hbCBncmFudCBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluXG4gKiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfU3ltYm9sID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2xcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX1N5bWJvbCRpdGVyYXRvciA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sL2l0ZXJhdG9yXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIF9PYmplY3QkY3JlYXRlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIF9Qcm9taXNlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9wcm9taXNlXCIpW1wiZGVmYXVsdFwiXTtcblxuIShmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gdHlwZW9mIF9TeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBfU3ltYm9sJGl0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuXG4gIHZhciBpbk1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCI7XG4gIHZhciBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgaWYgKHJ1bnRpbWUpIHtcbiAgICBpZiAoaW5Nb2R1bGUpIHtcbiAgICAgIC8vIElmIHJlZ2VuZXJhdG9yUnVudGltZSBpcyBkZWZpbmVkIGdsb2JhbGx5IGFuZCB3ZSdyZSBpbiBhIG1vZHVsZSxcbiAgICAgIC8vIG1ha2UgdGhlIGV4cG9ydHMgb2JqZWN0IGlkZW50aWNhbCB0byByZWdlbmVyYXRvclJ1bnRpbWUuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IHJ1bnRpbWU7XG4gICAgfVxuICAgIC8vIERvbid0IGJvdGhlciBldmFsdWF0aW5nIHRoZSByZXN0IG9mIHRoaXMgZmlsZSBpZiB0aGUgcnVudGltZSB3YXNcbiAgICAvLyBhbHJlYWR5IGRlZmluZWQgZ2xvYmFsbHkuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRGVmaW5lIHRoZSBydW50aW1lIGdsb2JhbGx5IChhcyBleHBlY3RlZCBieSBnZW5lcmF0ZWQgY29kZSkgYXMgZWl0aGVyXG4gIC8vIG1vZHVsZS5leHBvcnRzIChpZiB3ZSdyZSBpbiBhIG1vZHVsZSkgb3IgYSBuZXcsIGVtcHR5IG9iamVjdC5cbiAgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWUgPSBpbk1vZHVsZSA/IG1vZHVsZS5leHBvcnRzIDoge307XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIGdlbmVyYXRvciA9IF9PYmplY3QkY3JlYXRlKChvdXRlckZuIHx8IEdlbmVyYXRvcikucHJvdG90eXBlKTtcblxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmIHx8IG51bGwsIG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKSk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IEdlbmVyYXRvci5wcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICBwcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24gKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvciA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCIgOiBmYWxzZTtcbiAgfTtcblxuICBydW50aW1lLm1hcmsgPSBmdW5jdGlvbiAoZ2VuRnVuKSB7XG4gICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBfT2JqZWN0JGNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYHZhbHVlIGluc3RhbmNlb2YgQXdhaXRBcmd1bWVudGAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuIFNvbWUgbWF5IGNvbnNpZGVyIHRoZSBuYW1lIG9mIHRoaXMgbWV0aG9kIHRvb1xuICAvLyBjdXRlc3ksIGJ1dCB0aGV5IGFyZSBjdXJtdWRnZW9ucy5cbiAgcnVudGltZS5hd3JhcCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICByZXR1cm4gbmV3IEF3YWl0QXJndW1lbnQoYXJnKTtcbiAgfTtcblxuICBmdW5jdGlvbiBBd2FpdEFyZ3VtZW50KGFyZykge1xuICAgIHRoaXMuYXJnID0gYXJnO1xuICB9XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IpIHtcbiAgICAvLyBUaGlzIGludm9rZSBmdW5jdGlvbiBpcyB3cml0dGVuIGluIGEgc3R5bGUgdGhhdCBhc3N1bWVzIHNvbWVcbiAgICAvLyBjYWxsaW5nIGZ1bmN0aW9uIChvciBQcm9taXNlKSB3aWxsIGhhbmRsZSBleGNlcHRpb25zLlxuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgdmFyIHJlc3VsdCA9IGdlbmVyYXRvclttZXRob2RdKGFyZyk7XG4gICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBBd2FpdEFyZ3VtZW50ID8gX1Byb21pc2UucmVzb2x2ZSh2YWx1ZS5hcmcpLnRoZW4oaW52b2tlTmV4dCwgaW52b2tlVGhyb3cpIDogX1Byb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAodW53cmFwcGVkKSB7XG4gICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi4gSWYgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWQsIGhvd2V2ZXIsIHRoZVxuICAgICAgICAvLyByZXN1bHQgZm9yIHRoaXMgaXRlcmF0aW9uIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCB0aGUgc2FtZVxuICAgICAgICAvLyByZWFzb24uIE5vdGUgdGhhdCByZWplY3Rpb25zIG9mIHlpZWxkZWQgUHJvbWlzZXMgYXJlIG5vdFxuICAgICAgICAvLyB0aHJvd24gYmFjayBpbnRvIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24sIGFzIGlzIHRoZSBjYXNlXG4gICAgICAgIC8vIHdoZW4gYW4gYXdhaXRlZCBQcm9taXNlIGlzIHJlamVjdGVkLiBUaGlzIGRpZmZlcmVuY2UgaW5cbiAgICAgICAgLy8gYmVoYXZpb3IgYmV0d2VlbiB5aWVsZCBhbmQgYXdhaXQgaXMgaW1wb3J0YW50LCBiZWNhdXNlIGl0XG4gICAgICAgIC8vIGFsbG93cyB0aGUgY29uc3VtZXIgdG8gZGVjaWRlIHdoYXQgdG8gZG8gd2l0aCB0aGUgeWllbGRlZFxuICAgICAgICAvLyByZWplY3Rpb24gKHN3YWxsb3cgaXQgYW5kIGNvbnRpbnVlLCBtYW51YWxseSAudGhyb3cgaXQgYmFja1xuICAgICAgICAvLyBpbnRvIHRoZSBnZW5lcmF0b3IsIGFiYW5kb24gaXRlcmF0aW9uLCB3aGF0ZXZlcikuIFdpdGhcbiAgICAgICAgLy8gYXdhaXQsIGJ5IGNvbnRyYXN0LCB0aGVyZSBpcyBubyBvcHBvcnR1bml0eSB0byBleGFtaW5lIHRoZVxuICAgICAgICAvLyByZWplY3Rpb24gcmVhc29uIG91dHNpZGUgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiwgc28gdGhlXG4gICAgICAgIC8vIG9ubHkgb3B0aW9uIGlzIHRvIHRocm93IGl0IGZyb20gdGhlIGF3YWl0IGV4cHJlc3Npb24sIGFuZFxuICAgICAgICAvLyBsZXQgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBoYW5kbGUgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MuZG9tYWluKSB7XG4gICAgICBpbnZva2UgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKGludm9rZSk7XG4gICAgfVxuXG4gICAgdmFyIGludm9rZU5leHQgPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwibmV4dFwiKTtcbiAgICB2YXIgaW52b2tlVGhyb3cgPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwidGhyb3dcIik7XG4gICAgdmFyIGludm9rZVJldHVybiA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJyZXR1cm5cIik7XG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIHZhciBlbnF1ZXVlUmVzdWx0ID1cbiAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBpbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfSkgOiBuZXcgX1Byb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgcmVzb2x2ZShpbnZva2UobWV0aG9kLCBhcmcpKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBlbnF1ZXVlUmVzdWx0IGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5XG4gICAgICAvLyBsYXRlciBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICBwcmV2aW91c1Byb21pc2UgPSBlbnF1ZXVlUmVzdWx0W1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGlnbm9yZWQpIHt9KTtcblxuICAgICAgcmV0dXJuIGVucXVldWVSZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uIChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3Iod3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkpO1xuXG4gICAgcmV0dXJuIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKSA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIiB8fCBtZXRob2QgPT09IFwidGhyb3dcIiAmJiBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIEEgcmV0dXJuIG9yIHRocm93ICh3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gdGhyb3dcbiAgICAgICAgICAgIC8vIG1ldGhvZCkgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICAgIHZhciByZXR1cm5NZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXTtcbiAgICAgICAgICAgIGlmIChyZXR1cm5NZXRob2QpIHtcbiAgICAgICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKHJldHVybk1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGFyZyk7XG4gICAgICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJldHVybiBtZXRob2QgdGhyZXcgYW4gZXhjZXB0aW9uLCBsZXQgdGhhdFxuICAgICAgICAgICAgICAgIC8vIGV4Y2VwdGlvbiBwcmV2YWlsIG92ZXIgdGhlIG9yaWdpbmFsIHJldHVybiBvciB0aHJvdy5cbiAgICAgICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgICAgIC8vIENvbnRpbnVlIHdpdGggdGhlIG91dGVyIHJldHVybiwgbm93IHRoYXQgdGhlIGRlbGVnYXRlXG4gICAgICAgICAgICAgIC8vIGl0ZXJhdG9yIGhhcyBiZWVuIHRlcm1pbmF0ZWQuXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdLCBkZWxlZ2F0ZS5pdGVyYXRvciwgYXJnKTtcblxuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gTGlrZSByZXR1cm5pbmcgZ2VuZXJhdG9yLnRocm93KHVuY2F1Z2h0KSwgYnV0IHdpdGhvdXQgdGhlXG4gICAgICAgICAgICAvLyBvdmVyaGVhZCBvZiBhbiBleHRyYSBmdW5jdGlvbiBjYWxsLlxuICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIERlbGVnYXRlIGdlbmVyYXRvciByYW4gYW5kIGhhbmRsZWQgaXRzIG93biBleGNlcHRpb25zIHNvXG4gICAgICAgICAgLy8gcmVnYXJkbGVzcyBvZiB3aGF0IHRoZSBtZXRob2Qgd2FzLCB3ZSBjb250aW51ZSBhcyBpZiBpdCBpc1xuICAgICAgICAgIC8vIFwibmV4dFwiIHdpdGggYW4gdW5kZWZpbmVkIGFyZy5cbiAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG4gICAgICAgICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkKSB7XG4gICAgICAgICAgICBjb250ZXh0LnNlbnQgPSBhcmc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRleHQuc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgICBtZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lID8gR2VuU3RhdGVDb21wbGV0ZWQgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuZGVsZWdhdGUgJiYgbWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgcnVudGltZS5rZXlzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsXG4gICAgICAgICAgICBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbiByZXNldChza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIHRoaXMuc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uIGRpc3BhdGNoRXhjZXB0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuICAgICAgICByZXR1cm4gISFjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24gYWJydXB0KHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiYgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmICh0eXBlID09PSBcImJyZWFrXCIgfHwgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJiBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJiBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbiBjb21wbGV0ZShyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fCByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uIGZpbmlzaChmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uIF9jYXRjaCh0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24gZGVsZWdhdGVZaWVsZChpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuLy8gQW1vbmcgdGhlIHZhcmlvdXMgdHJpY2tzIGZvciBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbFxuLy8gb2JqZWN0LCB0aGlzIHNlZW1zIHRvIGJlIHRoZSBtb3N0IHJlbGlhYmxlIHRlY2huaXF1ZSB0aGF0IGRvZXMgbm90XG4vLyB1c2UgaW5kaXJlY3QgZXZhbCAod2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kpLlxudHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6IHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiA9PT0gXCJvYmplY3RcIiA/IHNlbGYgOiB1bmRlZmluZWQpOyIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyohIEhhbW1lci5KUyAtIHYyLjAuNCAtIDIwMTQtMDktMjhcclxuICogaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE0IEpvcmlrIFRhbmdlbGRlcjtcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlICovXHJcbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBleHBvcnROYW1lLCB1bmRlZmluZWQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG52YXIgVkVORE9SX1BSRUZJWEVTID0gWycnLCAnd2Via2l0JywgJ21veicsICdNUycsICdtcycsICdvJ107XHJcbnZhciBURVNUX0VMRU1FTlQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbnZhciBUWVBFX0ZVTkNUSU9OID0gJ2Z1bmN0aW9uJztcclxuXHJcbnZhciByb3VuZCA9IE1hdGgucm91bmQ7XHJcbnZhciBhYnMgPSBNYXRoLmFicztcclxudmFyIG5vdyA9IERhdGUubm93O1xyXG5cclxuLyoqXHJcbiAqIHNldCBhIHRpbWVvdXQgd2l0aCBhIGdpdmVuIHNjb3BlXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRUaW1lb3V0Q29udGV4dChmbiwgdGltZW91dCwgY29udGV4dCkge1xyXG4gICAgcmV0dXJuIHNldFRpbWVvdXQoYmluZEZuKGZuLCBjb250ZXh0KSwgdGltZW91dCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBpZiB0aGUgYXJndW1lbnQgaXMgYW4gYXJyYXksIHdlIHdhbnQgdG8gZXhlY3V0ZSB0aGUgZm4gb24gZWFjaCBlbnRyeVxyXG4gKiBpZiBpdCBhaW50IGFuIGFycmF5IHdlIGRvbid0IHdhbnQgdG8gZG8gYSB0aGluZy5cclxuICogdGhpcyBpcyB1c2VkIGJ5IGFsbCB0aGUgbWV0aG9kcyB0aGF0IGFjY2VwdCBhIHNpbmdsZSBhbmQgYXJyYXkgYXJndW1lbnQuXHJcbiAqIEBwYXJhbSB7KnxBcnJheX0gYXJnXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmblxyXG4gKiBAcGFyYW0ge09iamVjdH0gW2NvbnRleHRdXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gKi9cclxuZnVuY3Rpb24gaW52b2tlQXJyYXlBcmcoYXJnLCBmbiwgY29udGV4dCkge1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xyXG4gICAgICAgIGVhY2goYXJnLCBjb250ZXh0W2ZuXSwgY29udGV4dCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiB3YWxrIG9iamVjdHMgYW5kIGFycmF5c1xyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XHJcbiAqL1xyXG5mdW5jdGlvbiBlYWNoKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcclxuICAgIHZhciBpO1xyXG5cclxuICAgIGlmICghb2JqKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvYmouZm9yRWFjaCkge1xyXG4gICAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcclxuICAgIH0gZWxzZSBpZiAob2JqLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGkgPCBvYmoubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopO1xyXG4gICAgICAgICAgICBpKys7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgIG9iai5oYXNPd25Qcm9wZXJ0eShpKSAmJiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBleHRlbmQgb2JqZWN0LlxyXG4gKiBtZWFucyB0aGF0IHByb3BlcnRpZXMgaW4gZGVzdCB3aWxsIGJlIG92ZXJ3cml0dGVuIGJ5IHRoZSBvbmVzIGluIHNyYy5cclxuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcclxuICogQHBhcmFtIHtPYmplY3R9IHNyY1xyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFttZXJnZV1cclxuICogQHJldHVybnMge09iamVjdH0gZGVzdFxyXG4gKi9cclxuZnVuY3Rpb24gZXh0ZW5kKGRlc3QsIHNyYywgbWVyZ2UpIHtcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoc3JjKTtcclxuICAgIHZhciBpID0gMDtcclxuICAgIHdoaWxlIChpIDwga2V5cy5sZW5ndGgpIHtcclxuICAgICAgICBpZiAoIW1lcmdlIHx8IChtZXJnZSAmJiBkZXN0W2tleXNbaV1dID09PSB1bmRlZmluZWQpKSB7XHJcbiAgICAgICAgICAgIGRlc3Rba2V5c1tpXV0gPSBzcmNba2V5c1tpXV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGkrKztcclxuICAgIH1cclxuICAgIHJldHVybiBkZXN0O1xyXG59XHJcblxyXG4vKipcclxuICogbWVyZ2UgdGhlIHZhbHVlcyBmcm9tIHNyYyBpbiB0aGUgZGVzdC5cclxuICogbWVhbnMgdGhhdCBwcm9wZXJ0aWVzIHRoYXQgZXhpc3QgaW4gZGVzdCB3aWxsIG5vdCBiZSBvdmVyd3JpdHRlbiBieSBzcmNcclxuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcclxuICogQHBhcmFtIHtPYmplY3R9IHNyY1xyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBkZXN0XHJcbiAqL1xyXG5mdW5jdGlvbiBtZXJnZShkZXN0LCBzcmMpIHtcclxuICAgIHJldHVybiBleHRlbmQoZGVzdCwgc3JjLCB0cnVlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHNpbXBsZSBjbGFzcyBpbmhlcml0YW5jZVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjaGlsZFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBiYXNlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllc11cclxuICovXHJcbmZ1bmN0aW9uIGluaGVyaXQoY2hpbGQsIGJhc2UsIHByb3BlcnRpZXMpIHtcclxuICAgIHZhciBiYXNlUCA9IGJhc2UucHJvdG90eXBlLFxyXG4gICAgICAgIGNoaWxkUDtcclxuXHJcbiAgICBjaGlsZFAgPSBjaGlsZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKGJhc2VQKTtcclxuICAgIGNoaWxkUC5jb25zdHJ1Y3RvciA9IGNoaWxkO1xyXG4gICAgY2hpbGRQLl9zdXBlciA9IGJhc2VQO1xyXG5cclxuICAgIGlmIChwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgZXh0ZW5kKGNoaWxkUCwgcHJvcGVydGllcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBzaW1wbGUgZnVuY3Rpb24gYmluZFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XHJcbiAqL1xyXG5mdW5jdGlvbiBiaW5kRm4oZm4sIGNvbnRleHQpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiBib3VuZEZuKCkge1xyXG4gICAgICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGxldCBhIGJvb2xlYW4gdmFsdWUgYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgbXVzdCByZXR1cm4gYSBib29sZWFuXHJcbiAqIHRoaXMgZmlyc3QgaXRlbSBpbiBhcmdzIHdpbGwgYmUgdXNlZCBhcyB0aGUgY29udGV4dFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW58RnVuY3Rpb259IHZhbFxyXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJnc11cclxuICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAqL1xyXG5mdW5jdGlvbiBib29sT3JGbih2YWwsIGFyZ3MpIHtcclxuICAgIGlmICh0eXBlb2YgdmFsID09IFRZUEVfRlVOQ1RJT04pIHtcclxuICAgICAgICByZXR1cm4gdmFsLmFwcGx5KGFyZ3MgPyBhcmdzWzBdIHx8IHVuZGVmaW5lZCA6IHVuZGVmaW5lZCwgYXJncyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsO1xyXG59XHJcblxyXG4vKipcclxuICogdXNlIHRoZSB2YWwyIHdoZW4gdmFsMSBpcyB1bmRlZmluZWRcclxuICogQHBhcmFtIHsqfSB2YWwxXHJcbiAqIEBwYXJhbSB7Kn0gdmFsMlxyXG4gKiBAcmV0dXJucyB7Kn1cclxuICovXHJcbmZ1bmN0aW9uIGlmVW5kZWZpbmVkKHZhbDEsIHZhbDIpIHtcclxuICAgIHJldHVybiAodmFsMSA9PT0gdW5kZWZpbmVkKSA/IHZhbDIgOiB2YWwxO1xyXG59XHJcblxyXG4vKipcclxuICogYWRkRXZlbnRMaXN0ZW5lciB3aXRoIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlXHJcbiAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IHRhcmdldFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZXNcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxyXG4gKi9cclxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnModGFyZ2V0LCB0eXBlcywgaGFuZGxlcikge1xyXG4gICAgZWFjaChzcGxpdFN0cih0eXBlcyksIGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHJlbW92ZUV2ZW50TGlzdGVuZXIgd2l0aCBtdWx0aXBsZSBldmVudHMgYXQgb25jZVxyXG4gKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRcclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVzXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcclxuICovXHJcbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXJzKHRhcmdldCwgdHlwZXMsIGhhbmRsZXIpIHtcclxuICAgIGVhY2goc3BsaXRTdHIodHlwZXMpLCBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaW5kIGlmIGEgbm9kZSBpcyBpbiB0aGUgZ2l2ZW4gcGFyZW50XHJcbiAqIEBtZXRob2QgaGFzUGFyZW50XHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG5vZGVcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGZvdW5kXHJcbiAqL1xyXG5mdW5jdGlvbiBoYXNQYXJlbnQobm9kZSwgcGFyZW50KSB7XHJcbiAgICB3aGlsZSAobm9kZSkge1xyXG4gICAgICAgIGlmIChub2RlID09IHBhcmVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHNtYWxsIGluZGV4T2Ygd3JhcHBlclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaW5kXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBmb3VuZFxyXG4gKi9cclxuZnVuY3Rpb24gaW5TdHIoc3RyLCBmaW5kKSB7XHJcbiAgICByZXR1cm4gc3RyLmluZGV4T2YoZmluZCkgPiAtMTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHNwbGl0IHN0cmluZyBvbiB3aGl0ZXNwYWNlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcclxuICogQHJldHVybnMge0FycmF5fSB3b3Jkc1xyXG4gKi9cclxuZnVuY3Rpb24gc3BsaXRTdHIoc3RyKSB7XHJcbiAgICByZXR1cm4gc3RyLnRyaW0oKS5zcGxpdCgvXFxzKy9nKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIGZpbmQgaWYgYSBhcnJheSBjb250YWlucyB0aGUgb2JqZWN0IHVzaW5nIGluZGV4T2Ygb3IgYSBzaW1wbGUgcG9seUZpbGxcclxuICogQHBhcmFtIHtBcnJheX0gc3JjXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaW5kXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBbZmluZEJ5S2V5XVxyXG4gKiBAcmV0dXJuIHtCb29sZWFufE51bWJlcn0gZmFsc2Ugd2hlbiBub3QgZm91bmQsIG9yIHRoZSBpbmRleFxyXG4gKi9cclxuZnVuY3Rpb24gaW5BcnJheShzcmMsIGZpbmQsIGZpbmRCeUtleSkge1xyXG4gICAgaWYgKHNyYy5pbmRleE9mICYmICFmaW5kQnlLZXkpIHtcclxuICAgICAgICByZXR1cm4gc3JjLmluZGV4T2YoZmluZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICB3aGlsZSAoaSA8IHNyYy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKChmaW5kQnlLZXkgJiYgc3JjW2ldW2ZpbmRCeUtleV0gPT0gZmluZCkgfHwgKCFmaW5kQnlLZXkgJiYgc3JjW2ldID09PSBmaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBjb252ZXJ0IGFycmF5LWxpa2Ugb2JqZWN0cyB0byByZWFsIGFycmF5c1xyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEByZXR1cm5zIHtBcnJheX1cclxuICovXHJcbmZ1bmN0aW9uIHRvQXJyYXkob2JqKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwob2JqLCAwKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHVuaXF1ZSBhcnJheSB3aXRoIG9iamVjdHMgYmFzZWQgb24gYSBrZXkgKGxpa2UgJ2lkJykgb3IganVzdCBieSB0aGUgYXJyYXkncyB2YWx1ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBzcmMgW3tpZDoxfSx7aWQ6Mn0se2lkOjF9XVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gW2tleV1cclxuICogQHBhcmFtIHtCb29sZWFufSBbc29ydD1GYWxzZV1cclxuICogQHJldHVybnMge0FycmF5fSBbe2lkOjF9LHtpZDoyfV1cclxuICovXHJcbmZ1bmN0aW9uIHVuaXF1ZUFycmF5KHNyYywga2V5LCBzb3J0KSB7XHJcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG4gICAgdmFyIHZhbHVlcyA9IFtdO1xyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xyXG4gICAgICAgIHZhciB2YWwgPSBrZXkgPyBzcmNbaV1ba2V5XSA6IHNyY1tpXTtcclxuICAgICAgICBpZiAoaW5BcnJheSh2YWx1ZXMsIHZhbCkgPCAwKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChzcmNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZXNbaV0gPSB2YWw7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzb3J0KSB7XHJcbiAgICAgICAgaWYgKCFrZXkpIHtcclxuICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuc29ydCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLnNvcnQoZnVuY3Rpb24gc29ydFVuaXF1ZUFycmF5KGEsIGIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhW2tleV0gPiBiW2tleV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxufVxyXG5cclxuLyoqXHJcbiAqIGdldCB0aGUgcHJlZml4ZWQgcHJvcGVydHlcclxuICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcclxuICogQHJldHVybnMge1N0cmluZ3xVbmRlZmluZWR9IHByZWZpeGVkXHJcbiAqL1xyXG5mdW5jdGlvbiBwcmVmaXhlZChvYmosIHByb3BlcnR5KSB7XHJcbiAgICB2YXIgcHJlZml4LCBwcm9wO1xyXG4gICAgdmFyIGNhbWVsUHJvcCA9IHByb3BlcnR5WzBdLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eS5zbGljZSgxKTtcclxuXHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICB3aGlsZSAoaSA8IFZFTkRPUl9QUkVGSVhFUy5sZW5ndGgpIHtcclxuICAgICAgICBwcmVmaXggPSBWRU5ET1JfUFJFRklYRVNbaV07XHJcbiAgICAgICAgcHJvcCA9IChwcmVmaXgpID8gcHJlZml4ICsgY2FtZWxQcm9wIDogcHJvcGVydHk7XHJcblxyXG4gICAgICAgIGlmIChwcm9wIGluIG9iaikge1xyXG4gICAgICAgICAgICByZXR1cm4gcHJvcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaSsrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIGdldCBhIHVuaXF1ZSBpZFxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB1bmlxdWVJZFxyXG4gKi9cclxudmFyIF91bmlxdWVJZCA9IDE7XHJcbmZ1bmN0aW9uIHVuaXF1ZUlkKCkge1xyXG4gICAgcmV0dXJuIF91bmlxdWVJZCsrO1xyXG59XHJcblxyXG4vKipcclxuICogZ2V0IHRoZSB3aW5kb3cgb2JqZWN0IG9mIGFuIGVsZW1lbnRcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gKiBAcmV0dXJucyB7RG9jdW1lbnRWaWV3fFdpbmRvd31cclxuICovXHJcbmZ1bmN0aW9uIGdldFdpbmRvd0ZvckVsZW1lbnQoZWxlbWVudCkge1xyXG4gICAgdmFyIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudDtcclxuICAgIHJldHVybiAoZG9jLmRlZmF1bHRWaWV3IHx8IGRvYy5wYXJlbnRXaW5kb3cpO1xyXG59XHJcblxyXG52YXIgTU9CSUxFX1JFR0VYID0gL21vYmlsZXx0YWJsZXR8aXAoYWR8aG9uZXxvZCl8YW5kcm9pZC9pO1xyXG5cclxudmFyIFNVUFBPUlRfVE9VQ0ggPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTtcclxudmFyIFNVUFBPUlRfUE9JTlRFUl9FVkVOVFMgPSBwcmVmaXhlZCh3aW5kb3csICdQb2ludGVyRXZlbnQnKSAhPT0gdW5kZWZpbmVkO1xyXG52YXIgU1VQUE9SVF9PTkxZX1RPVUNIID0gU1VQUE9SVF9UT1VDSCAmJiBNT0JJTEVfUkVHRVgudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcclxuXHJcbnZhciBJTlBVVF9UWVBFX1RPVUNIID0gJ3RvdWNoJztcclxudmFyIElOUFVUX1RZUEVfUEVOID0gJ3Blbic7XHJcbnZhciBJTlBVVF9UWVBFX01PVVNFID0gJ21vdXNlJztcclxudmFyIElOUFVUX1RZUEVfS0lORUNUID0gJ2tpbmVjdCc7XHJcblxyXG52YXIgQ09NUFVURV9JTlRFUlZBTCA9IDI1O1xyXG5cclxudmFyIElOUFVUX1NUQVJUID0gMTtcclxudmFyIElOUFVUX01PVkUgPSAyO1xyXG52YXIgSU5QVVRfRU5EID0gNDtcclxudmFyIElOUFVUX0NBTkNFTCA9IDg7XHJcblxyXG52YXIgRElSRUNUSU9OX05PTkUgPSAxO1xyXG52YXIgRElSRUNUSU9OX0xFRlQgPSAyO1xyXG52YXIgRElSRUNUSU9OX1JJR0hUID0gNDtcclxudmFyIERJUkVDVElPTl9VUCA9IDg7XHJcbnZhciBESVJFQ1RJT05fRE9XTiA9IDE2O1xyXG5cclxudmFyIERJUkVDVElPTl9IT1JJWk9OVEFMID0gRElSRUNUSU9OX0xFRlQgfCBESVJFQ1RJT05fUklHSFQ7XHJcbnZhciBESVJFQ1RJT05fVkVSVElDQUwgPSBESVJFQ1RJT05fVVAgfCBESVJFQ1RJT05fRE9XTjtcclxudmFyIERJUkVDVElPTl9BTEwgPSBESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTDtcclxuXHJcbnZhciBQUk9QU19YWSA9IFsneCcsICd5J107XHJcbnZhciBQUk9QU19DTElFTlRfWFkgPSBbJ2NsaWVudFgnLCAnY2xpZW50WSddO1xyXG5cclxuLyoqXHJcbiAqIGNyZWF0ZSBuZXcgaW5wdXQgdHlwZSBtYW5hZ2VyXHJcbiAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xyXG4gKiBAcmV0dXJucyB7SW5wdXR9XHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gSW5wdXQobWFuYWdlciwgY2FsbGJhY2spIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHRoaXMubWFuYWdlciA9IG1hbmFnZXI7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBtYW5hZ2VyLmVsZW1lbnQ7XHJcbiAgICB0aGlzLnRhcmdldCA9IG1hbmFnZXIub3B0aW9ucy5pbnB1dFRhcmdldDtcclxuXHJcbiAgICAvLyBzbWFsbGVyIHdyYXBwZXIgYXJvdW5kIHRoZSBoYW5kbGVyLCBmb3IgdGhlIHNjb3BlIGFuZCB0aGUgZW5hYmxlZCBzdGF0ZSBvZiB0aGUgbWFuYWdlcixcclxuICAgIC8vIHNvIHdoZW4gZGlzYWJsZWQgdGhlIGlucHV0IGV2ZW50cyBhcmUgY29tcGxldGVseSBieXBhc3NlZC5cclxuICAgIHRoaXMuZG9tSGFuZGxlciA9IGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgaWYgKGJvb2xPckZuKG1hbmFnZXIub3B0aW9ucy5lbmFibGUsIFttYW5hZ2VyXSkpIHtcclxuICAgICAgICAgICAgc2VsZi5oYW5kbGVyKGV2KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG5cclxufVxyXG5cclxuSW5wdXQucHJvdG90eXBlID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBzaG91bGQgaGFuZGxlIHRoZSBpbnB1dEV2ZW50IGRhdGEgYW5kIHRyaWdnZXIgdGhlIGNhbGxiYWNrXHJcbiAgICAgKiBAdmlydHVhbFxyXG4gICAgICovXHJcbiAgICBoYW5kbGVyOiBmdW5jdGlvbigpIHsgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGJpbmQgdGhlIGV2ZW50c1xyXG4gICAgICovXHJcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmV2RWwgJiYgYWRkRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5ldlRhcmdldCAmJiBhZGRFdmVudExpc3RlbmVycyh0aGlzLnRhcmdldCwgdGhpcy5ldlRhcmdldCwgdGhpcy5kb21IYW5kbGVyKTtcclxuICAgICAgICB0aGlzLmV2V2luICYmIGFkZEV2ZW50TGlzdGVuZXJzKGdldFdpbmRvd0ZvckVsZW1lbnQodGhpcy5lbGVtZW50KSwgdGhpcy5ldldpbiwgdGhpcy5kb21IYW5kbGVyKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1bmJpbmQgdGhlIGV2ZW50c1xyXG4gICAgICovXHJcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmV2RWwgJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XHJcbiAgICAgICAgdGhpcy5ldlRhcmdldCAmJiByZW1vdmVFdmVudExpc3RlbmVycyh0aGlzLnRhcmdldCwgdGhpcy5ldlRhcmdldCwgdGhpcy5kb21IYW5kbGVyKTtcclxuICAgICAgICB0aGlzLmV2V2luICYmIHJlbW92ZUV2ZW50TGlzdGVuZXJzKGdldFdpbmRvd0ZvckVsZW1lbnQodGhpcy5lbGVtZW50KSwgdGhpcy5ldldpbiwgdGhpcy5kb21IYW5kbGVyKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBjcmVhdGUgbmV3IGlucHV0IHR5cGUgbWFuYWdlclxyXG4gKiBjYWxsZWQgYnkgdGhlIE1hbmFnZXIgY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtIYW1tZXJ9IG1hbmFnZXJcclxuICogQHJldHVybnMge0lucHV0fVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlSW5wdXRJbnN0YW5jZShtYW5hZ2VyKSB7XHJcbiAgICB2YXIgVHlwZTtcclxuICAgIHZhciBpbnB1dENsYXNzID0gbWFuYWdlci5vcHRpb25zLmlucHV0Q2xhc3M7XHJcblxyXG4gICAgaWYgKGlucHV0Q2xhc3MpIHtcclxuICAgICAgICBUeXBlID0gaW5wdXRDbGFzcztcclxuICAgIH0gZWxzZSBpZiAoU1VQUE9SVF9QT0lOVEVSX0VWRU5UUykge1xyXG4gICAgICAgIFR5cGUgPSBQb2ludGVyRXZlbnRJbnB1dDtcclxuICAgIH0gZWxzZSBpZiAoU1VQUE9SVF9PTkxZX1RPVUNIKSB7XHJcbiAgICAgICAgVHlwZSA9IFRvdWNoSW5wdXQ7XHJcbiAgICB9IGVsc2UgaWYgKCFTVVBQT1JUX1RPVUNIKSB7XHJcbiAgICAgICAgVHlwZSA9IE1vdXNlSW5wdXQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIFR5cGUgPSBUb3VjaE1vdXNlSW5wdXQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IChUeXBlKShtYW5hZ2VyLCBpbnB1dEhhbmRsZXIpO1xyXG59XHJcblxyXG4vKipcclxuICogaGFuZGxlIGlucHV0IGV2ZW50c1xyXG4gKiBAcGFyYW0ge01hbmFnZXJ9IG1hbmFnZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcclxuICovXHJcbmZ1bmN0aW9uIGlucHV0SGFuZGxlcihtYW5hZ2VyLCBldmVudFR5cGUsIGlucHV0KSB7XHJcbiAgICB2YXIgcG9pbnRlcnNMZW4gPSBpbnB1dC5wb2ludGVycy5sZW5ndGg7XHJcbiAgICB2YXIgY2hhbmdlZFBvaW50ZXJzTGVuID0gaW5wdXQuY2hhbmdlZFBvaW50ZXJzLmxlbmd0aDtcclxuICAgIHZhciBpc0ZpcnN0ID0gKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIChwb2ludGVyc0xlbiAtIGNoYW5nZWRQb2ludGVyc0xlbiA9PT0gMCkpO1xyXG4gICAgdmFyIGlzRmluYWwgPSAoZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkgJiYgKHBvaW50ZXJzTGVuIC0gY2hhbmdlZFBvaW50ZXJzTGVuID09PSAwKSk7XHJcblxyXG4gICAgaW5wdXQuaXNGaXJzdCA9ICEhaXNGaXJzdDtcclxuICAgIGlucHV0LmlzRmluYWwgPSAhIWlzRmluYWw7XHJcblxyXG4gICAgaWYgKGlzRmlyc3QpIHtcclxuICAgICAgICBtYW5hZ2VyLnNlc3Npb24gPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzb3VyY2UgZXZlbnQgaXMgdGhlIG5vcm1hbGl6ZWQgdmFsdWUgb2YgdGhlIGRvbUV2ZW50c1xyXG4gICAgLy8gbGlrZSAndG91Y2hzdGFydCwgbW91c2V1cCwgcG9pbnRlcmRvd24nXHJcbiAgICBpbnB1dC5ldmVudFR5cGUgPSBldmVudFR5cGU7XHJcblxyXG4gICAgLy8gY29tcHV0ZSBzY2FsZSwgcm90YXRpb24gZXRjXHJcbiAgICBjb21wdXRlSW5wdXREYXRhKG1hbmFnZXIsIGlucHV0KTtcclxuXHJcbiAgICAvLyBlbWl0IHNlY3JldCBldmVudFxyXG4gICAgbWFuYWdlci5lbWl0KCdoYW1tZXIuaW5wdXQnLCBpbnB1dCk7XHJcblxyXG4gICAgbWFuYWdlci5yZWNvZ25pemUoaW5wdXQpO1xyXG4gICAgbWFuYWdlci5zZXNzaW9uLnByZXZJbnB1dCA9IGlucHV0O1xyXG59XHJcblxyXG4vKipcclxuICogZXh0ZW5kIHRoZSBkYXRhIHdpdGggc29tZSB1c2FibGUgcHJvcGVydGllcyBsaWtlIHNjYWxlLCByb3RhdGUsIHZlbG9jaXR5IGV0Y1xyXG4gKiBAcGFyYW0ge09iamVjdH0gbWFuYWdlclxyXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcclxuICovXHJcbmZ1bmN0aW9uIGNvbXB1dGVJbnB1dERhdGEobWFuYWdlciwgaW5wdXQpIHtcclxuICAgIHZhciBzZXNzaW9uID0gbWFuYWdlci5zZXNzaW9uO1xyXG4gICAgdmFyIHBvaW50ZXJzID0gaW5wdXQucG9pbnRlcnM7XHJcbiAgICB2YXIgcG9pbnRlcnNMZW5ndGggPSBwb2ludGVycy5sZW5ndGg7XHJcblxyXG4gICAgLy8gc3RvcmUgdGhlIGZpcnN0IGlucHV0IHRvIGNhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgYW5kIGRpcmVjdGlvblxyXG4gICAgaWYgKCFzZXNzaW9uLmZpcnN0SW5wdXQpIHtcclxuICAgICAgICBzZXNzaW9uLmZpcnN0SW5wdXQgPSBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdG8gY29tcHV0ZSBzY2FsZSBhbmQgcm90YXRpb24gd2UgbmVlZCB0byBzdG9yZSB0aGUgbXVsdGlwbGUgdG91Y2hlc1xyXG4gICAgaWYgKHBvaW50ZXJzTGVuZ3RoID4gMSAmJiAhc2Vzc2lvbi5maXJzdE11bHRpcGxlKSB7XHJcbiAgICAgICAgc2Vzc2lvbi5maXJzdE11bHRpcGxlID0gc2ltcGxlQ2xvbmVJbnB1dERhdGEoaW5wdXQpO1xyXG4gICAgfSBlbHNlIGlmIChwb2ludGVyc0xlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIHNlc3Npb24uZmlyc3RNdWx0aXBsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBmaXJzdElucHV0ID0gc2Vzc2lvbi5maXJzdElucHV0O1xyXG4gICAgdmFyIGZpcnN0TXVsdGlwbGUgPSBzZXNzaW9uLmZpcnN0TXVsdGlwbGU7XHJcbiAgICB2YXIgb2Zmc2V0Q2VudGVyID0gZmlyc3RNdWx0aXBsZSA/IGZpcnN0TXVsdGlwbGUuY2VudGVyIDogZmlyc3RJbnB1dC5jZW50ZXI7XHJcblxyXG4gICAgdmFyIGNlbnRlciA9IGlucHV0LmNlbnRlciA9IGdldENlbnRlcihwb2ludGVycyk7XHJcbiAgICBpbnB1dC50aW1lU3RhbXAgPSBub3coKTtcclxuICAgIGlucHV0LmRlbHRhVGltZSA9IGlucHV0LnRpbWVTdGFtcCAtIGZpcnN0SW5wdXQudGltZVN0YW1wO1xyXG5cclxuICAgIGlucHV0LmFuZ2xlID0gZ2V0QW5nbGUob2Zmc2V0Q2VudGVyLCBjZW50ZXIpO1xyXG4gICAgaW5wdXQuZGlzdGFuY2UgPSBnZXREaXN0YW5jZShvZmZzZXRDZW50ZXIsIGNlbnRlcik7XHJcblxyXG4gICAgY29tcHV0ZURlbHRhWFkoc2Vzc2lvbiwgaW5wdXQpO1xyXG4gICAgaW5wdXQub2Zmc2V0RGlyZWN0aW9uID0gZ2V0RGlyZWN0aW9uKGlucHV0LmRlbHRhWCwgaW5wdXQuZGVsdGFZKTtcclxuXHJcbiAgICBpbnB1dC5zY2FsZSA9IGZpcnN0TXVsdGlwbGUgPyBnZXRTY2FsZShmaXJzdE11bHRpcGxlLnBvaW50ZXJzLCBwb2ludGVycykgOiAxO1xyXG4gICAgaW5wdXQucm90YXRpb24gPSBmaXJzdE11bHRpcGxlID8gZ2V0Um90YXRpb24oZmlyc3RNdWx0aXBsZS5wb2ludGVycywgcG9pbnRlcnMpIDogMDtcclxuXHJcbiAgICBjb21wdXRlSW50ZXJ2YWxJbnB1dERhdGEoc2Vzc2lvbiwgaW5wdXQpO1xyXG5cclxuICAgIC8vIGZpbmQgdGhlIGNvcnJlY3QgdGFyZ2V0XHJcbiAgICB2YXIgdGFyZ2V0ID0gbWFuYWdlci5lbGVtZW50O1xyXG4gICAgaWYgKGhhc1BhcmVudChpbnB1dC5zcmNFdmVudC50YXJnZXQsIHRhcmdldCkpIHtcclxuICAgICAgICB0YXJnZXQgPSBpbnB1dC5zcmNFdmVudC50YXJnZXQ7XHJcbiAgICB9XHJcbiAgICBpbnB1dC50YXJnZXQgPSB0YXJnZXQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbXB1dGVEZWx0YVhZKHNlc3Npb24sIGlucHV0KSB7XHJcbiAgICB2YXIgY2VudGVyID0gaW5wdXQuY2VudGVyO1xyXG4gICAgdmFyIG9mZnNldCA9IHNlc3Npb24ub2Zmc2V0RGVsdGEgfHwge307XHJcbiAgICB2YXIgcHJldkRlbHRhID0gc2Vzc2lvbi5wcmV2RGVsdGEgfHwge307XHJcbiAgICB2YXIgcHJldklucHV0ID0gc2Vzc2lvbi5wcmV2SW5wdXQgfHwge307XHJcblxyXG4gICAgaWYgKGlucHV0LmV2ZW50VHlwZSA9PT0gSU5QVVRfU1RBUlQgfHwgcHJldklucHV0LmV2ZW50VHlwZSA9PT0gSU5QVVRfRU5EKSB7XHJcbiAgICAgICAgcHJldkRlbHRhID0gc2Vzc2lvbi5wcmV2RGVsdGEgPSB7XHJcbiAgICAgICAgICAgIHg6IHByZXZJbnB1dC5kZWx0YVggfHwgMCxcclxuICAgICAgICAgICAgeTogcHJldklucHV0LmRlbHRhWSB8fCAwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgb2Zmc2V0ID0gc2Vzc2lvbi5vZmZzZXREZWx0YSA9IHtcclxuICAgICAgICAgICAgeDogY2VudGVyLngsXHJcbiAgICAgICAgICAgIHk6IGNlbnRlci55XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpbnB1dC5kZWx0YVggPSBwcmV2RGVsdGEueCArIChjZW50ZXIueCAtIG9mZnNldC54KTtcclxuICAgIGlucHV0LmRlbHRhWSA9IHByZXZEZWx0YS55ICsgKGNlbnRlci55IC0gb2Zmc2V0LnkpO1xyXG59XHJcblxyXG4vKipcclxuICogdmVsb2NpdHkgaXMgY2FsY3VsYXRlZCBldmVyeSB4IG1zXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXNzaW9uXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxyXG4gKi9cclxuZnVuY3Rpb24gY29tcHV0ZUludGVydmFsSW5wdXREYXRhKHNlc3Npb24sIGlucHV0KSB7XHJcbiAgICB2YXIgbGFzdCA9IHNlc3Npb24ubGFzdEludGVydmFsIHx8IGlucHV0LFxyXG4gICAgICAgIGRlbHRhVGltZSA9IGlucHV0LnRpbWVTdGFtcCAtIGxhc3QudGltZVN0YW1wLFxyXG4gICAgICAgIHZlbG9jaXR5LCB2ZWxvY2l0eVgsIHZlbG9jaXR5WSwgZGlyZWN0aW9uO1xyXG5cclxuICAgIGlmIChpbnB1dC5ldmVudFR5cGUgIT0gSU5QVVRfQ0FOQ0VMICYmIChkZWx0YVRpbWUgPiBDT01QVVRFX0lOVEVSVkFMIHx8IGxhc3QudmVsb2NpdHkgPT09IHVuZGVmaW5lZCkpIHtcclxuICAgICAgICB2YXIgZGVsdGFYID0gbGFzdC5kZWx0YVggLSBpbnB1dC5kZWx0YVg7XHJcbiAgICAgICAgdmFyIGRlbHRhWSA9IGxhc3QuZGVsdGFZIC0gaW5wdXQuZGVsdGFZO1xyXG5cclxuICAgICAgICB2YXIgdiA9IGdldFZlbG9jaXR5KGRlbHRhVGltZSwgZGVsdGFYLCBkZWx0YVkpO1xyXG4gICAgICAgIHZlbG9jaXR5WCA9IHYueDtcclxuICAgICAgICB2ZWxvY2l0eVkgPSB2Lnk7XHJcbiAgICAgICAgdmVsb2NpdHkgPSAoYWJzKHYueCkgPiBhYnModi55KSkgPyB2LnggOiB2Lnk7XHJcbiAgICAgICAgZGlyZWN0aW9uID0gZ2V0RGlyZWN0aW9uKGRlbHRhWCwgZGVsdGFZKTtcclxuXHJcbiAgICAgICAgc2Vzc2lvbi5sYXN0SW50ZXJ2YWwgPSBpbnB1dDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gdXNlIGxhdGVzdCB2ZWxvY2l0eSBpbmZvIGlmIGl0IGRvZXNuJ3Qgb3ZlcnRha2UgYSBtaW5pbXVtIHBlcmlvZFxyXG4gICAgICAgIHZlbG9jaXR5ID0gbGFzdC52ZWxvY2l0eTtcclxuICAgICAgICB2ZWxvY2l0eVggPSBsYXN0LnZlbG9jaXR5WDtcclxuICAgICAgICB2ZWxvY2l0eVkgPSBsYXN0LnZlbG9jaXR5WTtcclxuICAgICAgICBkaXJlY3Rpb24gPSBsYXN0LmRpcmVjdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBpbnB1dC52ZWxvY2l0eSA9IHZlbG9jaXR5O1xyXG4gICAgaW5wdXQudmVsb2NpdHlYID0gdmVsb2NpdHlYO1xyXG4gICAgaW5wdXQudmVsb2NpdHlZID0gdmVsb2NpdHlZO1xyXG4gICAgaW5wdXQuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG59XHJcblxyXG4vKipcclxuICogY3JlYXRlIGEgc2ltcGxlIGNsb25lIGZyb20gdGhlIGlucHV0IHVzZWQgZm9yIHN0b3JhZ2Ugb2YgZmlyc3RJbnB1dCBhbmQgZmlyc3RNdWx0aXBsZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcclxuICogQHJldHVybnMge09iamVjdH0gY2xvbmVkSW5wdXREYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCkge1xyXG4gICAgLy8gbWFrZSBhIHNpbXBsZSBjb3B5IG9mIHRoZSBwb2ludGVycyBiZWNhdXNlIHdlIHdpbGwgZ2V0IGEgcmVmZXJlbmNlIGlmIHdlIGRvbid0XHJcbiAgICAvLyB3ZSBvbmx5IG5lZWQgY2xpZW50WFkgZm9yIHRoZSBjYWxjdWxhdGlvbnNcclxuICAgIHZhciBwb2ludGVycyA9IFtdO1xyXG4gICAgdmFyIGkgPSAwO1xyXG4gICAgd2hpbGUgKGkgPCBpbnB1dC5wb2ludGVycy5sZW5ndGgpIHtcclxuICAgICAgICBwb2ludGVyc1tpXSA9IHtcclxuICAgICAgICAgICAgY2xpZW50WDogcm91bmQoaW5wdXQucG9pbnRlcnNbaV0uY2xpZW50WCksXHJcbiAgICAgICAgICAgIGNsaWVudFk6IHJvdW5kKGlucHV0LnBvaW50ZXJzW2ldLmNsaWVudFkpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpKys7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0aW1lU3RhbXA6IG5vdygpLFxyXG4gICAgICAgIHBvaW50ZXJzOiBwb2ludGVycyxcclxuICAgICAgICBjZW50ZXI6IGdldENlbnRlcihwb2ludGVycyksXHJcbiAgICAgICAgZGVsdGFYOiBpbnB1dC5kZWx0YVgsXHJcbiAgICAgICAgZGVsdGFZOiBpbnB1dC5kZWx0YVlcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBnZXQgdGhlIGNlbnRlciBvZiBhbGwgdGhlIHBvaW50ZXJzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ZXJzXHJcbiAqIEByZXR1cm4ge09iamVjdH0gY2VudGVyIGNvbnRhaW5zIGB4YCBhbmQgYHlgIHByb3BlcnRpZXNcclxuICovXHJcbmZ1bmN0aW9uIGdldENlbnRlcihwb2ludGVycykge1xyXG4gICAgdmFyIHBvaW50ZXJzTGVuZ3RoID0gcG9pbnRlcnMubGVuZ3RoO1xyXG5cclxuICAgIC8vIG5vIG5lZWQgdG8gbG9vcCB3aGVuIG9ubHkgb25lIHRvdWNoXHJcbiAgICBpZiAocG9pbnRlcnNMZW5ndGggPT09IDEpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiByb3VuZChwb2ludGVyc1swXS5jbGllbnRYKSxcclxuICAgICAgICAgICAgeTogcm91bmQocG9pbnRlcnNbMF0uY2xpZW50WSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB4ID0gMCwgeSA9IDAsIGkgPSAwO1xyXG4gICAgd2hpbGUgKGkgPCBwb2ludGVyc0xlbmd0aCkge1xyXG4gICAgICAgIHggKz0gcG9pbnRlcnNbaV0uY2xpZW50WDtcclxuICAgICAgICB5ICs9IHBvaW50ZXJzW2ldLmNsaWVudFk7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogcm91bmQoeCAvIHBvaW50ZXJzTGVuZ3RoKSxcclxuICAgICAgICB5OiByb3VuZCh5IC8gcG9pbnRlcnNMZW5ndGgpXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogY2FsY3VsYXRlIHRoZSB2ZWxvY2l0eSBiZXR3ZWVuIHR3byBwb2ludHMuIHVuaXQgaXMgaW4gcHggcGVyIG1zLlxyXG4gKiBAcGFyYW0ge051bWJlcn0gZGVsdGFUaW1lXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5XHJcbiAqIEByZXR1cm4ge09iamVjdH0gdmVsb2NpdHkgYHhgIGFuZCBgeWBcclxuICovXHJcbmZ1bmN0aW9uIGdldFZlbG9jaXR5KGRlbHRhVGltZSwgeCwgeSkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiB4IC8gZGVsdGFUaW1lIHx8IDAsXHJcbiAgICAgICAgeTogeSAvIGRlbHRhVGltZSB8fCAwXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogZ2V0IHRoZSBkaXJlY3Rpb24gYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5XHJcbiAqIEByZXR1cm4ge051bWJlcn0gZGlyZWN0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXREaXJlY3Rpb24oeCwgeSkge1xyXG4gICAgaWYgKHggPT09IHkpIHtcclxuICAgICAgICByZXR1cm4gRElSRUNUSU9OX05PTkU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFicyh4KSA+PSBhYnMoeSkpIHtcclxuICAgICAgICByZXR1cm4geCA+IDAgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVDtcclxuICAgIH1cclxuICAgIHJldHVybiB5ID4gMCA/IERJUkVDVElPTl9VUCA6IERJUkVDVElPTl9ET1dOO1xyXG59XHJcblxyXG4vKipcclxuICogY2FsY3VsYXRlIHRoZSBhYnNvbHV0ZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICogQHBhcmFtIHtPYmplY3R9IHAxIHt4LCB5fVxyXG4gKiBAcGFyYW0ge09iamVjdH0gcDIge3gsIHl9XHJcbiAqIEBwYXJhbSB7QXJyYXl9IFtwcm9wc10gY29udGFpbmluZyB4IGFuZCB5IGtleXNcclxuICogQHJldHVybiB7TnVtYmVyfSBkaXN0YW5jZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RGlzdGFuY2UocDEsIHAyLCBwcm9wcykge1xyXG4gICAgaWYgKCFwcm9wcykge1xyXG4gICAgICAgIHByb3BzID0gUFJPUFNfWFk7XHJcbiAgICB9XHJcbiAgICB2YXIgeCA9IHAyW3Byb3BzWzBdXSAtIHAxW3Byb3BzWzBdXSxcclxuICAgICAgICB5ID0gcDJbcHJvcHNbMV1dIC0gcDFbcHJvcHNbMV1dO1xyXG5cclxuICAgIHJldHVybiBNYXRoLnNxcnQoKHggKiB4KSArICh5ICogeSkpO1xyXG59XHJcblxyXG4vKipcclxuICogY2FsY3VsYXRlIHRoZSBhbmdsZSBiZXR3ZWVuIHR3byBjb29yZGluYXRlc1xyXG4gKiBAcGFyYW0ge09iamVjdH0gcDFcclxuICogQHBhcmFtIHtPYmplY3R9IHAyXHJcbiAqIEBwYXJhbSB7QXJyYXl9IFtwcm9wc10gY29udGFpbmluZyB4IGFuZCB5IGtleXNcclxuICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0QW5nbGUocDEsIHAyLCBwcm9wcykge1xyXG4gICAgaWYgKCFwcm9wcykge1xyXG4gICAgICAgIHByb3BzID0gUFJPUFNfWFk7XHJcbiAgICB9XHJcbiAgICB2YXIgeCA9IHAyW3Byb3BzWzBdXSAtIHAxW3Byb3BzWzBdXSxcclxuICAgICAgICB5ID0gcDJbcHJvcHNbMV1dIC0gcDFbcHJvcHNbMV1dO1xyXG4gICAgcmV0dXJuIE1hdGguYXRhbjIoeSwgeCkgKiAxODAgLyBNYXRoLlBJO1xyXG59XHJcblxyXG4vKipcclxuICogY2FsY3VsYXRlIHRoZSByb3RhdGlvbiBkZWdyZWVzIGJldHdlZW4gdHdvIHBvaW50ZXJzZXRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0IGFycmF5IG9mIHBvaW50ZXJzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGVuZCBhcnJheSBvZiBwb2ludGVyc1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IHJvdGF0aW9uXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRSb3RhdGlvbihzdGFydCwgZW5kKSB7XHJcbiAgICByZXR1cm4gZ2V0QW5nbGUoZW5kWzFdLCBlbmRbMF0sIFBST1BTX0NMSUVOVF9YWSkgLSBnZXRBbmdsZShzdGFydFsxXSwgc3RhcnRbMF0sIFBST1BTX0NMSUVOVF9YWSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBjYWxjdWxhdGUgdGhlIHNjYWxlIGZhY3RvciBiZXR3ZWVuIHR3byBwb2ludGVyc2V0c1xyXG4gKiBubyBzY2FsZSBpcyAxLCBhbmQgZ29lcyBkb3duIHRvIDAgd2hlbiBwaW5jaGVkIHRvZ2V0aGVyLCBhbmQgYmlnZ2VyIHdoZW4gcGluY2hlZCBvdXRcclxuICogQHBhcmFtIHtBcnJheX0gc3RhcnQgYXJyYXkgb2YgcG9pbnRlcnNcclxuICogQHBhcmFtIHtBcnJheX0gZW5kIGFycmF5IG9mIHBvaW50ZXJzXHJcbiAqIEByZXR1cm4ge051bWJlcn0gc2NhbGVcclxuICovXHJcbmZ1bmN0aW9uIGdldFNjYWxlKHN0YXJ0LCBlbmQpIHtcclxuICAgIHJldHVybiBnZXREaXN0YW5jZShlbmRbMF0sIGVuZFsxXSwgUFJPUFNfQ0xJRU5UX1hZKSAvIGdldERpc3RhbmNlKHN0YXJ0WzBdLCBzdGFydFsxXSwgUFJPUFNfQ0xJRU5UX1hZKTtcclxufVxyXG5cclxudmFyIE1PVVNFX0lOUFVUX01BUCA9IHtcclxuICAgIG1vdXNlZG93bjogSU5QVVRfU1RBUlQsXHJcbiAgICBtb3VzZW1vdmU6IElOUFVUX01PVkUsXHJcbiAgICBtb3VzZXVwOiBJTlBVVF9FTkRcclxufTtcclxuXHJcbnZhciBNT1VTRV9FTEVNRU5UX0VWRU5UUyA9ICdtb3VzZWRvd24nO1xyXG52YXIgTU9VU0VfV0lORE9XX0VWRU5UUyA9ICdtb3VzZW1vdmUgbW91c2V1cCc7XHJcblxyXG4vKipcclxuICogTW91c2UgZXZlbnRzIGlucHV0XHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAZXh0ZW5kcyBJbnB1dFxyXG4gKi9cclxuZnVuY3Rpb24gTW91c2VJbnB1dCgpIHtcclxuICAgIHRoaXMuZXZFbCA9IE1PVVNFX0VMRU1FTlRfRVZFTlRTO1xyXG4gICAgdGhpcy5ldldpbiA9IE1PVVNFX1dJTkRPV19FVkVOVFM7XHJcblxyXG4gICAgdGhpcy5hbGxvdyA9IHRydWU7IC8vIHVzZWQgYnkgSW5wdXQuVG91Y2hNb3VzZSB0byBkaXNhYmxlIG1vdXNlIGV2ZW50c1xyXG4gICAgdGhpcy5wcmVzc2VkID0gZmFsc2U7IC8vIG1vdXNlZG93biBzdGF0ZVxyXG5cclxuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmluaGVyaXQoTW91c2VJbnB1dCwgSW5wdXQsIHtcclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdXNlIGV2ZW50c1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XHJcbiAgICAgKi9cclxuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIE1FaGFuZGxlcihldikge1xyXG4gICAgICAgIHZhciBldmVudFR5cGUgPSBNT1VTRV9JTlBVVF9NQVBbZXYudHlwZV07XHJcblxyXG4gICAgICAgIC8vIG9uIHN0YXJ0IHdlIHdhbnQgdG8gaGF2ZSB0aGUgbGVmdCBtb3VzZSBidXR0b24gZG93blxyXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCAmJiBldi5idXR0b24gPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9NT1ZFICYmIGV2LndoaWNoICE9PSAxKSB7XHJcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9IElOUFVUX0VORDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG1vdXNlIG11c3QgYmUgZG93biwgYW5kIG1vdXNlIGV2ZW50cyBhcmUgYWxsb3dlZCAoc2VlIHRoZSBUb3VjaE1vdXNlIGlucHV0KVxyXG4gICAgICAgIGlmICghdGhpcy5wcmVzc2VkIHx8ICF0aGlzLmFsbG93KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9FTkQpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVzc2VkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgZXZlbnRUeXBlLCB7XHJcbiAgICAgICAgICAgIHBvaW50ZXJzOiBbZXZdLFxyXG4gICAgICAgICAgICBjaGFuZ2VkUG9pbnRlcnM6IFtldl0sXHJcbiAgICAgICAgICAgIHBvaW50ZXJUeXBlOiBJTlBVVF9UWVBFX01PVVNFLFxyXG4gICAgICAgICAgICBzcmNFdmVudDogZXZcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcblxyXG52YXIgUE9JTlRFUl9JTlBVVF9NQVAgPSB7XHJcbiAgICBwb2ludGVyZG93bjogSU5QVVRfU1RBUlQsXHJcbiAgICBwb2ludGVybW92ZTogSU5QVVRfTU9WRSxcclxuICAgIHBvaW50ZXJ1cDogSU5QVVRfRU5ELFxyXG4gICAgcG9pbnRlcmNhbmNlbDogSU5QVVRfQ0FOQ0VMLFxyXG4gICAgcG9pbnRlcm91dDogSU5QVVRfQ0FOQ0VMXHJcbn07XHJcblxyXG4vLyBpbiBJRTEwIHRoZSBwb2ludGVyIHR5cGVzIGlzIGRlZmluZWQgYXMgYW4gZW51bVxyXG52YXIgSUUxMF9QT0lOVEVSX1RZUEVfRU5VTSA9IHtcclxuICAgIDI6IElOUFVUX1RZUEVfVE9VQ0gsXHJcbiAgICAzOiBJTlBVVF9UWVBFX1BFTixcclxuICAgIDQ6IElOUFVUX1RZUEVfTU9VU0UsXHJcbiAgICA1OiBJTlBVVF9UWVBFX0tJTkVDVCAvLyBzZWUgaHR0cHM6Ly90d2l0dGVyLmNvbS9qYWNvYnJvc3NpL3N0YXR1cy80ODA1OTY0Mzg0ODk4OTA4MTZcclxufTtcclxuXHJcbnZhciBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTID0gJ3BvaW50ZXJkb3duJztcclxudmFyIFBPSU5URVJfV0lORE9XX0VWRU5UUyA9ICdwb2ludGVybW92ZSBwb2ludGVydXAgcG9pbnRlcmNhbmNlbCc7XHJcblxyXG4vLyBJRTEwIGhhcyBwcmVmaXhlZCBzdXBwb3J0LCBhbmQgY2FzZS1zZW5zaXRpdmVcclxuaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xyXG4gICAgUE9JTlRFUl9FTEVNRU5UX0VWRU5UUyA9ICdNU1BvaW50ZXJEb3duJztcclxuICAgIFBPSU5URVJfV0lORE9XX0VWRU5UUyA9ICdNU1BvaW50ZXJNb3ZlIE1TUG9pbnRlclVwIE1TUG9pbnRlckNhbmNlbCc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQb2ludGVyIGV2ZW50cyBpbnB1dFxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGV4dGVuZHMgSW5wdXRcclxuICovXHJcbmZ1bmN0aW9uIFBvaW50ZXJFdmVudElucHV0KCkge1xyXG4gICAgdGhpcy5ldkVsID0gUE9JTlRFUl9FTEVNRU5UX0VWRU5UUztcclxuICAgIHRoaXMuZXZXaW4gPSBQT0lOVEVSX1dJTkRPV19FVkVOVFM7XHJcblxyXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcbiAgICB0aGlzLnN0b3JlID0gKHRoaXMubWFuYWdlci5zZXNzaW9uLnBvaW50ZXJFdmVudHMgPSBbXSk7XHJcbn1cclxuXHJcbmluaGVyaXQoUG9pbnRlckV2ZW50SW5wdXQsIElucHV0LCB7XHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBtb3VzZSBldmVudHNcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldlxyXG4gICAgICovXHJcbiAgICBoYW5kbGVyOiBmdW5jdGlvbiBQRWhhbmRsZXIoZXYpIHtcclxuICAgICAgICB2YXIgc3RvcmUgPSB0aGlzLnN0b3JlO1xyXG4gICAgICAgIHZhciByZW1vdmVQb2ludGVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBldmVudFR5cGVOb3JtYWxpemVkID0gZXYudHlwZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJ21zJywgJycpO1xyXG4gICAgICAgIHZhciBldmVudFR5cGUgPSBQT0lOVEVSX0lOUFVUX01BUFtldmVudFR5cGVOb3JtYWxpemVkXTtcclxuICAgICAgICB2YXIgcG9pbnRlclR5cGUgPSBJRTEwX1BPSU5URVJfVFlQRV9FTlVNW2V2LnBvaW50ZXJUeXBlXSB8fCBldi5wb2ludGVyVHlwZTtcclxuXHJcbiAgICAgICAgdmFyIGlzVG91Y2ggPSAocG9pbnRlclR5cGUgPT0gSU5QVVRfVFlQRV9UT1VDSCk7XHJcblxyXG4gICAgICAgIC8vIGdldCBpbmRleCBvZiB0aGUgZXZlbnQgaW4gdGhlIHN0b3JlXHJcbiAgICAgICAgdmFyIHN0b3JlSW5kZXggPSBpbkFycmF5KHN0b3JlLCBldi5wb2ludGVySWQsICdwb2ludGVySWQnKTtcclxuXHJcbiAgICAgICAgLy8gc3RhcnQgYW5kIG1vdXNlIG11c3QgYmUgZG93blxyXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCAmJiAoZXYuYnV0dG9uID09PSAwIHx8IGlzVG91Y2gpKSB7XHJcbiAgICAgICAgICAgIGlmIChzdG9yZUluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgc3RvcmUucHVzaChldik7XHJcbiAgICAgICAgICAgICAgICBzdG9yZUluZGV4ID0gc3RvcmUubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcclxuICAgICAgICAgICAgcmVtb3ZlUG9pbnRlciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpdCBub3QgZm91bmQsIHNvIHRoZSBwb2ludGVyIGhhc24ndCBiZWVuIGRvd24gKHNvIGl0J3MgcHJvYmFibHkgYSBob3ZlcilcclxuICAgICAgICBpZiAoc3RvcmVJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBldmVudCBpbiB0aGUgc3RvcmVcclxuICAgICAgICBzdG9yZVtzdG9yZUluZGV4XSA9IGV2O1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgZXZlbnRUeXBlLCB7XHJcbiAgICAgICAgICAgIHBvaW50ZXJzOiBzdG9yZSxcclxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiBbZXZdLFxyXG4gICAgICAgICAgICBwb2ludGVyVHlwZTogcG9pbnRlclR5cGUsXHJcbiAgICAgICAgICAgIHNyY0V2ZW50OiBldlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVtb3ZlUG9pbnRlcikge1xyXG4gICAgICAgICAgICAvLyByZW1vdmUgZnJvbSB0aGUgc3RvcmVcclxuICAgICAgICAgICAgc3RvcmUuc3BsaWNlKHN0b3JlSW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG52YXIgU0lOR0xFX1RPVUNIX0lOUFVUX01BUCA9IHtcclxuICAgIHRvdWNoc3RhcnQ6IElOUFVUX1NUQVJULFxyXG4gICAgdG91Y2htb3ZlOiBJTlBVVF9NT1ZFLFxyXG4gICAgdG91Y2hlbmQ6IElOUFVUX0VORCxcclxuICAgIHRvdWNoY2FuY2VsOiBJTlBVVF9DQU5DRUxcclxufTtcclxuXHJcbnZhciBTSU5HTEVfVE9VQ0hfVEFSR0VUX0VWRU5UUyA9ICd0b3VjaHN0YXJ0JztcclxudmFyIFNJTkdMRV9UT1VDSF9XSU5ET1dfRVZFTlRTID0gJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJztcclxuXHJcbi8qKlxyXG4gKiBUb3VjaCBldmVudHMgaW5wdXRcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBleHRlbmRzIElucHV0XHJcbiAqL1xyXG5mdW5jdGlvbiBTaW5nbGVUb3VjaElucHV0KCkge1xyXG4gICAgdGhpcy5ldlRhcmdldCA9IFNJTkdMRV9UT1VDSF9UQVJHRVRfRVZFTlRTO1xyXG4gICAgdGhpcy5ldldpbiA9IFNJTkdMRV9UT1VDSF9XSU5ET1dfRVZFTlRTO1xyXG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcblxyXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuaW5oZXJpdChTaW5nbGVUb3VjaElucHV0LCBJbnB1dCwge1xyXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gVEVoYW5kbGVyKGV2KSB7XHJcbiAgICAgICAgdmFyIHR5cGUgPSBTSU5HTEVfVE9VQ0hfSU5QVVRfTUFQW2V2LnR5cGVdO1xyXG5cclxuICAgICAgICAvLyBzaG91bGQgd2UgaGFuZGxlIHRoZSB0b3VjaCBldmVudHM/XHJcbiAgICAgICAgaWYgKHR5cGUgPT09IElOUFVUX1NUQVJUKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuc3RhcnRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgdG91Y2hlcyA9IG5vcm1hbGl6ZVNpbmdsZVRvdWNoZXMuY2FsbCh0aGlzLCBldiwgdHlwZSk7XHJcblxyXG4gICAgICAgIC8vIHdoZW4gZG9uZSwgcmVzZXQgdGhlIHN0YXJ0ZWQgc3RhdGVcclxuICAgICAgICBpZiAodHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpICYmIHRvdWNoZXNbMF0ubGVuZ3RoIC0gdG91Y2hlc1sxXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgdHlwZSwge1xyXG4gICAgICAgICAgICBwb2ludGVyczogdG91Y2hlc1swXSxcclxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiB0b3VjaGVzWzFdLFxyXG4gICAgICAgICAgICBwb2ludGVyVHlwZTogSU5QVVRfVFlQRV9UT1VDSCxcclxuICAgICAgICAgICAgc3JjRXZlbnQ6IGV2XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIEB0aGlzIHtUb3VjaElucHV0fVxyXG4gKiBAcGFyYW0ge09iamVjdH0gZXZcclxuICogQHBhcmFtIHtOdW1iZXJ9IHR5cGUgZmxhZ1xyXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfEFycmF5fSBbYWxsLCBjaGFuZ2VkXVxyXG4gKi9cclxuZnVuY3Rpb24gbm9ybWFsaXplU2luZ2xlVG91Y2hlcyhldiwgdHlwZSkge1xyXG4gICAgdmFyIGFsbCA9IHRvQXJyYXkoZXYudG91Y2hlcyk7XHJcbiAgICB2YXIgY2hhbmdlZCA9IHRvQXJyYXkoZXYuY2hhbmdlZFRvdWNoZXMpO1xyXG5cclxuICAgIGlmICh0eXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcclxuICAgICAgICBhbGwgPSB1bmlxdWVBcnJheShhbGwuY29uY2F0KGNoYW5nZWQpLCAnaWRlbnRpZmllcicsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbYWxsLCBjaGFuZ2VkXTtcclxufVxyXG5cclxudmFyIFRPVUNIX0lOUFVUX01BUCA9IHtcclxuICAgIHRvdWNoc3RhcnQ6IElOUFVUX1NUQVJULFxyXG4gICAgdG91Y2htb3ZlOiBJTlBVVF9NT1ZFLFxyXG4gICAgdG91Y2hlbmQ6IElOUFVUX0VORCxcclxuICAgIHRvdWNoY2FuY2VsOiBJTlBVVF9DQU5DRUxcclxufTtcclxuXHJcbnZhciBUT1VDSF9UQVJHRVRfRVZFTlRTID0gJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJztcclxuXHJcbi8qKlxyXG4gKiBNdWx0aS11c2VyIHRvdWNoIGV2ZW50cyBpbnB1dFxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGV4dGVuZHMgSW5wdXRcclxuICovXHJcbmZ1bmN0aW9uIFRvdWNoSW5wdXQoKSB7XHJcbiAgICB0aGlzLmV2VGFyZ2V0ID0gVE9VQ0hfVEFSR0VUX0VWRU5UUztcclxuICAgIHRoaXMudGFyZ2V0SWRzID0ge307XHJcblxyXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuaW5oZXJpdChUb3VjaElucHV0LCBJbnB1dCwge1xyXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gTVRFaGFuZGxlcihldikge1xyXG4gICAgICAgIHZhciB0eXBlID0gVE9VQ0hfSU5QVVRfTUFQW2V2LnR5cGVdO1xyXG4gICAgICAgIHZhciB0b3VjaGVzID0gZ2V0VG91Y2hlcy5jYWxsKHRoaXMsIGV2LCB0eXBlKTtcclxuICAgICAgICBpZiAoIXRvdWNoZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLm1hbmFnZXIsIHR5cGUsIHtcclxuICAgICAgICAgICAgcG9pbnRlcnM6IHRvdWNoZXNbMF0sXHJcbiAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogdG91Y2hlc1sxXSxcclxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IElOUFVUX1RZUEVfVE9VQ0gsXHJcbiAgICAgICAgICAgIHNyY0V2ZW50OiBldlxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBAdGhpcyB7VG91Y2hJbnB1dH1cclxuICogQHBhcmFtIHtPYmplY3R9IGV2XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eXBlIGZsYWdcclxuICogQHJldHVybnMge3VuZGVmaW5lZHxBcnJheX0gW2FsbCwgY2hhbmdlZF1cclxuICovXHJcbmZ1bmN0aW9uIGdldFRvdWNoZXMoZXYsIHR5cGUpIHtcclxuICAgIHZhciBhbGxUb3VjaGVzID0gdG9BcnJheShldi50b3VjaGVzKTtcclxuICAgIHZhciB0YXJnZXRJZHMgPSB0aGlzLnRhcmdldElkcztcclxuXHJcbiAgICAvLyB3aGVuIHRoZXJlIGlzIG9ubHkgb25lIHRvdWNoLCB0aGUgcHJvY2VzcyBjYW4gYmUgc2ltcGxpZmllZFxyXG4gICAgaWYgKHR5cGUgJiAoSU5QVVRfU1RBUlQgfCBJTlBVVF9NT1ZFKSAmJiBhbGxUb3VjaGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIHRhcmdldElkc1thbGxUb3VjaGVzWzBdLmlkZW50aWZpZXJdID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gW2FsbFRvdWNoZXMsIGFsbFRvdWNoZXNdO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpLFxyXG4gICAgICAgIHRhcmdldFRvdWNoZXMsXHJcbiAgICAgICAgY2hhbmdlZFRvdWNoZXMgPSB0b0FycmF5KGV2LmNoYW5nZWRUb3VjaGVzKSxcclxuICAgICAgICBjaGFuZ2VkVGFyZ2V0VG91Y2hlcyA9IFtdLFxyXG4gICAgICAgIHRhcmdldCA9IHRoaXMudGFyZ2V0O1xyXG5cclxuICAgIC8vIGdldCB0YXJnZXQgdG91Y2hlcyBmcm9tIHRvdWNoZXNcclxuICAgIHRhcmdldFRvdWNoZXMgPSBhbGxUb3VjaGVzLmZpbHRlcihmdW5jdGlvbih0b3VjaCkge1xyXG4gICAgICAgIHJldHVybiBoYXNQYXJlbnQodG91Y2gudGFyZ2V0LCB0YXJnZXQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gY29sbGVjdCB0b3VjaGVzXHJcbiAgICBpZiAodHlwZSA9PT0gSU5QVVRfU1RBUlQpIHtcclxuICAgICAgICBpID0gMDtcclxuICAgICAgICB3aGlsZSAoaSA8IHRhcmdldFRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRhcmdldElkc1t0YXJnZXRUb3VjaGVzW2ldLmlkZW50aWZpZXJdID0gdHJ1ZTtcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBmaWx0ZXIgY2hhbmdlZCB0b3VjaGVzIHRvIG9ubHkgY29udGFpbiB0b3VjaGVzIHRoYXQgZXhpc3QgaW4gdGhlIGNvbGxlY3RlZCB0YXJnZXQgaWRzXHJcbiAgICBpID0gMDtcclxuICAgIHdoaWxlIChpIDwgY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgaWYgKHRhcmdldElkc1tjaGFuZ2VkVG91Y2hlc1tpXS5pZGVudGlmaWVyXSkge1xyXG4gICAgICAgICAgICBjaGFuZ2VkVGFyZ2V0VG91Y2hlcy5wdXNoKGNoYW5nZWRUb3VjaGVzW2ldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNsZWFudXAgcmVtb3ZlZCB0b3VjaGVzXHJcbiAgICAgICAgaWYgKHR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSkge1xyXG4gICAgICAgICAgICBkZWxldGUgdGFyZ2V0SWRzW2NoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpKys7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFjaGFuZ2VkVGFyZ2V0VG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgICAvLyBtZXJnZSB0YXJnZXRUb3VjaGVzIHdpdGggY2hhbmdlZFRhcmdldFRvdWNoZXMgc28gaXQgY29udGFpbnMgQUxMIHRvdWNoZXMsIGluY2x1ZGluZyAnZW5kJyBhbmQgJ2NhbmNlbCdcclxuICAgICAgICB1bmlxdWVBcnJheSh0YXJnZXRUb3VjaGVzLmNvbmNhdChjaGFuZ2VkVGFyZ2V0VG91Y2hlcyksICdpZGVudGlmaWVyJywgdHJ1ZSksXHJcbiAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXNcclxuICAgIF07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb21iaW5lZCB0b3VjaCBhbmQgbW91c2UgaW5wdXRcclxuICpcclxuICogVG91Y2ggaGFzIGEgaGlnaGVyIHByaW9yaXR5IHRoZW4gbW91c2UsIGFuZCB3aGlsZSB0b3VjaGluZyBubyBtb3VzZSBldmVudHMgYXJlIGFsbG93ZWQuXHJcbiAqIFRoaXMgYmVjYXVzZSB0b3VjaCBkZXZpY2VzIGFsc28gZW1pdCBtb3VzZSBldmVudHMgd2hpbGUgZG9pbmcgYSB0b3VjaC5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBleHRlbmRzIElucHV0XHJcbiAqL1xyXG5mdW5jdGlvbiBUb3VjaE1vdXNlSW5wdXQoKSB7XHJcbiAgICBJbnB1dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cclxuICAgIHZhciBoYW5kbGVyID0gYmluZEZuKHRoaXMuaGFuZGxlciwgdGhpcyk7XHJcbiAgICB0aGlzLnRvdWNoID0gbmV3IFRvdWNoSW5wdXQodGhpcy5tYW5hZ2VyLCBoYW5kbGVyKTtcclxuICAgIHRoaXMubW91c2UgPSBuZXcgTW91c2VJbnB1dCh0aGlzLm1hbmFnZXIsIGhhbmRsZXIpO1xyXG59XHJcblxyXG5pbmhlcml0KFRvdWNoTW91c2VJbnB1dCwgSW5wdXQsIHtcclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdXNlIGFuZCB0b3VjaCBldmVudHNcclxuICAgICAqIEBwYXJhbSB7SGFtbWVyfSBtYW5hZ2VyXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXRFdmVudFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0RGF0YVxyXG4gICAgICovXHJcbiAgICBoYW5kbGVyOiBmdW5jdGlvbiBUTUVoYW5kbGVyKG1hbmFnZXIsIGlucHV0RXZlbnQsIGlucHV0RGF0YSkge1xyXG4gICAgICAgIHZhciBpc1RvdWNoID0gKGlucHV0RGF0YS5wb2ludGVyVHlwZSA9PSBJTlBVVF9UWVBFX1RPVUNIKSxcclxuICAgICAgICAgICAgaXNNb3VzZSA9IChpbnB1dERhdGEucG9pbnRlclR5cGUgPT0gSU5QVVRfVFlQRV9NT1VTRSk7XHJcblxyXG4gICAgICAgIC8vIHdoZW4gd2UncmUgaW4gYSB0b3VjaCBldmVudCwgc28gIGJsb2NrIGFsbCB1cGNvbWluZyBtb3VzZSBldmVudHNcclxuICAgICAgICAvLyBtb3N0IG1vYmlsZSBicm93c2VyIGFsc28gZW1pdCBtb3VzZWV2ZW50cywgcmlnaHQgYWZ0ZXIgdG91Y2hzdGFydFxyXG4gICAgICAgIGlmIChpc1RvdWNoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2UuYWxsb3cgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlzTW91c2UgJiYgIXRoaXMubW91c2UuYWxsb3cpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVzZXQgdGhlIGFsbG93TW91c2Ugd2hlbiB3ZSdyZSBkb25lXHJcbiAgICAgICAgaWYgKGlucHV0RXZlbnQgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlLmFsbG93ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sobWFuYWdlciwgaW5wdXRFdmVudCwgaW5wdXREYXRhKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgICovXHJcbiAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMudG91Y2guZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMubW91c2UuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbnZhciBQUkVGSVhFRF9UT1VDSF9BQ1RJT04gPSBwcmVmaXhlZChURVNUX0VMRU1FTlQuc3R5bGUsICd0b3VjaEFjdGlvbicpO1xyXG52YXIgTkFUSVZFX1RPVUNIX0FDVElPTiA9IFBSRUZJWEVEX1RPVUNIX0FDVElPTiAhPT0gdW5kZWZpbmVkO1xyXG5cclxuLy8gbWFnaWNhbCB0b3VjaEFjdGlvbiB2YWx1ZVxyXG52YXIgVE9VQ0hfQUNUSU9OX0NPTVBVVEUgPSAnY29tcHV0ZSc7XHJcbnZhciBUT1VDSF9BQ1RJT05fQVVUTyA9ICdhdXRvJztcclxudmFyIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT04gPSAnbWFuaXB1bGF0aW9uJzsgLy8gbm90IGltcGxlbWVudGVkXHJcbnZhciBUT1VDSF9BQ1RJT05fTk9ORSA9ICdub25lJztcclxudmFyIFRPVUNIX0FDVElPTl9QQU5fWCA9ICdwYW4teCc7XHJcbnZhciBUT1VDSF9BQ1RJT05fUEFOX1kgPSAncGFuLXknO1xyXG5cclxuLyoqXHJcbiAqIFRvdWNoIEFjdGlvblxyXG4gKiBzZXRzIHRoZSB0b3VjaEFjdGlvbiBwcm9wZXJ0eSBvciB1c2VzIHRoZSBqcyBhbHRlcm5hdGl2ZVxyXG4gKiBAcGFyYW0ge01hbmFnZXJ9IG1hbmFnZXJcclxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gVG91Y2hBY3Rpb24obWFuYWdlciwgdmFsdWUpIHtcclxuICAgIHRoaXMubWFuYWdlciA9IG1hbmFnZXI7XHJcbiAgICB0aGlzLnNldCh2YWx1ZSk7XHJcbn1cclxuXHJcblRvdWNoQWN0aW9uLnByb3RvdHlwZSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogc2V0IHRoZSB0b3VjaEFjdGlvbiB2YWx1ZSBvbiB0aGUgZWxlbWVudCBvciBlbmFibGUgdGhlIHBvbHlmaWxsXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcclxuICAgICAqL1xyXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgIC8vIGZpbmQgb3V0IHRoZSB0b3VjaC1hY3Rpb24gYnkgdGhlIGV2ZW50IGhhbmRsZXJzXHJcbiAgICAgICAgaWYgKHZhbHVlID09IFRPVUNIX0FDVElPTl9DT01QVVRFKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5jb21wdXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoTkFUSVZFX1RPVUNIX0FDVElPTikge1xyXG4gICAgICAgICAgICB0aGlzLm1hbmFnZXIuZWxlbWVudC5zdHlsZVtQUkVGSVhFRF9UT1VDSF9BQ1RJT05dID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHZhbHVlLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGp1c3QgcmUtc2V0IHRoZSB0b3VjaEFjdGlvbiB2YWx1ZVxyXG4gICAgICovXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2V0KHRoaXMubWFuYWdlci5vcHRpb25zLnRvdWNoQWN0aW9uKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb21wdXRlIHRoZSB2YWx1ZSBmb3IgdGhlIHRvdWNoQWN0aW9uIHByb3BlcnR5IGJhc2VkIG9uIHRoZSByZWNvZ25pemVyJ3Mgc2V0dGluZ3NcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGNvbXB1dGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBhY3Rpb25zID0gW107XHJcbiAgICAgICAgZWFjaCh0aGlzLm1hbmFnZXIucmVjb2duaXplcnMsIGZ1bmN0aW9uKHJlY29nbml6ZXIpIHtcclxuICAgICAgICAgICAgaWYgKGJvb2xPckZuKHJlY29nbml6ZXIub3B0aW9ucy5lbmFibGUsIFtyZWNvZ25pemVyXSkpIHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbnMgPSBhY3Rpb25zLmNvbmNhdChyZWNvZ25pemVyLmdldFRvdWNoQWN0aW9uKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNsZWFuVG91Y2hBY3Rpb25zKGFjdGlvbnMuam9pbignICcpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGlzIG1ldGhvZCBpcyBjYWxsZWQgb24gZWFjaCBpbnB1dCBjeWNsZSBhbmQgcHJvdmlkZXMgdGhlIHByZXZlbnRpbmcgb2YgdGhlIGJyb3dzZXIgYmVoYXZpb3JcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxyXG4gICAgICovXHJcbiAgICBwcmV2ZW50RGVmYXVsdHM6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgLy8gbm90IG5lZWRlZCB3aXRoIG5hdGl2ZSBzdXBwb3J0IGZvciB0aGUgdG91Y2hBY3Rpb24gcHJvcGVydHlcclxuICAgICAgICBpZiAoTkFUSVZFX1RPVUNIX0FDVElPTikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc3JjRXZlbnQgPSBpbnB1dC5zcmNFdmVudDtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gaW5wdXQub2Zmc2V0RGlyZWN0aW9uO1xyXG5cclxuICAgICAgICAvLyBpZiB0aGUgdG91Y2ggYWN0aW9uIGRpZCBwcmV2ZW50ZWQgb25jZSB0aGlzIHNlc3Npb25cclxuICAgICAgICBpZiAodGhpcy5tYW5hZ2VyLnNlc3Npb24ucHJldmVudGVkKSB7XHJcbiAgICAgICAgICAgIHNyY0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBhY3Rpb25zID0gdGhpcy5hY3Rpb25zO1xyXG4gICAgICAgIHZhciBoYXNOb25lID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX05PTkUpO1xyXG4gICAgICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKTtcclxuICAgICAgICB2YXIgaGFzUGFuWCA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9QQU5fWCk7XHJcblxyXG4gICAgICAgIGlmIChoYXNOb25lIHx8XHJcbiAgICAgICAgICAgIChoYXNQYW5ZICYmIGRpcmVjdGlvbiAmIERJUkVDVElPTl9IT1JJWk9OVEFMKSB8fFxyXG4gICAgICAgICAgICAoaGFzUGFuWCAmJiBkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByZXZlbnRTcmMoc3JjRXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsIHByZXZlbnREZWZhdWx0IHRvIHByZXZlbnQgdGhlIGJyb3dzZXIncyBkZWZhdWx0IGJlaGF2aW9yIChzY3JvbGxpbmcgaW4gbW9zdCBjYXNlcylcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcmNFdmVudFxyXG4gICAgICovXHJcbiAgICBwcmV2ZW50U3JjOiBmdW5jdGlvbihzcmNFdmVudCkge1xyXG4gICAgICAgIHRoaXMubWFuYWdlci5zZXNzaW9uLnByZXZlbnRlZCA9IHRydWU7XHJcbiAgICAgICAgc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiB3aGVuIHRoZSB0b3VjaEFjdGlvbnMgYXJlIGNvbGxlY3RlZCB0aGV5IGFyZSBub3QgYSB2YWxpZCB2YWx1ZSwgc28gd2UgbmVlZCB0byBjbGVhbiB0aGluZ3MgdXAuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGFjdGlvbnNcclxuICogQHJldHVybnMgeyp9XHJcbiAqL1xyXG5mdW5jdGlvbiBjbGVhblRvdWNoQWN0aW9ucyhhY3Rpb25zKSB7XHJcbiAgICAvLyBub25lXHJcbiAgICBpZiAoaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX05PTkUpKSB7XHJcbiAgICAgICAgcmV0dXJuIFRPVUNIX0FDVElPTl9OT05FO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBoYXNQYW5YID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9YKTtcclxuICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKTtcclxuXHJcbiAgICAvLyBwYW4teCBhbmQgcGFuLXkgY2FuIGJlIGNvbWJpbmVkXHJcbiAgICBpZiAoaGFzUGFuWCAmJiBoYXNQYW5ZKSB7XHJcbiAgICAgICAgcmV0dXJuIFRPVUNIX0FDVElPTl9QQU5fWCArICcgJyArIFRPVUNIX0FDVElPTl9QQU5fWTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwYW4teCBPUiBwYW4teVxyXG4gICAgaWYgKGhhc1BhblggfHwgaGFzUGFuWSkge1xyXG4gICAgICAgIHJldHVybiBoYXNQYW5YID8gVE9VQ0hfQUNUSU9OX1BBTl9YIDogVE9VQ0hfQUNUSU9OX1BBTl9ZO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1hbmlwdWxhdGlvblxyXG4gICAgaWYgKGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT04pKSB7XHJcbiAgICAgICAgcmV0dXJuIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT047XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFRPVUNIX0FDVElPTl9BVVRPO1xyXG59XHJcblxyXG4vKipcclxuICogUmVjb2duaXplciBmbG93IGV4cGxhaW5lZDsgKlxyXG4gKiBBbGwgcmVjb2duaXplcnMgaGF2ZSB0aGUgaW5pdGlhbCBzdGF0ZSBvZiBQT1NTSUJMRSB3aGVuIGEgaW5wdXQgc2Vzc2lvbiBzdGFydHMuXHJcbiAqIFRoZSBkZWZpbml0aW9uIG9mIGEgaW5wdXQgc2Vzc2lvbiBpcyBmcm9tIHRoZSBmaXJzdCBpbnB1dCB1bnRpbCB0aGUgbGFzdCBpbnB1dCwgd2l0aCBhbGwgaXQncyBtb3ZlbWVudCBpbiBpdC4gKlxyXG4gKiBFeGFtcGxlIHNlc3Npb24gZm9yIG1vdXNlLWlucHV0OiBtb3VzZWRvd24gLT4gbW91c2Vtb3ZlIC0+IG1vdXNldXBcclxuICpcclxuICogT24gZWFjaCByZWNvZ25pemluZyBjeWNsZSAoc2VlIE1hbmFnZXIucmVjb2duaXplKSB0aGUgLnJlY29nbml6ZSgpIG1ldGhvZCBpcyBleGVjdXRlZFxyXG4gKiB3aGljaCBkZXRlcm1pbmVzIHdpdGggc3RhdGUgaXQgc2hvdWxkIGJlLlxyXG4gKlxyXG4gKiBJZiB0aGUgcmVjb2duaXplciBoYXMgdGhlIHN0YXRlIEZBSUxFRCwgQ0FOQ0VMTEVEIG9yIFJFQ09HTklaRUQgKGVxdWFscyBFTkRFRCksIGl0IGlzIHJlc2V0IHRvXHJcbiAqIFBPU1NJQkxFIHRvIGdpdmUgaXQgYW5vdGhlciBjaGFuZ2Ugb24gdGhlIG5leHQgY3ljbGUuXHJcbiAqXHJcbiAqICAgICAgICAgICAgICAgUG9zc2libGVcclxuICogICAgICAgICAgICAgICAgICB8XHJcbiAqICAgICAgICAgICAgKy0tLS0tKy0tLS0tLS0tLS0tLS0tLStcclxuICogICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgICstLS0tLSstLS0tLSsgICAgICAgICAgICAgICB8XHJcbiAqICAgICAgfCAgICAgICAgICAgfCAgICAgICAgICAgICAgIHxcclxuICogICBGYWlsZWQgICAgICBDYW5jZWxsZWQgICAgICAgICAgfFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgKy0tLS0tLS0rLS0tLS0tK1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgfFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICBSZWNvZ25pemVkICAgICAgIEJlZ2FuXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDaGFuZ2VkXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuZGVkL1JlY29nbml6ZWRcclxuICovXHJcbnZhciBTVEFURV9QT1NTSUJMRSA9IDE7XHJcbnZhciBTVEFURV9CRUdBTiA9IDI7XHJcbnZhciBTVEFURV9DSEFOR0VEID0gNDtcclxudmFyIFNUQVRFX0VOREVEID0gODtcclxudmFyIFNUQVRFX1JFQ09HTklaRUQgPSBTVEFURV9FTkRFRDtcclxudmFyIFNUQVRFX0NBTkNFTExFRCA9IDE2O1xyXG52YXIgU1RBVEVfRkFJTEVEID0gMzI7XHJcblxyXG4vKipcclxuICogUmVjb2duaXplclxyXG4gKiBFdmVyeSByZWNvZ25pemVyIG5lZWRzIHRvIGV4dGVuZCBmcm9tIHRoaXMgY2xhc3MuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gKi9cclxuZnVuY3Rpb24gUmVjb2duaXplcihvcHRpb25zKSB7XHJcbiAgICB0aGlzLmlkID0gdW5pcXVlSWQoKTtcclxuXHJcbiAgICB0aGlzLm1hbmFnZXIgPSBudWxsO1xyXG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2Uob3B0aW9ucyB8fCB7fSwgdGhpcy5kZWZhdWx0cyk7XHJcblxyXG4gICAgLy8gZGVmYXVsdCBpcyBlbmFibGUgdHJ1ZVxyXG4gICAgdGhpcy5vcHRpb25zLmVuYWJsZSA9IGlmVW5kZWZpbmVkKHRoaXMub3B0aW9ucy5lbmFibGUsIHRydWUpO1xyXG5cclxuICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcclxuXHJcbiAgICB0aGlzLnNpbXVsdGFuZW91cyA9IHt9O1xyXG4gICAgdGhpcy5yZXF1aXJlRmFpbCA9IFtdO1xyXG59XHJcblxyXG5SZWNvZ25pemVyLnByb3RvdHlwZSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogQHZpcnR1YWxcclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIGRlZmF1bHRzOiB7fSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHJldHVybiB7UmVjb2duaXplcn1cclxuICAgICAqL1xyXG4gICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgICAgICAgZXh0ZW5kKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIGFsc28gdXBkYXRlIHRoZSB0b3VjaEFjdGlvbiwgaW4gY2FzZSBzb21ldGhpbmcgY2hhbmdlZCBhYm91dCB0aGUgZGlyZWN0aW9ucy9lbmFibGVkIHN0YXRlXHJcbiAgICAgICAgdGhpcy5tYW5hZ2VyICYmIHRoaXMubWFuYWdlci50b3VjaEFjdGlvbi51cGRhdGUoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWNvZ25pemUgc2ltdWx0YW5lb3VzIHdpdGggYW4gb3RoZXIgcmVjb2duaXplci5cclxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXHJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcn0gdGhpc1xyXG4gICAgICovXHJcbiAgICByZWNvZ25pemVXaXRoOiBmdW5jdGlvbihvdGhlclJlY29nbml6ZXIpIHtcclxuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcob3RoZXJSZWNvZ25pemVyLCAncmVjb2duaXplV2l0aCcsIHRoaXMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHNpbXVsdGFuZW91cyA9IHRoaXMuc2ltdWx0YW5lb3VzO1xyXG4gICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcclxuICAgICAgICBpZiAoIXNpbXVsdGFuZW91c1tvdGhlclJlY29nbml6ZXIuaWRdKSB7XHJcbiAgICAgICAgICAgIHNpbXVsdGFuZW91c1tvdGhlclJlY29nbml6ZXIuaWRdID0gb3RoZXJSZWNvZ25pemVyO1xyXG4gICAgICAgICAgICBvdGhlclJlY29nbml6ZXIucmVjb2duaXplV2l0aCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZHJvcCB0aGUgc2ltdWx0YW5lb3VzIGxpbmsuIGl0IGRvZXNudCByZW1vdmUgdGhlIGxpbmsgb24gdGhlIG90aGVyIHJlY29nbml6ZXIuXHJcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxyXG4gICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcclxuICAgICAqL1xyXG4gICAgZHJvcFJlY29nbml6ZVdpdGg6IGZ1bmN0aW9uKG90aGVyUmVjb2duaXplcikge1xyXG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdkcm9wUmVjb2duaXplV2l0aCcsIHRoaXMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3RoZXJSZWNvZ25pemVyID0gZ2V0UmVjb2duaXplckJ5TmFtZUlmTWFuYWdlcihvdGhlclJlY29nbml6ZXIsIHRoaXMpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNpbXVsdGFuZW91c1tvdGhlclJlY29nbml6ZXIuaWRdO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlY29nbml6ZXIgY2FuIG9ubHkgcnVuIHdoZW4gYW4gb3RoZXIgaXMgZmFpbGluZ1xyXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXHJcbiAgICAgKi9cclxuICAgIHJlcXVpcmVGYWlsdXJlOiBmdW5jdGlvbihvdGhlclJlY29nbml6ZXIpIHtcclxuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcob3RoZXJSZWNvZ25pemVyLCAncmVxdWlyZUZhaWx1cmUnLCB0aGlzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciByZXF1aXJlRmFpbCA9IHRoaXMucmVxdWlyZUZhaWw7XHJcbiAgICAgICAgb3RoZXJSZWNvZ25pemVyID0gZ2V0UmVjb2duaXplckJ5TmFtZUlmTWFuYWdlcihvdGhlclJlY29nbml6ZXIsIHRoaXMpO1xyXG4gICAgICAgIGlmIChpbkFycmF5KHJlcXVpcmVGYWlsLCBvdGhlclJlY29nbml6ZXIpID09PSAtMSkge1xyXG4gICAgICAgICAgICByZXF1aXJlRmFpbC5wdXNoKG90aGVyUmVjb2duaXplcik7XHJcbiAgICAgICAgICAgIG90aGVyUmVjb2duaXplci5yZXF1aXJlRmFpbHVyZSh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZHJvcCB0aGUgcmVxdWlyZUZhaWx1cmUgbGluay4gaXQgZG9lcyBub3QgcmVtb3ZlIHRoZSBsaW5rIG9uIHRoZSBvdGhlciByZWNvZ25pemVyLlxyXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXHJcbiAgICAgKi9cclxuICAgIGRyb3BSZXF1aXJlRmFpbHVyZTogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XHJcbiAgICAgICAgaWYgKGludm9rZUFycmF5QXJnKG90aGVyUmVjb2duaXplciwgJ2Ryb3BSZXF1aXJlRmFpbHVyZScsIHRoaXMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3RoZXJSZWNvZ25pemVyID0gZ2V0UmVjb2duaXplckJ5TmFtZUlmTWFuYWdlcihvdGhlclJlY29nbml6ZXIsIHRoaXMpO1xyXG4gICAgICAgIHZhciBpbmRleCA9IGluQXJyYXkodGhpcy5yZXF1aXJlRmFpbCwgb3RoZXJSZWNvZ25pemVyKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcXVpcmVGYWlsLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhcyByZXF1aXJlIGZhaWx1cmVzIGJvb2xlYW5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBoYXNSZXF1aXJlRmFpbHVyZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCA+IDA7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaWYgdGhlIHJlY29nbml6ZXIgY2FuIHJlY29nbml6ZSBzaW11bHRhbmVvdXMgd2l0aCBhbiBvdGhlciByZWNvZ25pemVyXHJcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGNhblJlY29nbml6ZVdpdGg6IGZ1bmN0aW9uKG90aGVyUmVjb2duaXplcikge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF07XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogWW91IHNob3VsZCB1c2UgYHRyeUVtaXRgIGluc3RlYWQgb2YgYGVtaXRgIGRpcmVjdGx5IHRvIGNoZWNrXHJcbiAgICAgKiB0aGF0IGFsbCB0aGUgbmVlZGVkIHJlY29nbml6ZXJzIGhhcyBmYWlsZWQgYmVmb3JlIGVtaXR0aW5nLlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XHJcbiAgICAgKi9cclxuICAgIGVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVtaXQod2l0aFN0YXRlKSB7XHJcbiAgICAgICAgICAgIHNlbGYubWFuYWdlci5lbWl0KHNlbGYub3B0aW9ucy5ldmVudCArICh3aXRoU3RhdGUgPyBzdGF0ZVN0cihzdGF0ZSkgOiAnJyksIGlucHV0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICdwYW5zdGFydCcgYW5kICdwYW5tb3ZlJ1xyXG4gICAgICAgIGlmIChzdGF0ZSA8IFNUQVRFX0VOREVEKSB7XHJcbiAgICAgICAgICAgIGVtaXQodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbWl0KCk7IC8vIHNpbXBsZSAnZXZlbnROYW1lJyBldmVudHNcclxuXHJcbiAgICAgICAgLy8gcGFuZW5kIGFuZCBwYW5jYW5jZWxcclxuICAgICAgICBpZiAoc3RhdGUgPj0gU1RBVEVfRU5ERUQpIHtcclxuICAgICAgICAgICAgZW1pdCh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgdGhhdCBhbGwgdGhlIHJlcXVpcmUgZmFpbHVyZSByZWNvZ25pemVycyBoYXMgZmFpbGVkLFxyXG4gICAgICogaWYgdHJ1ZSwgaXQgZW1pdHMgYSBnZXN0dXJlIGV2ZW50LFxyXG4gICAgICogb3RoZXJ3aXNlLCBzZXR1cCB0aGUgc3RhdGUgdG8gRkFJTEVELlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XHJcbiAgICAgKi9cclxuICAgIHRyeUVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FuRW1pdCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoaW5wdXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpdCdzIGZhaWxpbmcgYW55d2F5XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZBSUxFRDtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYW4gd2UgZW1pdD9cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBjYW5FbWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAoISh0aGlzLnJlcXVpcmVGYWlsW2ldLnN0YXRlICYgKFNUQVRFX0ZBSUxFRCB8IFNUQVRFX1BPU1NJQkxFKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZSB0aGUgcmVjb2duaXplclxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0RGF0YVxyXG4gICAgICovXHJcbiAgICByZWNvZ25pemU6IGZ1bmN0aW9uKGlucHV0RGF0YSkge1xyXG4gICAgICAgIC8vIG1ha2UgYSBuZXcgY29weSBvZiB0aGUgaW5wdXREYXRhXHJcbiAgICAgICAgLy8gc28gd2UgY2FuIGNoYW5nZSB0aGUgaW5wdXREYXRhIHdpdGhvdXQgbWVzc2luZyB1cCB0aGUgb3RoZXIgcmVjb2duaXplcnNcclxuICAgICAgICB2YXIgaW5wdXREYXRhQ2xvbmUgPSBleHRlbmQoe30sIGlucHV0RGF0YSk7XHJcblxyXG4gICAgICAgIC8vIGlzIGlzIGVuYWJsZWQgYW5kIGFsbG93IHJlY29nbml6aW5nP1xyXG4gICAgICAgIGlmICghYm9vbE9yRm4odGhpcy5vcHRpb25zLmVuYWJsZSwgW3RoaXMsIGlucHV0RGF0YUNsb25lXSkpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfRkFJTEVEO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZXNldCB3aGVuIHdlJ3ZlIHJlYWNoZWQgdGhlIGVuZFxyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYgKFNUQVRFX1JFQ09HTklaRUQgfCBTVEFURV9DQU5DRUxMRUQgfCBTVEFURV9GQUlMRUQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnByb2Nlc3MoaW5wdXREYXRhQ2xvbmUpO1xyXG5cclxuICAgICAgICAvLyB0aGUgcmVjb2duaXplciBoYXMgcmVjb2duaXplZCBhIGdlc3R1cmVcclxuICAgICAgICAvLyBzbyB0cmlnZ2VyIGFuIGV2ZW50XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiAoU1RBVEVfQkVHQU4gfCBTVEFURV9DSEFOR0VEIHwgU1RBVEVfRU5ERUQgfCBTVEFURV9DQU5DRUxMRUQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJ5RW1pdChpbnB1dERhdGFDbG9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJldHVybiB0aGUgc3RhdGUgb2YgdGhlIHJlY29nbml6ZXJcclxuICAgICAqIHRoZSBhY3R1YWwgcmVjb2duaXppbmcgaGFwcGVucyBpbiB0aGlzIG1ldGhvZFxyXG4gICAgICogQHZpcnR1YWxcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dERhdGFcclxuICAgICAqIEByZXR1cm5zIHtDb25zdH0gU1RBVEVcclxuICAgICAqL1xyXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXREYXRhKSB7IH0sIC8vIGpzaGludCBpZ25vcmU6bGluZVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJuIHRoZSBwcmVmZXJyZWQgdG91Y2gtYWN0aW9uXHJcbiAgICAgKiBAdmlydHVhbFxyXG4gICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7IH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjYWxsZWQgd2hlbiB0aGUgZ2VzdHVyZSBpc24ndCBhbGxvd2VkIHRvIHJlY29nbml6ZVxyXG4gICAgICogbGlrZSB3aGVuIGFub3RoZXIgaXMgYmVpbmcgcmVjb2duaXplZCBvciBpdCBpcyBkaXNhYmxlZFxyXG4gICAgICogQHZpcnR1YWxcclxuICAgICAqL1xyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkgeyB9XHJcbn07XHJcblxyXG4vKipcclxuICogZ2V0IGEgdXNhYmxlIHN0cmluZywgdXNlZCBhcyBldmVudCBwb3N0Zml4XHJcbiAqIEBwYXJhbSB7Q29uc3R9IHN0YXRlXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBzdGF0ZVN0cihzdGF0ZSkge1xyXG4gICAgaWYgKHN0YXRlICYgU1RBVEVfQ0FOQ0VMTEVEKSB7XHJcbiAgICAgICAgcmV0dXJuICdjYW5jZWwnO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0ZSAmIFNUQVRFX0VOREVEKSB7XHJcbiAgICAgICAgcmV0dXJuICdlbmQnO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0ZSAmIFNUQVRFX0NIQU5HRUQpIHtcclxuICAgICAgICByZXR1cm4gJ21vdmUnO1xyXG4gICAgfSBlbHNlIGlmIChzdGF0ZSAmIFNUQVRFX0JFR0FOKSB7XHJcbiAgICAgICAgcmV0dXJuICdzdGFydCc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJyc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBkaXJlY3Rpb24gY29ucyB0byBzdHJpbmdcclxuICogQHBhcmFtIHtDb25zdH0gZGlyZWN0aW9uXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9XHJcbiAqL1xyXG5mdW5jdGlvbiBkaXJlY3Rpb25TdHIoZGlyZWN0aW9uKSB7XHJcbiAgICBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9ET1dOKSB7XHJcbiAgICAgICAgcmV0dXJuICdkb3duJztcclxuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9VUCkge1xyXG4gICAgICAgIHJldHVybiAndXAnO1xyXG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX0xFRlQpIHtcclxuICAgICAgICByZXR1cm4gJ2xlZnQnO1xyXG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX1JJR0hUKSB7XHJcbiAgICAgICAgcmV0dXJuICdyaWdodCc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJyc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBnZXQgYSByZWNvZ25pemVyIGJ5IG5hbWUgaWYgaXQgaXMgYm91bmQgdG8gYSBtYW5hZ2VyXHJcbiAqIEBwYXJhbSB7UmVjb2duaXplcnxTdHJpbmd9IG90aGVyUmVjb2duaXplclxyXG4gKiBAcGFyYW0ge1JlY29nbml6ZXJ9IHJlY29nbml6ZXJcclxuICogQHJldHVybnMge1JlY29nbml6ZXJ9XHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgcmVjb2duaXplcikge1xyXG4gICAgdmFyIG1hbmFnZXIgPSByZWNvZ25pemVyLm1hbmFnZXI7XHJcbiAgICBpZiAobWFuYWdlcikge1xyXG4gICAgICAgIHJldHVybiBtYW5hZ2VyLmdldChvdGhlclJlY29nbml6ZXIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG90aGVyUmVjb2duaXplcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoaXMgcmVjb2duaXplciBpcyBqdXN0IHVzZWQgYXMgYSBiYXNlIGZvciB0aGUgc2ltcGxlIGF0dHJpYnV0ZSByZWNvZ25pemVycy5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBleHRlbmRzIFJlY29nbml6ZXJcclxuICovXHJcbmZ1bmN0aW9uIEF0dHJSZWNvZ25pemVyKCkge1xyXG4gICAgUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5pbmhlcml0KEF0dHJSZWNvZ25pemVyLCBSZWNvZ25pemVyLCB7XHJcbiAgICAvKipcclxuICAgICAqIEBuYW1lc3BhY2VcclxuICAgICAqIEBtZW1iZXJvZiBBdHRyUmVjb2duaXplclxyXG4gICAgICovXHJcbiAgICBkZWZhdWx0czoge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICogQGRlZmF1bHQgMVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHBvaW50ZXJzOiAxXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXNlZCB0byBjaGVjayBpZiBpdCB0aGUgcmVjb2duaXplciByZWNlaXZlcyB2YWxpZCBpbnB1dCwgbGlrZSBpbnB1dC5kaXN0YW5jZSA+IDEwLlxyXG4gICAgICogQG1lbWJlcm9mIEF0dHJSZWNvZ25pemVyXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSByZWNvZ25pemVkXHJcbiAgICAgKi9cclxuICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHZhciBvcHRpb25Qb2ludGVycyA9IHRoaXMub3B0aW9ucy5wb2ludGVycztcclxuICAgICAgICByZXR1cm4gb3B0aW9uUG9pbnRlcnMgPT09IDAgfHwgaW5wdXQucG9pbnRlcnMubGVuZ3RoID09PSBvcHRpb25Qb2ludGVycztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm9jZXNzIHRoZSBpbnB1dCBhbmQgcmV0dXJuIHRoZSBzdGF0ZSBmb3IgdGhlIHJlY29nbml6ZXJcclxuICAgICAqIEBtZW1iZXJvZiBBdHRyUmVjb2duaXplclxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XHJcbiAgICAgKiBAcmV0dXJucyB7Kn0gU3RhdGVcclxuICAgICAqL1xyXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xyXG4gICAgICAgIHZhciBldmVudFR5cGUgPSBpbnB1dC5ldmVudFR5cGU7XHJcblxyXG4gICAgICAgIHZhciBpc1JlY29nbml6ZWQgPSBzdGF0ZSAmIChTVEFURV9CRUdBTiB8IFNUQVRFX0NIQU5HRUQpO1xyXG4gICAgICAgIHZhciBpc1ZhbGlkID0gdGhpcy5hdHRyVGVzdChpbnB1dCk7XHJcblxyXG4gICAgICAgIC8vIG9uIGNhbmNlbCBpbnB1dCBhbmQgd2UndmUgcmVjb2duaXplZCBiZWZvcmUsIHJldHVybiBTVEFURV9DQU5DRUxMRURcclxuICAgICAgICBpZiAoaXNSZWNvZ25pemVkICYmIChldmVudFR5cGUgJiBJTlBVVF9DQU5DRUwgfHwgIWlzVmFsaWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZSB8IFNUQVRFX0NBTkNFTExFRDtcclxuICAgICAgICB9IGVsc2UgaWYgKGlzUmVjb2duaXplZCB8fCBpc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9FTkQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZSB8IFNUQVRFX0VOREVEO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCEoc3RhdGUgJiBTVEFURV9CRUdBTikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9CRUdBTjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGUgfCBTVEFURV9DSEFOR0VEO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBQYW5cclxuICogUmVjb2duaXplZCB3aGVuIHRoZSBwb2ludGVyIGlzIGRvd24gYW5kIG1vdmVkIGluIHRoZSBhbGxvd2VkIGRpcmVjdGlvbi5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXHJcbiAqL1xyXG5mdW5jdGlvbiBQYW5SZWNvZ25pemVyKCkge1xyXG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHJcbiAgICB0aGlzLnBYID0gbnVsbDtcclxuICAgIHRoaXMucFkgPSBudWxsO1xyXG59XHJcblxyXG5pbmhlcml0KFBhblJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XHJcbiAgICAvKipcclxuICAgICAqIEBuYW1lc3BhY2VcclxuICAgICAqIEBtZW1iZXJvZiBQYW5SZWNvZ25pemVyXHJcbiAgICAgKi9cclxuICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgZXZlbnQ6ICdwYW4nLFxyXG4gICAgICAgIHRocmVzaG9sZDogMTAsXHJcbiAgICAgICAgcG9pbnRlcnM6IDEsXHJcbiAgICAgICAgZGlyZWN0aW9uOiBESVJFQ1RJT05fQUxMXHJcbiAgICB9LFxyXG5cclxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbjtcclxuICAgICAgICB2YXIgYWN0aW9ucyA9IFtdO1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fSE9SSVpPTlRBTCkge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goVE9VQ0hfQUNUSU9OX1BBTl9ZKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiAmIERJUkVDVElPTl9WRVJUSUNBTCkge1xyXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goVE9VQ0hfQUNUSU9OX1BBTl9YKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFjdGlvbnM7XHJcbiAgICB9LFxyXG5cclxuICAgIGRpcmVjdGlvblRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcbiAgICAgICAgdmFyIGhhc01vdmVkID0gdHJ1ZTtcclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSBpbnB1dC5kaXN0YW5jZTtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gaW5wdXQuZGlyZWN0aW9uO1xyXG4gICAgICAgIHZhciB4ID0gaW5wdXQuZGVsdGFYO1xyXG4gICAgICAgIHZhciB5ID0gaW5wdXQuZGVsdGFZO1xyXG5cclxuICAgICAgICAvLyBsb2NrIHRvIGF4aXM/XHJcbiAgICAgICAgaWYgKCEoZGlyZWN0aW9uICYgb3B0aW9ucy5kaXJlY3Rpb24pKSB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRpcmVjdGlvbiAmIERJUkVDVElPTl9IT1JJWk9OVEFMKSB7XHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAoeCA9PT0gMCkgPyBESVJFQ1RJT05fTk9ORSA6ICh4IDwgMCkgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVDtcclxuICAgICAgICAgICAgICAgIGhhc01vdmVkID0geCAhPSB0aGlzLnBYO1xyXG4gICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLmFicyhpbnB1dC5kZWx0YVgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gKHkgPT09IDApID8gRElSRUNUSU9OX05PTkUgOiAoeSA8IDApID8gRElSRUNUSU9OX1VQIDogRElSRUNUSU9OX0RPV047XHJcbiAgICAgICAgICAgICAgICBoYXNNb3ZlZCA9IHkgIT0gdGhpcy5wWTtcclxuICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoaW5wdXQuZGVsdGFZKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpbnB1dC5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICAgICAgcmV0dXJuIGhhc01vdmVkICYmIGRpc3RhbmNlID4gb3B0aW9ucy50aHJlc2hvbGQgJiYgZGlyZWN0aW9uICYgb3B0aW9ucy5kaXJlY3Rpb247XHJcbiAgICB9LFxyXG5cclxuICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHJldHVybiBBdHRyUmVjb2duaXplci5wcm90b3R5cGUuYXR0clRlc3QuY2FsbCh0aGlzLCBpbnB1dCkgJiZcclxuICAgICAgICAgICAgKHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTiB8fCAoISh0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pICYmIHRoaXMuZGlyZWN0aW9uVGVzdChpbnB1dCkpKTtcclxuICAgIH0sXHJcblxyXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICB0aGlzLnBYID0gaW5wdXQuZGVsdGFYO1xyXG4gICAgICAgIHRoaXMucFkgPSBpbnB1dC5kZWx0YVk7XHJcblxyXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBkaXJlY3Rpb25TdHIoaW5wdXQuZGlyZWN0aW9uKTtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCArIGRpcmVjdGlvbiwgaW5wdXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fc3VwZXIuZW1pdC5jYWxsKHRoaXMsIGlucHV0KTtcclxuICAgIH1cclxufSk7XHJcblxyXG4vKipcclxuICogUGluY2hcclxuICogUmVjb2duaXplZCB3aGVuIHR3byBvciBtb3JlIHBvaW50ZXJzIGFyZSBtb3ZpbmcgdG93YXJkICh6b29tLWluKSBvciBhd2F5IGZyb20gZWFjaCBvdGhlciAoem9vbS1vdXQpLlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGV4dGVuZHMgQXR0clJlY29nbml6ZXJcclxuICovXHJcbmZ1bmN0aW9uIFBpbmNoUmVjb2duaXplcigpIHtcclxuICAgIEF0dHJSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmluaGVyaXQoUGluY2hSZWNvZ25pemVyLCBBdHRyUmVjb2duaXplciwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAbmFtZXNwYWNlXHJcbiAgICAgKiBAbWVtYmVyb2YgUGluY2hSZWNvZ25pemVyXHJcbiAgICAgKi9cclxuICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgZXZlbnQ6ICdwaW5jaCcsXHJcbiAgICAgICAgdGhyZXNob2xkOiAwLFxyXG4gICAgICAgIHBvaW50ZXJzOiAyXHJcbiAgICB9LFxyXG5cclxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9OT05FXTtcclxuICAgIH0sXHJcblxyXG4gICAgYXR0clRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXHJcbiAgICAgICAgICAgIChNYXRoLmFicyhpbnB1dC5zY2FsZSAtIDEpID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZCB8fCB0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHRoaXMuX3N1cGVyLmVtaXQuY2FsbCh0aGlzLCBpbnB1dCk7XHJcbiAgICAgICAgaWYgKGlucHV0LnNjYWxlICE9PSAxKSB7XHJcbiAgICAgICAgICAgIHZhciBpbk91dCA9IGlucHV0LnNjYWxlIDwgMSA/ICdpbicgOiAnb3V0JztcclxuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50ICsgaW5PdXQsIGlucHV0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFByZXNzXHJcbiAqIFJlY29nbml6ZWQgd2hlbiB0aGUgcG9pbnRlciBpcyBkb3duIGZvciB4IG1zIHdpdGhvdXQgYW55IG1vdmVtZW50LlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQGV4dGVuZHMgUmVjb2duaXplclxyXG4gKi9cclxuZnVuY3Rpb24gUHJlc3NSZWNvZ25pemVyKCkge1xyXG4gICAgUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cclxuICAgIHRoaXMuX3RpbWVyID0gbnVsbDtcclxuICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcclxufVxyXG5cclxuaW5oZXJpdChQcmVzc1JlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcclxuICAgIC8qKlxyXG4gICAgICogQG5hbWVzcGFjZVxyXG4gICAgICogQG1lbWJlcm9mIFByZXNzUmVjb2duaXplclxyXG4gICAgICovXHJcbiAgICBkZWZhdWx0czoge1xyXG4gICAgICAgIGV2ZW50OiAncHJlc3MnLFxyXG4gICAgICAgIHBvaW50ZXJzOiAxLFxyXG4gICAgICAgIHRpbWU6IDUwMCwgLy8gbWluaW1hbCB0aW1lIG9mIHRoZSBwb2ludGVyIHRvIGJlIHByZXNzZWRcclxuICAgICAgICB0aHJlc2hvbGQ6IDUgLy8gYSBtaW5pbWFsIG1vdmVtZW50IGlzIG9rLCBidXQga2VlcCBpdCBsb3dcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBbVE9VQ0hfQUNUSU9OX0FVVE9dO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcm9jZXNzOiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG4gICAgICAgIHZhciB2YWxpZFBvaW50ZXJzID0gaW5wdXQucG9pbnRlcnMubGVuZ3RoID09PSBvcHRpb25zLnBvaW50ZXJzO1xyXG4gICAgICAgIHZhciB2YWxpZE1vdmVtZW50ID0gaW5wdXQuZGlzdGFuY2UgPCBvcHRpb25zLnRocmVzaG9sZDtcclxuICAgICAgICB2YXIgdmFsaWRUaW1lID0gaW5wdXQuZGVsdGFUaW1lID4gb3B0aW9ucy50aW1lO1xyXG5cclxuICAgICAgICB0aGlzLl9pbnB1dCA9IGlucHV0O1xyXG5cclxuICAgICAgICAvLyB3ZSBvbmx5IGFsbG93IGxpdHRsZSBtb3ZlbWVudFxyXG4gICAgICAgIC8vIGFuZCB3ZSd2ZSByZWFjaGVkIGFuIGVuZCBldmVudCwgc28gYSB0YXAgaXMgcG9zc2libGVcclxuICAgICAgICBpZiAoIXZhbGlkTW92ZW1lbnQgfHwgIXZhbGlkUG9pbnRlcnMgfHwgKGlucHV0LmV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpICYmICF2YWxpZFRpbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX1NUQVJUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0Q29udGV4dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9SRUNPR05JWkVEO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cnlFbWl0KCk7XHJcbiAgICAgICAgICAgIH0sIG9wdGlvbnMudGltZSwgdGhpcyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5ldmVudFR5cGUgJiBJTlBVVF9FTkQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFNUQVRFX1JFQ09HTklaRUQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBTVEFURV9GQUlMRUQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSBTVEFURV9SRUNPR05JWkVEKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnB1dCAmJiAoaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EKSkge1xyXG4gICAgICAgICAgICB0aGlzLm1hbmFnZXIuZW1pdCh0aGlzLm9wdGlvbnMuZXZlbnQgKyAndXAnLCBpbnB1dCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5faW5wdXQudGltZVN0YW1wID0gbm93KCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCwgdGhpcy5faW5wdXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG4vKipcclxuICogUm90YXRlXHJcbiAqIFJlY29nbml6ZWQgd2hlbiB0d28gb3IgbW9yZSBwb2ludGVyIGFyZSBtb3ZpbmcgaW4gYSBjaXJjdWxhciBtb3Rpb24uXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxyXG4gKi9cclxuZnVuY3Rpb24gUm90YXRlUmVjb2duaXplcigpIHtcclxuICAgIEF0dHJSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmluaGVyaXQoUm90YXRlUmVjb2duaXplciwgQXR0clJlY29nbml6ZXIsIHtcclxuICAgIC8qKlxyXG4gICAgICogQG5hbWVzcGFjZVxyXG4gICAgICogQG1lbWJlcm9mIFJvdGF0ZVJlY29nbml6ZXJcclxuICAgICAqL1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICBldmVudDogJ3JvdGF0ZScsXHJcbiAgICAgICAgdGhyZXNob2xkOiAwLFxyXG4gICAgICAgIHBvaW50ZXJzOiAyXHJcbiAgICB9LFxyXG5cclxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9OT05FXTtcclxuICAgIH0sXHJcblxyXG4gICAgYXR0clRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXHJcbiAgICAgICAgICAgIChNYXRoLmFicyhpbnB1dC5yb3RhdGlvbikgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkIHx8IHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTik7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIFN3aXBlXHJcbiAqIFJlY29nbml6ZWQgd2hlbiB0aGUgcG9pbnRlciBpcyBtb3ZpbmcgZmFzdCAodmVsb2NpdHkpLCB3aXRoIGVub3VnaCBkaXN0YW5jZSBpbiB0aGUgYWxsb3dlZCBkaXJlY3Rpb24uXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxyXG4gKi9cclxuZnVuY3Rpb24gU3dpcGVSZWNvZ25pemVyKCkge1xyXG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuaW5oZXJpdChTd2lwZVJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XHJcbiAgICAvKipcclxuICAgICAqIEBuYW1lc3BhY2VcclxuICAgICAqIEBtZW1iZXJvZiBTd2lwZVJlY29nbml6ZXJcclxuICAgICAqL1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICBldmVudDogJ3N3aXBlJyxcclxuICAgICAgICB0aHJlc2hvbGQ6IDEwLFxyXG4gICAgICAgIHZlbG9jaXR5OiAwLjY1LFxyXG4gICAgICAgIGRpcmVjdGlvbjogRElSRUNUSU9OX0hPUklaT05UQUwgfCBESVJFQ1RJT05fVkVSVElDQUwsXHJcbiAgICAgICAgcG9pbnRlcnM6IDFcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBQYW5SZWNvZ25pemVyLnByb3RvdHlwZS5nZXRUb3VjaEFjdGlvbi5jYWxsKHRoaXMpO1xyXG4gICAgfSxcclxuXHJcbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbjtcclxuICAgICAgICB2YXIgdmVsb2NpdHk7XHJcblxyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gJiAoRElSRUNUSU9OX0hPUklaT05UQUwgfCBESVJFQ1RJT05fVkVSVElDQUwpKSB7XHJcbiAgICAgICAgICAgIHZlbG9jaXR5ID0gaW5wdXQudmVsb2NpdHk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fSE9SSVpPTlRBTCkge1xyXG4gICAgICAgICAgICB2ZWxvY2l0eSA9IGlucHV0LnZlbG9jaXR5WDtcclxuICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiAmIERJUkVDVElPTl9WRVJUSUNBTCkge1xyXG4gICAgICAgICAgICB2ZWxvY2l0eSA9IGlucHV0LnZlbG9jaXR5WTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdXBlci5hdHRyVGVzdC5jYWxsKHRoaXMsIGlucHV0KSAmJlxyXG4gICAgICAgICAgICBkaXJlY3Rpb24gJiBpbnB1dC5kaXJlY3Rpb24gJiZcclxuICAgICAgICAgICAgaW5wdXQuZGlzdGFuY2UgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmXHJcbiAgICAgICAgICAgIGFicyh2ZWxvY2l0eSkgPiB0aGlzLm9wdGlvbnMudmVsb2NpdHkgJiYgaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBkaXJlY3Rpb25TdHIoaW5wdXQuZGlyZWN0aW9uKTtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCArIGRpcmVjdGlvbiwgaW5wdXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCBpbnB1dCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIEEgdGFwIGlzIGVjb2duaXplZCB3aGVuIHRoZSBwb2ludGVyIGlzIGRvaW5nIGEgc21hbGwgdGFwL2NsaWNrLiBNdWx0aXBsZSB0YXBzIGFyZSByZWNvZ25pemVkIGlmIHRoZXkgb2NjdXJcclxuICogYmV0d2VlbiB0aGUgZ2l2ZW4gaW50ZXJ2YWwgYW5kIHBvc2l0aW9uLiBUaGUgZGVsYXkgb3B0aW9uIGNhbiBiZSB1c2VkIHRvIHJlY29nbml6ZSBtdWx0aS10YXBzIHdpdGhvdXQgZmlyaW5nXHJcbiAqIGEgc2luZ2xlIHRhcC5cclxuICpcclxuICogVGhlIGV2ZW50RGF0YSBmcm9tIHRoZSBlbWl0dGVkIGV2ZW50IGNvbnRhaW5zIHRoZSBwcm9wZXJ0eSBgdGFwQ291bnRgLCB3aGljaCBjb250YWlucyB0aGUgYW1vdW50IG9mXHJcbiAqIG11bHRpLXRhcHMgYmVpbmcgcmVjb2duaXplZC5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBleHRlbmRzIFJlY29nbml6ZXJcclxuICovXHJcbmZ1bmN0aW9uIFRhcFJlY29nbml6ZXIoKSB7XHJcbiAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblxyXG4gICAgLy8gcHJldmlvdXMgdGltZSBhbmQgY2VudGVyLFxyXG4gICAgLy8gdXNlZCBmb3IgdGFwIGNvdW50aW5nXHJcbiAgICB0aGlzLnBUaW1lID0gZmFsc2U7XHJcbiAgICB0aGlzLnBDZW50ZXIgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLl90aW1lciA9IG51bGw7XHJcbiAgICB0aGlzLl9pbnB1dCA9IG51bGw7XHJcbiAgICB0aGlzLmNvdW50ID0gMDtcclxufVxyXG5cclxuaW5oZXJpdChUYXBSZWNvZ25pemVyLCBSZWNvZ25pemVyLCB7XHJcbiAgICAvKipcclxuICAgICAqIEBuYW1lc3BhY2VcclxuICAgICAqIEBtZW1iZXJvZiBQaW5jaFJlY29nbml6ZXJcclxuICAgICAqL1xyXG4gICAgZGVmYXVsdHM6IHtcclxuICAgICAgICBldmVudDogJ3RhcCcsXHJcbiAgICAgICAgcG9pbnRlcnM6IDEsXHJcbiAgICAgICAgdGFwczogMSxcclxuICAgICAgICBpbnRlcnZhbDogMzAwLCAvLyBtYXggdGltZSBiZXR3ZWVuIHRoZSBtdWx0aS10YXAgdGFwc1xyXG4gICAgICAgIHRpbWU6IDI1MCwgLy8gbWF4IHRpbWUgb2YgdGhlIHBvaW50ZXIgdG8gYmUgZG93biAobGlrZSBmaW5nZXIgb24gdGhlIHNjcmVlbilcclxuICAgICAgICB0aHJlc2hvbGQ6IDIsIC8vIGEgbWluaW1hbCBtb3ZlbWVudCBpcyBvaywgYnV0IGtlZXAgaXQgbG93XHJcbiAgICAgICAgcG9zVGhyZXNob2xkOiAxMCAvLyBhIG11bHRpLXRhcCBjYW4gYmUgYSBiaXQgb2ZmIHRoZSBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICB9LFxyXG5cclxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9NQU5JUFVMQVRJT05dO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcm9jZXNzOiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuICAgICAgICB2YXIgdmFsaWRQb2ludGVycyA9IGlucHV0LnBvaW50ZXJzLmxlbmd0aCA9PT0gb3B0aW9ucy5wb2ludGVycztcclxuICAgICAgICB2YXIgdmFsaWRNb3ZlbWVudCA9IGlucHV0LmRpc3RhbmNlIDwgb3B0aW9ucy50aHJlc2hvbGQ7XHJcbiAgICAgICAgdmFyIHZhbGlkVG91Y2hUaW1lID0gaW5wdXQuZGVsdGFUaW1lIDwgb3B0aW9ucy50aW1lO1xyXG5cclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgIGlmICgoaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfU1RBUlQpICYmICh0aGlzLmNvdW50ID09PSAwKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsVGltZW91dCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gd2Ugb25seSBhbGxvdyBsaXR0bGUgbW92ZW1lbnRcclxuICAgICAgICAvLyBhbmQgd2UndmUgcmVhY2hlZCBhbiBlbmQgZXZlbnQsIHNvIGEgdGFwIGlzIHBvc3NpYmxlXHJcbiAgICAgICAgaWYgKHZhbGlkTW92ZW1lbnQgJiYgdmFsaWRUb3VjaFRpbWUgJiYgdmFsaWRQb2ludGVycykge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQuZXZlbnRUeXBlICE9IElOUFVUX0VORCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbFRpbWVvdXQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHZhbGlkSW50ZXJ2YWwgPSB0aGlzLnBUaW1lID8gKGlucHV0LnRpbWVTdGFtcCAtIHRoaXMucFRpbWUgPCBvcHRpb25zLmludGVydmFsKSA6IHRydWU7XHJcbiAgICAgICAgICAgIHZhciB2YWxpZE11bHRpVGFwID0gIXRoaXMucENlbnRlciB8fCBnZXREaXN0YW5jZSh0aGlzLnBDZW50ZXIsIGlucHV0LmNlbnRlcikgPCBvcHRpb25zLnBvc1RocmVzaG9sZDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucFRpbWUgPSBpbnB1dC50aW1lU3RhbXA7XHJcbiAgICAgICAgICAgIHRoaXMucENlbnRlciA9IGlucHV0LmNlbnRlcjtcclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsaWRNdWx0aVRhcCB8fCAhdmFsaWRJbnRlcnZhbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb3VudCA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiB0YXAgY291bnQgbWF0Y2hlcyB3ZSBoYXZlIHJlY29nbml6ZWQgaXQsXHJcbiAgICAgICAgICAgIC8vIGVsc2UgaXQgaGFzIGJlZ2FuIHJlY29nbml6aW5nLi4uXHJcbiAgICAgICAgICAgIHZhciB0YXBDb3VudCA9IHRoaXMuY291bnQgJSBvcHRpb25zLnRhcHM7XHJcbiAgICAgICAgICAgIGlmICh0YXBDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gbm8gZmFpbGluZyByZXF1aXJlbWVudHMsIGltbWVkaWF0ZWx5IHRyaWdnZXIgdGhlIHRhcCBldmVudFxyXG4gICAgICAgICAgICAgICAgLy8gb3Igd2FpdCBhcyBsb25nIGFzIHRoZSBtdWx0aXRhcCBpbnRlcnZhbCB0byB0cmlnZ2VyXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGFzUmVxdWlyZUZhaWx1cmVzKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfUkVDT0dOSVpFRDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0Q29udGV4dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1JFQ09HTklaRUQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJ5RW1pdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIG9wdGlvbnMuaW50ZXJ2YWwsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9CRUdBTjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xyXG4gICAgfSxcclxuXHJcbiAgICBmYWlsVGltZW91dDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0Q29udGV4dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZBSUxFRDtcclxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMuaW50ZXJ2YWwsIHRoaXMpO1xyXG4gICAgICAgIHJldHVybiBTVEFURV9GQUlMRUQ7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xyXG4gICAgfSxcclxuXHJcbiAgICBlbWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PSBTVEFURV9SRUNPR05JWkVEICkge1xyXG4gICAgICAgICAgICB0aGlzLl9pbnB1dC50YXBDb3VudCA9IHRoaXMuY291bnQ7XHJcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCwgdGhpcy5faW5wdXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG4vKipcclxuICogU2ltcGxlIHdheSB0byBjcmVhdGUgYW4gbWFuYWdlciB3aXRoIGEgZGVmYXVsdCBzZXQgb2YgcmVjb2duaXplcnMuXHJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIEhhbW1lcihlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgIG9wdGlvbnMucmVjb2duaXplcnMgPSBpZlVuZGVmaW5lZChvcHRpb25zLnJlY29nbml6ZXJzLCBIYW1tZXIuZGVmYXVsdHMucHJlc2V0KTtcclxuICAgIHJldHVybiBuZXcgTWFuYWdlcihlbGVtZW50LCBvcHRpb25zKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBjb25zdCB7c3RyaW5nfVxyXG4gKi9cclxuSGFtbWVyLlZFUlNJT04gPSAnMi4wLjQnO1xyXG5cclxuLyoqXHJcbiAqIGRlZmF1bHQgc2V0dGluZ3NcclxuICogQG5hbWVzcGFjZVxyXG4gKi9cclxuSGFtbWVyLmRlZmF1bHRzID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWYgRE9NIGV2ZW50cyBhcmUgYmVpbmcgdHJpZ2dlcmVkLlxyXG4gICAgICogQnV0IHRoaXMgaXMgc2xvd2VyIGFuZCB1bnVzZWQgYnkgc2ltcGxlIGltcGxlbWVudGF0aW9ucywgc28gZGlzYWJsZWQgYnkgZGVmYXVsdC5cclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgZmFsc2VcclxuICAgICAqL1xyXG4gICAgZG9tRXZlbnRzOiBmYWxzZSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSB2YWx1ZSBmb3IgdGhlIHRvdWNoQWN0aW9uIHByb3BlcnR5L2ZhbGxiYWNrLlxyXG4gICAgICogV2hlbiBzZXQgdG8gYGNvbXB1dGVgIGl0IHdpbGwgbWFnaWNhbGx5IHNldCB0aGUgY29ycmVjdCB2YWx1ZSBiYXNlZCBvbiB0aGUgYWRkZWQgcmVjb2duaXplcnMuXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgY29tcHV0ZVxyXG4gICAgICovXHJcbiAgICB0b3VjaEFjdGlvbjogVE9VQ0hfQUNUSU9OX0NPTVBVVEUsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHRydWVcclxuICAgICAqL1xyXG4gICAgZW5hYmxlOiB0cnVlLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRVhQRVJJTUVOVEFMIEZFQVRVUkUgLS0gY2FuIGJlIHJlbW92ZWQvY2hhbmdlZFxyXG4gICAgICogQ2hhbmdlIHRoZSBwYXJlbnQgaW5wdXQgdGFyZ2V0IGVsZW1lbnQuXHJcbiAgICAgKiBJZiBOdWxsLCB0aGVuIGl0IGlzIGJlaW5nIHNldCB0aGUgdG8gbWFpbiBlbGVtZW50LlxyXG4gICAgICogQHR5cGUge051bGx8RXZlbnRUYXJnZXR9XHJcbiAgICAgKiBAZGVmYXVsdCBudWxsXHJcbiAgICAgKi9cclxuICAgIGlucHV0VGFyZ2V0OiBudWxsLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZm9yY2UgYW4gaW5wdXQgY2xhc3NcclxuICAgICAqIEB0eXBlIHtOdWxsfEZ1bmN0aW9ufVxyXG4gICAgICogQGRlZmF1bHQgbnVsbFxyXG4gICAgICovXHJcbiAgICBpbnB1dENsYXNzOiBudWxsLFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmYXVsdCByZWNvZ25pemVyIHNldHVwIHdoZW4gY2FsbGluZyBgSGFtbWVyKClgXHJcbiAgICAgKiBXaGVuIGNyZWF0aW5nIGEgbmV3IE1hbmFnZXIgdGhlc2Ugd2lsbCBiZSBza2lwcGVkLlxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBwcmVzZXQ6IFtcclxuICAgICAgICAvLyBSZWNvZ25pemVyQ2xhc3MsIG9wdGlvbnMsIFtyZWNvZ25pemVXaXRoLCAuLi5dLCBbcmVxdWlyZUZhaWx1cmUsIC4uLl1cclxuICAgICAgICBbUm90YXRlUmVjb2duaXplciwgeyBlbmFibGU6IGZhbHNlIH1dLFxyXG4gICAgICAgIFtQaW5jaFJlY29nbml6ZXIsIHsgZW5hYmxlOiBmYWxzZSB9LCBbJ3JvdGF0ZSddXSxcclxuICAgICAgICBbU3dpcGVSZWNvZ25pemVyLHsgZGlyZWN0aW9uOiBESVJFQ1RJT05fSE9SSVpPTlRBTCB9XSxcclxuICAgICAgICBbUGFuUmVjb2duaXplciwgeyBkaXJlY3Rpb246IERJUkVDVElPTl9IT1JJWk9OVEFMIH0sIFsnc3dpcGUnXV0sXHJcbiAgICAgICAgW1RhcFJlY29nbml6ZXJdLFxyXG4gICAgICAgIFtUYXBSZWNvZ25pemVyLCB7IGV2ZW50OiAnZG91YmxldGFwJywgdGFwczogMiB9LCBbJ3RhcCddXSxcclxuICAgICAgICBbUHJlc3NSZWNvZ25pemVyXVxyXG4gICAgXSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNvbWUgQ1NTIHByb3BlcnRpZXMgY2FuIGJlIHVzZWQgdG8gaW1wcm92ZSB0aGUgd29ya2luZyBvZiBIYW1tZXIuXHJcbiAgICAgKiBBZGQgdGhlbSB0byB0aGlzIG1ldGhvZCBhbmQgdGhleSB3aWxsIGJlIHNldCB3aGVuIGNyZWF0aW5nIGEgbmV3IE1hbmFnZXIuXHJcbiAgICAgKiBAbmFtZXNwYWNlXHJcbiAgICAgKi9cclxuICAgIGNzc1Byb3BzOiB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGlzYWJsZXMgdGV4dCBzZWxlY3Rpb24gdG8gaW1wcm92ZSB0aGUgZHJhZ2dpbmcgZ2VzdHVyZS4gTWFpbmx5IGZvciBkZXNrdG9wIGJyb3dzZXJzLlxyXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEaXNhYmxlIHRoZSBXaW5kb3dzIFBob25lIGdyaXBwZXJzIHdoZW4gcHJlc3NpbmcgYW4gZWxlbWVudC5cclxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRvdWNoU2VsZWN0OiAnbm9uZScsXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERpc2FibGVzIHRoZSBkZWZhdWx0IGNhbGxvdXQgc2hvd24gd2hlbiB5b3UgdG91Y2ggYW5kIGhvbGQgYSB0b3VjaCB0YXJnZXQuXHJcbiAgICAgICAgICogT24gaU9TLCB3aGVuIHlvdSB0b3VjaCBhbmQgaG9sZCBhIHRvdWNoIHRhcmdldCBzdWNoIGFzIGEgbGluaywgU2FmYXJpIGRpc3BsYXlzXHJcbiAgICAgICAgICogYSBjYWxsb3V0IGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGxpbmsuIFRoaXMgcHJvcGVydHkgYWxsb3dzIHlvdSB0byBkaXNhYmxlIHRoYXQgY2FsbG91dC5cclxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRvdWNoQ2FsbG91dDogJ25vbmUnLFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTcGVjaWZpZXMgd2hldGhlciB6b29taW5nIGlzIGVuYWJsZWQuIFVzZWQgYnkgSUUxMD5cclxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnRlbnRab29taW5nOiAnbm9uZScsXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNwZWNpZmllcyB0aGF0IGFuIGVudGlyZSBlbGVtZW50IHNob3VsZCBiZSBkcmFnZ2FibGUgaW5zdGVhZCBvZiBpdHMgY29udGVudHMuIE1haW5seSBmb3IgZGVza3RvcCBicm93c2Vycy5cclxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHVzZXJEcmFnOiAnbm9uZScsXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE92ZXJyaWRlcyB0aGUgaGlnaGxpZ2h0IGNvbG9yIHNob3duIHdoZW4gdGhlIHVzZXIgdGFwcyBhIGxpbmsgb3IgYSBKYXZhU2NyaXB0XHJcbiAgICAgICAgICogY2xpY2thYmxlIGVsZW1lbnQgaW4gaU9TLiBUaGlzIHByb3BlcnR5IG9iZXlzIHRoZSBhbHBoYSB2YWx1ZSwgaWYgc3BlY2lmaWVkLlxyXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgICAgICogQGRlZmF1bHQgJ3JnYmEoMCwwLDAsMCknXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGFwSGlnaGxpZ2h0Q29sb3I6ICdyZ2JhKDAsMCwwLDApJ1xyXG4gICAgfVxyXG59O1xyXG5cclxudmFyIFNUT1AgPSAxO1xyXG52YXIgRk9SQ0VEX1NUT1AgPSAyO1xyXG5cclxuLyoqXHJcbiAqIE1hbmFnZXJcclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gTWFuYWdlcihlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBIYW1tZXIuZGVmYXVsdHMpO1xyXG4gICAgdGhpcy5vcHRpb25zLmlucHV0VGFyZ2V0ID0gdGhpcy5vcHRpb25zLmlucHV0VGFyZ2V0IHx8IGVsZW1lbnQ7XHJcblxyXG4gICAgdGhpcy5oYW5kbGVycyA9IHt9O1xyXG4gICAgdGhpcy5zZXNzaW9uID0ge307XHJcbiAgICB0aGlzLnJlY29nbml6ZXJzID0gW107XHJcblxyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMuaW5wdXQgPSBjcmVhdGVJbnB1dEluc3RhbmNlKHRoaXMpO1xyXG4gICAgdGhpcy50b3VjaEFjdGlvbiA9IG5ldyBUb3VjaEFjdGlvbih0aGlzLCB0aGlzLm9wdGlvbnMudG91Y2hBY3Rpb24pO1xyXG5cclxuICAgIHRvZ2dsZUNzc1Byb3BzKHRoaXMsIHRydWUpO1xyXG5cclxuICAgIGVhY2gob3B0aW9ucy5yZWNvZ25pemVycywgZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIHZhciByZWNvZ25pemVyID0gdGhpcy5hZGQobmV3IChpdGVtWzBdKShpdGVtWzFdKSk7XHJcbiAgICAgICAgaXRlbVsyXSAmJiByZWNvZ25pemVyLnJlY29nbml6ZVdpdGgoaXRlbVsyXSk7XHJcbiAgICAgICAgaXRlbVszXSAmJiByZWNvZ25pemVyLnJlcXVpcmVGYWlsdXJlKGl0ZW1bM10pO1xyXG4gICAgfSwgdGhpcyk7XHJcbn1cclxuXHJcbk1hbmFnZXIucHJvdG90eXBlID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEByZXR1cm5zIHtNYW5hZ2VyfVxyXG4gICAgICovXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuICAgICAgICBleHRlbmQodGhpcy5vcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gT3B0aW9ucyB0aGF0IG5lZWQgYSBsaXR0bGUgbW9yZSBzZXR1cFxyXG4gICAgICAgIGlmIChvcHRpb25zLnRvdWNoQWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMudG91Y2hBY3Rpb24udXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLmlucHV0VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIGV4aXN0aW5nIGV2ZW50IGxpc3RlbmVycyBhbmQgcmVpbml0aWFsaXplXHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0LnRhcmdldCA9IG9wdGlvbnMuaW5wdXRUYXJnZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdG9wIHJlY29nbml6aW5nIGZvciB0aGlzIHNlc3Npb24uXHJcbiAgICAgKiBUaGlzIHNlc3Npb24gd2lsbCBiZSBkaXNjYXJkZWQsIHdoZW4gYSBuZXcgW2lucHV0XXN0YXJ0IGV2ZW50IGlzIGZpcmVkLlxyXG4gICAgICogV2hlbiBmb3JjZWQsIHRoZSByZWNvZ25pemVyIGN5Y2xlIGlzIHN0b3BwZWQgaW1tZWRpYXRlbHkuXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZV1cclxuICAgICAqL1xyXG4gICAgc3RvcDogZnVuY3Rpb24oZm9yY2UpIHtcclxuICAgICAgICB0aGlzLnNlc3Npb24uc3RvcHBlZCA9IGZvcmNlID8gRk9SQ0VEX1NUT1AgOiBTVE9QO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJ1biB0aGUgcmVjb2duaXplcnMhXHJcbiAgICAgKiBjYWxsZWQgYnkgdGhlIGlucHV0SGFuZGxlciBmdW5jdGlvbiBvbiBldmVyeSBtb3ZlbWVudCBvZiB0aGUgcG9pbnRlcnMgKHRvdWNoZXMpXHJcbiAgICAgKiBpdCB3YWxrcyB0aHJvdWdoIGFsbCB0aGUgcmVjb2duaXplcnMgYW5kIHRyaWVzIHRvIGRldGVjdCB0aGUgZ2VzdHVyZSB0aGF0IGlzIGJlaW5nIG1hZGVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dERhdGFcclxuICAgICAqL1xyXG4gICAgcmVjb2duaXplOiBmdW5jdGlvbihpbnB1dERhdGEpIHtcclxuICAgICAgICB2YXIgc2Vzc2lvbiA9IHRoaXMuc2Vzc2lvbjtcclxuICAgICAgICBpZiAoc2Vzc2lvbi5zdG9wcGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJ1biB0aGUgdG91Y2gtYWN0aW9uIHBvbHlmaWxsXHJcbiAgICAgICAgdGhpcy50b3VjaEFjdGlvbi5wcmV2ZW50RGVmYXVsdHMoaW5wdXREYXRhKTtcclxuXHJcbiAgICAgICAgdmFyIHJlY29nbml6ZXI7XHJcbiAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcclxuXHJcbiAgICAgICAgLy8gdGhpcyBob2xkcyB0aGUgcmVjb2duaXplciB0aGF0IGlzIGJlaW5nIHJlY29nbml6ZWQuXHJcbiAgICAgICAgLy8gc28gdGhlIHJlY29nbml6ZXIncyBzdGF0ZSBuZWVkcyB0byBiZSBCRUdBTiwgQ0hBTkdFRCwgRU5ERUQgb3IgUkVDT0dOSVpFRFxyXG4gICAgICAgIC8vIGlmIG5vIHJlY29nbml6ZXIgaXMgZGV0ZWN0aW5nIGEgdGhpbmcsIGl0IGlzIHNldCB0byBgbnVsbGBcclxuICAgICAgICB2YXIgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplcjtcclxuXHJcbiAgICAgICAgLy8gcmVzZXQgd2hlbiB0aGUgbGFzdCByZWNvZ25pemVyIGlzIHJlY29nbml6ZWRcclxuICAgICAgICAvLyBvciB3aGVuIHdlJ3JlIGluIGEgbmV3IHNlc3Npb25cclxuICAgICAgICBpZiAoIWN1clJlY29nbml6ZXIgfHwgKGN1clJlY29nbml6ZXIgJiYgY3VyUmVjb2duaXplci5zdGF0ZSAmIFNUQVRFX1JFQ09HTklaRUQpKSB7XHJcbiAgICAgICAgICAgIGN1clJlY29nbml6ZXIgPSBzZXNzaW9uLmN1clJlY29nbml6ZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgIHdoaWxlIChpIDwgcmVjb2duaXplcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJlY29nbml6ZXIgPSByZWNvZ25pemVyc1tpXTtcclxuXHJcbiAgICAgICAgICAgIC8vIGZpbmQgb3V0IGlmIHdlIGFyZSBhbGxvd2VkIHRyeSB0byByZWNvZ25pemUgdGhlIGlucHV0IGZvciB0aGlzIG9uZS5cclxuICAgICAgICAgICAgLy8gMS4gICBhbGxvdyBpZiB0aGUgc2Vzc2lvbiBpcyBOT1QgZm9yY2VkIHN0b3BwZWQgKHNlZSB0aGUgLnN0b3AoKSBtZXRob2QpXHJcbiAgICAgICAgICAgIC8vIDIuICAgYWxsb3cgaWYgd2Ugc3RpbGwgaGF2ZW4ndCByZWNvZ25pemVkIGEgZ2VzdHVyZSBpbiB0aGlzIHNlc3Npb24sIG9yIHRoZSB0aGlzIHJlY29nbml6ZXIgaXMgdGhlIG9uZVxyXG4gICAgICAgICAgICAvLyAgICAgIHRoYXQgaXMgYmVpbmcgcmVjb2duaXplZC5cclxuICAgICAgICAgICAgLy8gMy4gICBhbGxvdyBpZiB0aGUgcmVjb2duaXplciBpcyBhbGxvd2VkIHRvIHJ1biBzaW11bHRhbmVvdXMgd2l0aCB0aGUgY3VycmVudCByZWNvZ25pemVkIHJlY29nbml6ZXIuXHJcbiAgICAgICAgICAgIC8vICAgICAgdGhpcyBjYW4gYmUgc2V0dXAgd2l0aCB0aGUgYHJlY29nbml6ZVdpdGgoKWAgbWV0aG9kIG9uIHRoZSByZWNvZ25pemVyLlxyXG4gICAgICAgICAgICBpZiAoc2Vzc2lvbi5zdG9wcGVkICE9PSBGT1JDRURfU1RPUCAmJiAoIC8vIDFcclxuICAgICAgICAgICAgICAgICAgICAhY3VyUmVjb2duaXplciB8fCByZWNvZ25pemVyID09IGN1clJlY29nbml6ZXIgfHwgLy8gMlxyXG4gICAgICAgICAgICAgICAgICAgIHJlY29nbml6ZXIuY2FuUmVjb2duaXplV2l0aChjdXJSZWNvZ25pemVyKSkpIHsgLy8gM1xyXG4gICAgICAgICAgICAgICAgcmVjb2duaXplci5yZWNvZ25pemUoaW5wdXREYXRhKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlY29nbml6ZXIucmVzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgdGhlIHJlY29nbml6ZXIgaGFzIGJlZW4gcmVjb2duaXppbmcgdGhlIGlucHV0IGFzIGEgdmFsaWQgZ2VzdHVyZSwgd2Ugd2FudCB0byBzdG9yZSB0aGlzIG9uZSBhcyB0aGVcclxuICAgICAgICAgICAgLy8gY3VycmVudCBhY3RpdmUgcmVjb2duaXplci4gYnV0IG9ubHkgaWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIGFuIGFjdGl2ZSByZWNvZ25pemVyXHJcbiAgICAgICAgICAgIGlmICghY3VyUmVjb2duaXplciAmJiByZWNvZ25pemVyLnN0YXRlICYgKFNUQVRFX0JFR0FOIHwgU1RBVEVfQ0hBTkdFRCB8IFNUQVRFX0VOREVEKSkge1xyXG4gICAgICAgICAgICAgICAgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplciA9IHJlY29nbml6ZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBnZXQgYSByZWNvZ25pemVyIGJ5IGl0cyBldmVudCBuYW1lLlxyXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfFN0cmluZ30gcmVjb2duaXplclxyXG4gICAgICogQHJldHVybnMge1JlY29nbml6ZXJ8TnVsbH1cclxuICAgICAqL1xyXG4gICAgZ2V0OiBmdW5jdGlvbihyZWNvZ25pemVyKSB7XHJcbiAgICAgICAgaWYgKHJlY29nbml6ZXIgaW5zdGFuY2VvZiBSZWNvZ25pemVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZWNvZ25pemVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY29nbml6ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChyZWNvZ25pemVyc1tpXS5vcHRpb25zLmV2ZW50ID09IHJlY29nbml6ZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWNvZ25pemVyc1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYSByZWNvZ25pemVyIHRvIHRoZSBtYW5hZ2VyXHJcbiAgICAgKiBleGlzdGluZyByZWNvZ25pemVycyB3aXRoIHRoZSBzYW1lIGV2ZW50IG5hbWUgd2lsbCBiZSByZW1vdmVkXHJcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IHJlY29nbml6ZXJcclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfE1hbmFnZXJ9XHJcbiAgICAgKi9cclxuICAgIGFkZDogZnVuY3Rpb24ocmVjb2duaXplcikge1xyXG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhyZWNvZ25pemVyLCAnYWRkJywgdGhpcykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZW1vdmUgZXhpc3RpbmdcclxuICAgICAgICB2YXIgZXhpc3RpbmcgPSB0aGlzLmdldChyZWNvZ25pemVyLm9wdGlvbnMuZXZlbnQpO1xyXG4gICAgICAgIGlmIChleGlzdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZShleGlzdGluZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlY29nbml6ZXJzLnB1c2gocmVjb2duaXplcik7XHJcbiAgICAgICAgcmVjb2duaXplci5tYW5hZ2VyID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy50b3VjaEFjdGlvbi51cGRhdGUoKTtcclxuICAgICAgICByZXR1cm4gcmVjb2duaXplcjtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmUgYSByZWNvZ25pemVyIGJ5IG5hbWUgb3IgaW5zdGFuY2VcclxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcnxTdHJpbmd9IHJlY29nbml6ZXJcclxuICAgICAqIEByZXR1cm5zIHtNYW5hZ2VyfVxyXG4gICAgICovXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uKHJlY29nbml6ZXIpIHtcclxuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcocmVjb2duaXplciwgJ3JlbW92ZScsIHRoaXMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcclxuICAgICAgICByZWNvZ25pemVyID0gdGhpcy5nZXQocmVjb2duaXplcik7XHJcbiAgICAgICAgcmVjb2duaXplcnMuc3BsaWNlKGluQXJyYXkocmVjb2duaXplcnMsIHJlY29nbml6ZXIpLCAxKTtcclxuXHJcbiAgICAgICAgdGhpcy50b3VjaEFjdGlvbi51cGRhdGUoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBiaW5kIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRzXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG9uOiBmdW5jdGlvbihldmVudHMsIGhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLmhhbmRsZXJzO1xyXG4gICAgICAgIGVhY2goc3BsaXRTdHIoZXZlbnRzKSwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgaGFuZGxlcnNbZXZlbnRdID0gaGFuZGxlcnNbZXZlbnRdIHx8IFtdO1xyXG4gICAgICAgICAgICBoYW5kbGVyc1tldmVudF0ucHVzaChoYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1bmJpbmQgZXZlbnQsIGxlYXZlIGVtaXQgYmxhbmsgdG8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50c1xyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2hhbmRsZXJdXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSB0aGlzXHJcbiAgICAgKi9cclxuICAgIG9mZjogZnVuY3Rpb24oZXZlbnRzLCBoYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXJzID0gdGhpcy5oYW5kbGVycztcclxuICAgICAgICBlYWNoKHNwbGl0U3RyKGV2ZW50cyksIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGhhbmRsZXJzW2V2ZW50XTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XS5zcGxpY2UoaW5BcnJheShoYW5kbGVyc1tldmVudF0sIGhhbmRsZXIpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGVtaXQgZXZlbnQgdG8gdGhlIGxpc3RlbmVyc1xyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gICAgICovXHJcbiAgICBlbWl0OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xyXG4gICAgICAgIC8vIHdlIGFsc28gd2FudCB0byB0cmlnZ2VyIGRvbSBldmVudHNcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRvbUV2ZW50cykge1xyXG4gICAgICAgICAgICB0cmlnZ2VyRG9tRXZlbnQoZXZlbnQsIGRhdGEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbm8gaGFuZGxlcnMsIHNvIHNraXAgaXQgYWxsXHJcbiAgICAgICAgdmFyIGhhbmRsZXJzID0gdGhpcy5oYW5kbGVyc1tldmVudF0gJiYgdGhpcy5oYW5kbGVyc1tldmVudF0uc2xpY2UoKTtcclxuICAgICAgICBpZiAoIWhhbmRsZXJzIHx8ICFoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGF0YS50eXBlID0gZXZlbnQ7XHJcbiAgICAgICAgZGF0YS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBkYXRhLnNyY0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgIHdoaWxlIChpIDwgaGFuZGxlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXJzW2ldKGRhdGEpO1xyXG4gICAgICAgICAgICBpKys7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlc3Ryb3kgdGhlIG1hbmFnZXIgYW5kIHVuYmluZHMgYWxsIGV2ZW50c1xyXG4gICAgICogaXQgZG9lc24ndCB1bmJpbmQgZG9tIGV2ZW50cywgdGhhdCBpcyB0aGUgdXNlciBvd24gcmVzcG9uc2liaWxpdHlcclxuICAgICAqL1xyXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ICYmIHRvZ2dsZUNzc1Byb3BzKHRoaXMsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMuc2Vzc2lvbiA9IHt9O1xyXG4gICAgICAgIHRoaXMuaW5wdXQuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogYWRkL3JlbW92ZSB0aGUgY3NzIHByb3BlcnRpZXMgYXMgZGVmaW5lZCBpbiBtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHNcclxuICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYWRkXHJcbiAqL1xyXG5mdW5jdGlvbiB0b2dnbGVDc3NQcm9wcyhtYW5hZ2VyLCBhZGQpIHtcclxuICAgIHZhciBlbGVtZW50ID0gbWFuYWdlci5lbGVtZW50O1xyXG4gICAgZWFjaChtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZVtwcmVmaXhlZChlbGVtZW50LnN0eWxlLCBuYW1lKV0gPSBhZGQgPyB2YWx1ZSA6ICcnO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiB0cmlnZ2VyIGRvbSBldmVudFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIHRyaWdnZXJEb21FdmVudChldmVudCwgZGF0YSkge1xyXG4gICAgdmFyIGdlc3R1cmVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gICAgZ2VzdHVyZUV2ZW50LmluaXRFdmVudChldmVudCwgdHJ1ZSwgdHJ1ZSk7XHJcbiAgICBnZXN0dXJlRXZlbnQuZ2VzdHVyZSA9IGRhdGE7XHJcbiAgICBkYXRhLnRhcmdldC5kaXNwYXRjaEV2ZW50KGdlc3R1cmVFdmVudCk7XHJcbn1cclxuXHJcbmV4dGVuZChIYW1tZXIsIHtcclxuICAgIElOUFVUX1NUQVJUOiBJTlBVVF9TVEFSVCxcclxuICAgIElOUFVUX01PVkU6IElOUFVUX01PVkUsXHJcbiAgICBJTlBVVF9FTkQ6IElOUFVUX0VORCxcclxuICAgIElOUFVUX0NBTkNFTDogSU5QVVRfQ0FOQ0VMLFxyXG5cclxuICAgIFNUQVRFX1BPU1NJQkxFOiBTVEFURV9QT1NTSUJMRSxcclxuICAgIFNUQVRFX0JFR0FOOiBTVEFURV9CRUdBTixcclxuICAgIFNUQVRFX0NIQU5HRUQ6IFNUQVRFX0NIQU5HRUQsXHJcbiAgICBTVEFURV9FTkRFRDogU1RBVEVfRU5ERUQsXHJcbiAgICBTVEFURV9SRUNPR05JWkVEOiBTVEFURV9SRUNPR05JWkVELFxyXG4gICAgU1RBVEVfQ0FOQ0VMTEVEOiBTVEFURV9DQU5DRUxMRUQsXHJcbiAgICBTVEFURV9GQUlMRUQ6IFNUQVRFX0ZBSUxFRCxcclxuXHJcbiAgICBESVJFQ1RJT05fTk9ORTogRElSRUNUSU9OX05PTkUsXHJcbiAgICBESVJFQ1RJT05fTEVGVDogRElSRUNUSU9OX0xFRlQsXHJcbiAgICBESVJFQ1RJT05fUklHSFQ6IERJUkVDVElPTl9SSUdIVCxcclxuICAgIERJUkVDVElPTl9VUDogRElSRUNUSU9OX1VQLFxyXG4gICAgRElSRUNUSU9OX0RPV046IERJUkVDVElPTl9ET1dOLFxyXG4gICAgRElSRUNUSU9OX0hPUklaT05UQUw6IERJUkVDVElPTl9IT1JJWk9OVEFMLFxyXG4gICAgRElSRUNUSU9OX1ZFUlRJQ0FMOiBESVJFQ1RJT05fVkVSVElDQUwsXHJcbiAgICBESVJFQ1RJT05fQUxMOiBESVJFQ1RJT05fQUxMLFxyXG5cclxuICAgIE1hbmFnZXI6IE1hbmFnZXIsXHJcbiAgICBJbnB1dDogSW5wdXQsXHJcbiAgICBUb3VjaEFjdGlvbjogVG91Y2hBY3Rpb24sXHJcblxyXG4gICAgVG91Y2hJbnB1dDogVG91Y2hJbnB1dCxcclxuICAgIE1vdXNlSW5wdXQ6IE1vdXNlSW5wdXQsXHJcbiAgICBQb2ludGVyRXZlbnRJbnB1dDogUG9pbnRlckV2ZW50SW5wdXQsXHJcbiAgICBUb3VjaE1vdXNlSW5wdXQ6IFRvdWNoTW91c2VJbnB1dCxcclxuICAgIFNpbmdsZVRvdWNoSW5wdXQ6IFNpbmdsZVRvdWNoSW5wdXQsXHJcblxyXG4gICAgUmVjb2duaXplcjogUmVjb2duaXplcixcclxuICAgIEF0dHJSZWNvZ25pemVyOiBBdHRyUmVjb2duaXplcixcclxuICAgIFRhcDogVGFwUmVjb2duaXplcixcclxuICAgIFBhbjogUGFuUmVjb2duaXplcixcclxuICAgIFN3aXBlOiBTd2lwZVJlY29nbml6ZXIsXHJcbiAgICBQaW5jaDogUGluY2hSZWNvZ25pemVyLFxyXG4gICAgUm90YXRlOiBSb3RhdGVSZWNvZ25pemVyLFxyXG4gICAgUHJlc3M6IFByZXNzUmVjb2duaXplcixcclxuXHJcbiAgICBvbjogYWRkRXZlbnRMaXN0ZW5lcnMsXHJcbiAgICBvZmY6IHJlbW92ZUV2ZW50TGlzdGVuZXJzLFxyXG4gICAgZWFjaDogZWFjaCxcclxuICAgIG1lcmdlOiBtZXJnZSxcclxuICAgIGV4dGVuZDogZXh0ZW5kLFxyXG4gICAgaW5oZXJpdDogaW5oZXJpdCxcclxuICAgIGJpbmRGbjogYmluZEZuLFxyXG4gICAgcHJlZml4ZWQ6IHByZWZpeGVkXHJcbn0pO1xyXG5cclxuaWYgKHR5cGVvZiBkZWZpbmUgPT0gVFlQRV9GVU5DVElPTiAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIEhhbW1lcjtcclxuICAgIH0pO1xyXG59IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gSGFtbWVyO1xyXG59IGVsc2Uge1xyXG4gICAgd2luZG93W2V4cG9ydE5hbWVdID0gSGFtbWVyO1xyXG59XHJcblxyXG59KSh3aW5kb3csIGRvY3VtZW50LCAnSGFtbWVyJyk7XHJcbiIsIi8qKlxuICogbWFya2VkIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0LCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkXG4gKi9cblxuOyhmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBCbG9jay1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGJsb2NrID0ge1xuICBuZXdsaW5lOiAvXlxcbisvLFxuICBjb2RlOiAvXiggezR9W15cXG5dK1xcbiopKy8sXG4gIGZlbmNlczogbm9vcCxcbiAgaHI6IC9eKCAqWy0qX10pezMsfSAqKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSAqKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvLFxuICBucHRhYmxlOiBub29wLFxuICBsaGVhZGluZzogL14oW15cXG5dKylcXG4gKig9fC0pezIsfSAqKD86XFxuK3wkKS8sXG4gIGJsb2NrcXVvdGU6IC9eKCAqPlteXFxuXSsoXFxuKD8hZGVmKVteXFxuXSspKlxcbiopKy8sXG4gIGxpc3Q6IC9eKCAqKShidWxsKSBbXFxzXFxTXSs/KD86aHJ8ZGVmfFxcbnsyLH0oPyEgKSg/IVxcMWJ1bGwgKVxcbip8XFxzKiQpLyxcbiAgaHRtbDogL14gKig/OmNvbW1lbnQgKig/OlxcbnxcXHMqJCl8Y2xvc2VkICooPzpcXG57Mix9fFxccyokKXxjbG9zaW5nICooPzpcXG57Mix9fFxccyokKSkvLFxuICBkZWY6IC9eICpcXFsoW15cXF1dKylcXF06ICo8PyhbXlxccz5dKyk+Pyg/OiArW1wiKF0oW15cXG5dKylbXCIpXSk/ICooPzpcXG4rfCQpLyxcbiAgdGFibGU6IG5vb3AsXG4gIHBhcmFncmFwaDogL14oKD86W15cXG5dK1xcbj8oPyFocnxoZWFkaW5nfGxoZWFkaW5nfGJsb2NrcXVvdGV8dGFnfGRlZikpKylcXG4qLyxcbiAgdGV4dDogL15bXlxcbl0rL1xufTtcblxuYmxvY2suYnVsbGV0ID0gLyg/OlsqKy1dfFxcZCtcXC4pLztcbmJsb2NrLml0ZW0gPSAvXiggKikoYnVsbCkgW15cXG5dKig/Olxcbig/IVxcMWJ1bGwgKVteXFxuXSopKi87XG5ibG9jay5pdGVtID0gcmVwbGFjZShibG9jay5pdGVtLCAnZ20nKVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoKTtcblxuYmxvY2subGlzdCA9IHJlcGxhY2UoYmxvY2subGlzdClcbiAgKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgKCdocicsICdcXFxcbisoPz1cXFxcMT8oPzpbLSpfXSAqKXszLH0oPzpcXFxcbit8JCkpJylcbiAgKCdkZWYnLCAnXFxcXG4rKD89JyArIGJsb2NrLmRlZi5zb3VyY2UgKyAnKScpXG4gICgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gcmVwbGFjZShibG9jay5ibG9ja3F1b3RlKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbmJsb2NrLl90YWcgPSAnKD8hKD86J1xuICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZSdcbiAgKyAnfHZhcnxzYW1wfGtiZHxzdWJ8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvJ1xuICArICd8c3Bhbnxicnx3YnJ8aW5zfGRlbHxpbWcpXFxcXGIpXFxcXHcrKD8hOi98W15cXFxcd1xcXFxzQF0qQClcXFxcYic7XG5cbmJsb2NrLmh0bWwgPSByZXBsYWNlKGJsb2NrLmh0bWwpXG4gICgnY29tbWVudCcsIC88IS0tW1xcc1xcU10qPy0tPi8pXG4gICgnY2xvc2VkJywgLzwodGFnKVtcXHNcXFNdKz88XFwvXFwxPi8pXG4gICgnY2xvc2luZycsIC88dGFnKD86XCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj8+LylcbiAgKC90YWcvZywgYmxvY2suX3RhZylcbiAgKCk7XG5cbmJsb2NrLnBhcmFncmFwaCA9IHJlcGxhY2UoYmxvY2sucGFyYWdyYXBoKVxuICAoJ2hyJywgYmxvY2suaHIpXG4gICgnaGVhZGluZycsIGJsb2NrLmhlYWRpbmcpXG4gICgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgKCdibG9ja3F1b3RlJywgYmxvY2suYmxvY2txdW90ZSlcbiAgKCd0YWcnLCAnPCcgKyBibG9jay5fdGFnKVxuICAoJ2RlZicsIGJsb2NrLmRlZilcbiAgKCk7XG5cbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5ub3JtYWwgPSBtZXJnZSh7fSwgYmxvY2spO1xuXG4vKipcbiAqIEdGTSBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2suZ2ZtID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICBmZW5jZXM6IC9eICooYHszLH18fnszLH0pWyBcXC5dKihcXFMrKT8gKlxcbihbXFxzXFxTXSo/KVxccypcXDEgKig/Olxcbit8JCkvLFxuICBwYXJhZ3JhcGg6IC9eLyxcbiAgaGVhZGluZzogL14gKigjezEsNn0pICsoW15cXG5dKz8pICojKiAqKD86XFxuK3wkKS9cbn0pO1xuXG5ibG9jay5nZm0ucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnKD8hJywgJyg/ISdcbiAgICArIGJsb2NrLmdmbS5mZW5jZXMuc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwyJykgKyAnfCdcbiAgICArIGJsb2NrLmxpc3Quc291cmNlLnJlcGxhY2UoJ1xcXFwxJywgJ1xcXFwzJykgKyAnfCcpXG4gICgpO1xuXG4vKipcbiAqIEdGTSArIFRhYmxlcyBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2sudGFibGVzID0gbWVyZ2Uoe30sIGJsb2NrLmdmbSwge1xuICBucHRhYmxlOiAvXiAqKFxcUy4qXFx8LiopXFxuICooWy06XSsgKlxcfFstfCA6XSopXFxuKCg/Oi4qXFx8LiooPzpcXG58JCkpKilcXG4qLyxcbiAgdGFibGU6IC9eICpcXHwoLispXFxuICpcXHwoICpbLTpdK1stfCA6XSopXFxuKCg/OiAqXFx8LiooPzpcXG58JCkpKilcXG4qL1xufSk7XG5cbi8qKlxuICogQmxvY2sgTGV4ZXJcbiAqL1xuXG5mdW5jdGlvbiBMZXhlcihvcHRpb25zKSB7XG4gIHRoaXMudG9rZW5zID0gW107XG4gIHRoaXMudG9rZW5zLmxpbmtzID0ge307XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLnJ1bGVzID0gYmxvY2subm9ybWFsO1xuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50YWJsZXMpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay50YWJsZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucnVsZXMgPSBibG9jay5nZm07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhwb3NlIEJsb2NrIFJ1bGVzXG4gKi9cblxuTGV4ZXIucnVsZXMgPSBibG9jaztcblxuLyoqXG4gKiBTdGF0aWMgTGV4IE1ldGhvZFxuICovXG5cbkxleGVyLmxleCA9IGZ1bmN0aW9uKHNyYywgb3B0aW9ucykge1xuICB2YXIgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gIHJldHVybiBsZXhlci5sZXgoc3JjKTtcbn07XG5cbi8qKlxuICogUHJlcHJvY2Vzc2luZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS5sZXggPSBmdW5jdGlvbihzcmMpIHtcbiAgc3JjID0gc3JjXG4gICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpXG4gICAgLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpXG4gICAgLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKVxuICAgIC5yZXBsYWNlKC9cXHUyNDI0L2csICdcXG4nKTtcblxuICByZXR1cm4gdGhpcy50b2tlbihzcmMsIHRydWUpO1xufTtcblxuLyoqXG4gKiBMZXhpbmdcbiAqL1xuXG5MZXhlci5wcm90b3R5cGUudG9rZW4gPSBmdW5jdGlvbihzcmMsIHRvcCwgYnEpIHtcbiAgdmFyIHNyYyA9IHNyYy5yZXBsYWNlKC9eICskL2dtLCAnJylcbiAgICAsIG5leHRcbiAgICAsIGxvb3NlXG4gICAgLCBjYXBcbiAgICAsIGJ1bGxcbiAgICAsIGJcbiAgICAsIGl0ZW1cbiAgICAsIHNwYWNlXG4gICAgLCBpXG4gICAgLCBsO1xuXG4gIHdoaWxlIChzcmMpIHtcbiAgICAvLyBuZXdsaW5lXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubmV3bGluZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzBdLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ3NwYWNlJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiB7NH0vZ20sICcnKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHRleHQ6ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICA/IGNhcC5yZXBsYWNlKC9cXG4rJC8sICcnKVxuICAgICAgICAgIDogY2FwXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGZlbmNlcyAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmZlbmNlcy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICBsYW5nOiBjYXBbMl0sXG4gICAgICAgIHRleHQ6IGNhcFszXSB8fCAnJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaGVhZGluZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgdGV4dDogY2FwWzJdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhYmxlIG5vIGxlYWRpbmcgcGlwZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMubnB0YWJsZS5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuXG4gICAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IGNhcFsxXS5yZXBsYWNlKC9eICp8ICpcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgY2VsbHM6IGNhcFszXS5yZXBsYWNlKC9cXG4kLywgJycpLnNwbGl0KCdcXG4nKVxuICAgICAgfTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uYWxpZ24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVtLmNlbGxzW2ldID0gaXRlbS5jZWxsc1tpXS5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaGVhZGluZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxoZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMl0gPT09ICc9JyA/IDEgOiAyLFxuICAgICAgICB0ZXh0OiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHJcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oci5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2hyJ1xuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBibG9ja3F1b3RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYmxvY2txdW90ZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9zdGFydCdcbiAgICAgIH0pO1xuXG4gICAgICBjYXAgPSBjYXBbMF0ucmVwbGFjZSgvXiAqPiA/L2dtLCAnJyk7XG5cbiAgICAgIC8vIFBhc3MgYHRvcGAgdG8ga2VlcCB0aGUgY3VycmVudFxuICAgICAgLy8gXCJ0b3BsZXZlbFwiIHN0YXRlLiBUaGlzIGlzIGV4YWN0bHlcbiAgICAgIC8vIGhvdyBtYXJrZG93bi5wbCB3b3Jrcy5cbiAgICAgIHRoaXMudG9rZW4oY2FwLCB0b3AsIHRydWUpO1xuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGVfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxpc3RcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5saXN0LmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGJ1bGwgPSBjYXBbMl07XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9zdGFydCcsXG4gICAgICAgIG9yZGVyZWQ6IGJ1bGwubGVuZ3RoID4gMVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEdldCBlYWNoIHRvcC1sZXZlbCBpdGVtLlxuICAgICAgY2FwID0gY2FwWzBdLm1hdGNoKHRoaXMucnVsZXMuaXRlbSk7XG5cbiAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgIGwgPSBjYXAubGVuZ3RoO1xuICAgICAgaSA9IDA7XG5cbiAgICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGl0ZW0gPSBjYXBbaV07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0IGl0ZW0ncyBidWxsZXRcbiAgICAgICAgLy8gc28gaXQgaXMgc2VlbiBhcyB0aGUgbmV4dCB0b2tlbi5cbiAgICAgICAgc3BhY2UgPSBpdGVtLmxlbmd0aDtcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXiAqKFsqKy1dfFxcZCtcXC4pICsvLCAnJyk7XG5cbiAgICAgICAgLy8gT3V0ZGVudCB3aGF0ZXZlciB0aGVcbiAgICAgICAgLy8gbGlzdCBpdGVtIGNvbnRhaW5zLiBIYWNreS5cbiAgICAgICAgaWYgKH5pdGVtLmluZGV4T2YoJ1xcbiAnKSkge1xuICAgICAgICAgIHNwYWNlIC09IGl0ZW0ubGVuZ3RoO1xuICAgICAgICAgIGl0ZW0gPSAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgICA/IGl0ZW0ucmVwbGFjZShuZXcgUmVnRXhwKCdeIHsxLCcgKyBzcGFjZSArICd9JywgJ2dtJyksICcnKVxuICAgICAgICAgICAgOiBpdGVtLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRoZSBuZXh0IGxpc3QgaXRlbSBiZWxvbmdzIGhlcmUuXG4gICAgICAgIC8vIEJhY2twZWRhbCBpZiBpdCBkb2VzIG5vdCBiZWxvbmcgaW4gdGhpcyBsaXN0LlxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNtYXJ0TGlzdHMgJiYgaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBiID0gYmxvY2suYnVsbGV0LmV4ZWMoY2FwW2kgKyAxXSlbMF07XG4gICAgICAgICAgaWYgKGJ1bGwgIT09IGIgJiYgIShidWxsLmxlbmd0aCA+IDEgJiYgYi5sZW5ndGggPiAxKSkge1xuICAgICAgICAgICAgc3JjID0gY2FwLnNsaWNlKGkgKyAxKS5qb2luKCdcXG4nKSArIHNyYztcbiAgICAgICAgICAgIGkgPSBsIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciBpdGVtIGlzIGxvb3NlIG9yIG5vdC5cbiAgICAgICAgLy8gVXNlOiAvKF58XFxuKSg/ISApW15cXG5dK1xcblxcbig/IVxccyokKS9cbiAgICAgICAgLy8gZm9yIGRpc2NvdW50IGJlaGF2aW9yLlxuICAgICAgICBsb29zZSA9IG5leHQgfHwgL1xcblxcbig/IVxccyokKS8udGVzdChpdGVtKTtcbiAgICAgICAgaWYgKGkgIT09IGwgLSAxKSB7XG4gICAgICAgICAgbmV4dCA9IGl0ZW0uY2hhckF0KGl0ZW0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nO1xuICAgICAgICAgIGlmICghbG9vc2UpIGxvb3NlID0gbmV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICAgIHR5cGU6IGxvb3NlXG4gICAgICAgICAgICA/ICdsb29zZV9pdGVtX3N0YXJ0J1xuICAgICAgICAgICAgOiAnbGlzdF9pdGVtX3N0YXJ0J1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZWN1cnNlLlxuICAgICAgICB0aGlzLnRva2VuKGl0ZW0sIGZhbHNlLCBicSk7XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbV9lbmQnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpc3RfZW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGh0bWxcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5odG1sLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICdwYXJhZ3JhcGgnXG4gICAgICAgICAgOiAnaHRtbCcsXG4gICAgICAgIHByZTogIXRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAmJiAoY2FwWzFdID09PSAncHJlJyB8fCBjYXBbMV0gPT09ICdzY3JpcHQnIHx8IGNhcFsxXSA9PT0gJ3N0eWxlJyksXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWZcbiAgICBpZiAoKCFicSAmJiB0b3ApICYmIChjYXAgPSB0aGlzLnJ1bGVzLmRlZi5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMubGlua3NbY2FwWzFdLnRvTG93ZXJDYXNlKCldID0ge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0YWJsZSAoZ2ZtKVxuICAgIGlmICh0b3AgJiYgKGNhcCA9IHRoaXMucnVsZXMudGFibGUuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBjYXBbMV0ucmVwbGFjZSgvXiAqfCAqXFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIGNlbGxzOiBjYXBbM10ucmVwbGFjZSgvKD86ICpcXHwgKik/XFxuJC8sICcnKS5zcGxpdCgnXFxuJylcbiAgICAgIH07XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmFsaWduLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0uY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlbS5jZWxsc1tpXSA9IGl0ZW0uY2VsbHNbaV1cbiAgICAgICAgICAucmVwbGFjZSgvXiAqXFx8ICp8ICpcXHwgKiQvZywgJycpXG4gICAgICAgICAgLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnBhcmFncmFwaC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICB0ZXh0OiBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgICA6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIC8vIFRvcC1sZXZlbCBzaG91bGQgbmV2ZXIgcmVhY2ggaGVyZS5cbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXMudG9rZW5zO1xufTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5cbnZhciBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFtcXFxcYCp7fVxcW1xcXSgpIytcXC0uIV8+XSkvLFxuICBhdXRvbGluazogL148KFteID5dKyhAfDpcXC8pW14gPl0rKT4vLFxuICB1cmw6IG5vb3AsXG4gIHRhZzogL148IS0tW1xcc1xcU10qPy0tPnxePFxcLz9cXHcrKD86XCJbXlwiXSpcInwnW14nXSonfFteJ1wiPl0pKj8+LyxcbiAgbGluazogL14hP1xcWyhpbnNpZGUpXFxdXFwoaHJlZlxcKS8sXG4gIHJlZmxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxccypcXFsoW15cXF1dKilcXF0vLFxuICBub2xpbms6IC9eIT9cXFsoKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV0pKilcXF0vLFxuICBzdHJvbmc6IC9eX18oW1xcc1xcU10rPylfXyg/IV8pfF5cXCpcXCooW1xcc1xcU10rPylcXCpcXCooPyFcXCopLyxcbiAgZW06IC9eXFxiXygoPzpbXl9dfF9fKSs/KV9cXGJ8XlxcKigoPzpcXCpcXCp8W1xcc1xcU10pKz8pXFwqKD8hXFwqKS8sXG4gIGNvZGU6IC9eKGArKVxccyooW1xcc1xcU10qP1teYF0pXFxzKlxcMSg/IWApLyxcbiAgYnI6IC9eIHsyLH1cXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3AsXG4gIHRleHQ6IC9eW1xcc1xcU10rPyg/PVtcXFxcPCFcXFtfKmBdfCB7Mix9XFxufCQpL1xufTtcblxuaW5saW5lLl9pbnNpZGUgPSAvKD86XFxbW15cXF1dKlxcXXxbXlxcW1xcXV18XFxdKD89W15cXFtdKlxcXSkpKi87XG5pbmxpbmUuX2hyZWYgPSAvXFxzKjw/KFtcXHNcXFNdKj8pPj8oPzpcXHMrWydcIl0oW1xcc1xcU10qPylbJ1wiXSk/XFxzKi87XG5cbmlubGluZS5saW5rID0gcmVwbGFjZShpbmxpbmUubGluaylcbiAgKCdpbnNpZGUnLCBpbmxpbmUuX2luc2lkZSlcbiAgKCdocmVmJywgaW5saW5lLl9ocmVmKVxuICAoKTtcblxuaW5saW5lLnJlZmxpbmsgPSByZXBsYWNlKGlubGluZS5yZWZsaW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0gbWVyZ2Uoe30sIGlubGluZSk7XG5cbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUucGVkYW50aWMgPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBzdHJvbmc6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICBlbTogL15fKD89XFxTKShbXFxzXFxTXSo/XFxTKV8oPyFfKXxeXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKikvXG59KTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgZXNjYXBlOiByZXBsYWNlKGlubGluZS5lc2NhcGUpKCddKScsICd+fF0pJykoKSxcbiAgdXJsOiAvXihodHRwcz86XFwvXFwvW15cXHM8XStbXjwuLDo7XCInKVxcXVxcc10pLyxcbiAgZGVsOiAvXn5+KD89XFxTKShbXFxzXFxTXSo/XFxTKX5+LyxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUudGV4dClcbiAgICAoJ118JywgJ35dfCcpXG4gICAgKCd8JywgJ3xodHRwcz86Ly98JylcbiAgICAoKVxufSk7XG5cbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0gbWVyZ2Uoe30sIGlubGluZS5nZm0sIHtcbiAgYnI6IHJlcGxhY2UoaW5saW5lLmJyKSgnezIsfScsICcqJykoKSxcbiAgdGV4dDogcmVwbGFjZShpbmxpbmUuZ2ZtLnRleHQpKCd7Mix9JywgJyonKSgpXG59KTtcblxuLyoqXG4gKiBJbmxpbmUgTGV4ZXIgJiBDb21waWxlclxuICovXG5cbmZ1bmN0aW9uIElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbWFya2VkLmRlZmF1bHRzO1xuICB0aGlzLmxpbmtzID0gbGlua3M7XG4gIHRoaXMucnVsZXMgPSBpbmxpbmUubm9ybWFsO1xuICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcjtcbiAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gIGlmICghdGhpcy5saW5rcykge1xuICAgIHRocm93IG5ld1xuICAgICAgRXJyb3IoJ1Rva2VucyBhcnJheSByZXF1aXJlcyBhIGBsaW5rc2AgcHJvcGVydHkuJyk7XG4gIH1cblxuICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmJyZWFrcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGlubGluZS5nZm07XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgIHRoaXMucnVsZXMgPSBpbmxpbmUucGVkYW50aWM7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgSW5saW5lIFJ1bGVzXG4gKi9cblxuSW5saW5lTGV4ZXIucnVsZXMgPSBpbmxpbmU7XG5cbi8qKlxuICogU3RhdGljIExleGluZy9Db21waWxpbmcgTWV0aG9kXG4gKi9cblxuSW5saW5lTGV4ZXIub3V0cHV0ID0gZnVuY3Rpb24oc3JjLCBsaW5rcywgb3B0aW9ucykge1xuICB2YXIgaW5saW5lID0gbmV3IElubGluZUxleGVyKGxpbmtzLCBvcHRpb25zKTtcbiAgcmV0dXJuIGlubGluZS5vdXRwdXQoc3JjKTtcbn07XG5cbi8qKlxuICogTGV4aW5nL0NvbXBpbGluZ1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihzcmMpIHtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsaW5rXG4gICAgLCB0ZXh0XG4gICAgLCBocmVmXG4gICAgLCBjYXA7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIGVzY2FwZVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVzY2FwZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gY2FwWzFdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gYXV0b2xpbmtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5hdXRvbGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGNhcFsxXS5jaGFyQXQoNikgPT09ICc6J1xuICAgICAgICAgID8gdGhpcy5tYW5nbGUoY2FwWzFdLnN1YnN0cmluZyg3KSlcbiAgICAgICAgICA6IHRoaXMubWFuZ2xlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0aGlzLm1hbmdsZSgnbWFpbHRvOicpICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICB9XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdXJsIChnZm0pXG4gICAgaWYgKCF0aGlzLmluTGluayAmJiAoY2FwID0gdGhpcy5ydWxlcy51cmwuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGluayhocmVmLCBudWxsLCB0ZXh0KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHRhZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRhZy5leGVjKHNyYykpIHtcbiAgICAgIGlmICghdGhpcy5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSlcbiAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pXG4gICAgICAgIDogY2FwWzBdXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsaW5rXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGluay5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwge1xuICAgICAgICBocmVmOiBjYXBbMl0sXG4gICAgICAgIHRpdGxlOiBjYXBbM11cbiAgICAgIH0pO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHJlZmxpbmssIG5vbGlua1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5yZWZsaW5rLmV4ZWMoc3JjKSlcbiAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMubm9saW5rLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBsaW5rID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGxpbmsgPSB0aGlzLmxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmsgfHwgIWxpbmsuaHJlZikge1xuICAgICAgICBvdXQgKz0gY2FwWzBdLmNoYXJBdCgwKTtcbiAgICAgICAgc3JjID0gY2FwWzBdLnN1YnN0cmluZygxKSArIHNyYztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICBvdXQgKz0gdGhpcy5vdXRwdXRMaW5rKGNhcCwgbGluayk7XG4gICAgICB0aGlzLmluTGluayA9IGZhbHNlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gc3Ryb25nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuc3Ryb25nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnN0cm9uZyh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBlbVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmVtLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmVtKHRoaXMub3V0cHV0KGNhcFsyXSB8fCBjYXBbMV0pKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGVzcGFuKGVzY2FwZShjYXBbMl0sIHRydWUpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJyXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuYnIuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuYnIoKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGRlbCAoZ2ZtKVxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmRlbC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5kZWwodGhpcy5vdXRwdXQoY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0ZXh0XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGV4dC5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50ZXh0KGVzY2FwZSh0aGlzLnNtYXJ0eXBhbnRzKGNhcFswXSkpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIENvbXBpbGUgTGlua1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5vdXRwdXRMaW5rID0gZnVuY3Rpb24oY2FwLCBsaW5rKSB7XG4gIHZhciBocmVmID0gZXNjYXBlKGxpbmsuaHJlZilcbiAgICAsIHRpdGxlID0gbGluay50aXRsZSA/IGVzY2FwZShsaW5rLnRpdGxlKSA6IG51bGw7XG5cbiAgcmV0dXJuIGNhcFswXS5jaGFyQXQoMCkgIT09ICchJ1xuICAgID8gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIHRpdGxlLCB0aGlzLm91dHB1dChjYXBbMV0pKVxuICAgIDogdGhpcy5yZW5kZXJlci5pbWFnZShocmVmLCB0aXRsZSwgZXNjYXBlKGNhcFsxXSkpO1xufTtcblxuLyoqXG4gKiBTbWFydHlwYW50cyBUcmFuc2Zvcm1hdGlvbnNcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUuc21hcnR5cGFudHMgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIGlmICghdGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzKSByZXR1cm4gdGV4dDtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn07XG5cbi8qKlxuICogTWFuZ2xlIExpbmtzXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm1hbmdsZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMubWFuZ2xlKSByZXR1cm4gdGV4dDtcbiAgdmFyIG91dCA9ICcnXG4gICAgLCBsID0gdGV4dC5sZW5ndGhcbiAgICAsIGkgPSAwXG4gICAgLCBjaDtcblxuICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgIGNoID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBjaCA9ICd4JyArIGNoLnRvU3RyaW5nKDE2KTtcbiAgICB9XG4gICAgb3V0ICs9ICcmIycgKyBjaCArICc7JztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cblxuZnVuY3Rpb24gUmVuZGVyZXIob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xufVxuXG5SZW5kZXJlci5wcm90b3R5cGUuY29kZSA9IGZ1bmN0aW9uKGNvZGUsIGxhbmcsIGVzY2FwZWQpIHtcbiAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICB2YXIgb3V0ID0gdGhpcy5vcHRpb25zLmhpZ2hsaWdodChjb2RlLCBsYW5nKTtcbiAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgIGNvZGUgPSBvdXQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFsYW5nKSB7XG4gICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgKyAnXFxuPC9jb2RlPjwvcHJlPic7XG4gIH1cblxuICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMubGFuZ1ByZWZpeFxuICAgICsgZXNjYXBlKGxhbmcsIHRydWUpXG4gICAgKyAnXCI+J1xuICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICsgJ1xcbjwvY29kZT48L3ByZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJsb2NrcXVvdGUgPSBmdW5jdGlvbihxdW90ZSkge1xuICByZXR1cm4gJzxibG9ja3F1b3RlPlxcbicgKyBxdW90ZSArICc8L2Jsb2NrcXVvdGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24oaHRtbCkge1xuICByZXR1cm4gaHRtbDtcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5oZWFkaW5nID0gZnVuY3Rpb24odGV4dCwgbGV2ZWwsIHJhdykge1xuICByZXR1cm4gJzxoJ1xuICAgICsgbGV2ZWxcbiAgICArICcgaWQ9XCInXG4gICAgKyB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4XG4gICAgKyByYXcudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXlxcd10rL2csICctJylcbiAgICArICdcIj4nXG4gICAgKyB0ZXh0XG4gICAgKyAnPC9oJ1xuICAgICsgbGV2ZWxcbiAgICArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5ociA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxoci8+XFxuJyA6ICc8aHI+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0ID0gZnVuY3Rpb24oYm9keSwgb3JkZXJlZCkge1xuICB2YXIgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJztcbiAgcmV0dXJuICc8JyArIHR5cGUgKyAnPlxcbicgKyBib2R5ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGlzdGl0ZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGxpPicgKyB0ZXh0ICsgJzwvbGk+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5wYXJhZ3JhcGggPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPHA+JyArIHRleHQgKyAnPC9wPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGUgPSBmdW5jdGlvbihoZWFkZXIsIGJvZHkpIHtcbiAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICsgJzx0aGVhZD5cXG4nXG4gICAgKyBoZWFkZXJcbiAgICArICc8L3RoZWFkPlxcbidcbiAgICArICc8dGJvZHk+XFxuJ1xuICAgICsgYm9keVxuICAgICsgJzwvdGJvZHk+XFxuJ1xuICAgICsgJzwvdGFibGU+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZXJvdyA9IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgcmV0dXJuICc8dHI+XFxuJyArIGNvbnRlbnQgKyAnPC90cj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlY2VsbCA9IGZ1bmN0aW9uKGNvbnRlbnQsIGZsYWdzKSB7XG4gIHZhciB0eXBlID0gZmxhZ3MuaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gIHZhciB0YWcgPSBmbGFncy5hbGlnblxuICAgID8gJzwnICsgdHlwZSArICcgc3R5bGU9XCJ0ZXh0LWFsaWduOicgKyBmbGFncy5hbGlnbiArICdcIj4nXG4gICAgOiAnPCcgKyB0eXBlICsgJz4nO1xuICByZXR1cm4gdGFnICsgY29udGVudCArICc8LycgKyB0eXBlICsgJz5cXG4nO1xufTtcblxuLy8gc3BhbiBsZXZlbCByZW5kZXJlclxuUmVuZGVyZXIucHJvdG90eXBlLnN0cm9uZyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8c3Ryb25nPicgKyB0ZXh0ICsgJzwvc3Ryb25nPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuZW0gPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGVtPicgKyB0ZXh0ICsgJzwvZW0+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2Rlc3BhbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8Y29kZT4nICsgdGV4dCArICc8L2NvZGU+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5iciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxici8+JyA6ICc8YnI+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5kZWwgPSBmdW5jdGlvbih0ZXh0KSB7XG4gIHJldHVybiAnPGRlbD4nICsgdGV4dCArICc8L2RlbD4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpbmsgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICBpZiAodGhpcy5vcHRpb25zLnNhbml0aXplKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBwcm90ID0gZGVjb2RlVVJJQ29tcG9uZW50KHVuZXNjYXBlKGhyZWYpKVxuICAgICAgICAucmVwbGFjZSgvW15cXHc6XS9nLCAnJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH1cbiAgdmFyIG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaW1hZ2UgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICB2YXIgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuIHRleHQ7XG59O1xuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2VuID0gbnVsbDtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbn1cblxuLyoqXG4gKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gKi9cblxuUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zLCByZW5kZXJlcikge1xuICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zLCByZW5kZXJlcik7XG4gIHJldHVybiBwYXJzZXIucGFyc2Uoc3JjKTtcbn07XG5cbi8qKlxuICogUGFyc2UgTG9vcFxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihzcmMpIHtcbiAgdGhpcy5pbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIoc3JjLmxpbmtzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVuZGVyZXIpO1xuICB0aGlzLnRva2VucyA9IHNyYy5yZXZlcnNlKCk7XG5cbiAgdmFyIG91dCA9ICcnO1xuICB3aGlsZSAodGhpcy5uZXh0KCkpIHtcbiAgICBvdXQgKz0gdGhpcy50b2soKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW4gPSB0aGlzLnRva2Vucy5wb3AoKTtcbn07XG5cbi8qKlxuICogUHJldmlldyBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnRva2Vucy5sZW5ndGggLSAxXSB8fCAwO1xufTtcblxuLyoqXG4gKiBQYXJzZSBUZXh0IFRva2Vuc1xuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2VUZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBib2R5ID0gdGhpcy50b2tlbi50ZXh0O1xuXG4gIHdoaWxlICh0aGlzLnBlZWsoKS50eXBlID09PSAndGV4dCcpIHtcbiAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5uZXh0KCkudGV4dDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmlubGluZS5vdXRwdXQoYm9keSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIEN1cnJlbnQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnRvayA9IGZ1bmN0aW9uKCkge1xuICBzd2l0Y2ggKHRoaXMudG9rZW4udHlwZSkge1xuICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjYXNlICdocic6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgfVxuICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSxcbiAgICAgICAgdGhpcy50b2tlbi5kZXB0aCxcbiAgICAgICAgdGhpcy50b2tlbi50ZXh0KTtcbiAgICB9XG4gICAgY2FzZSAnY29kZSc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmNvZGUodGhpcy50b2tlbi50ZXh0LFxuICAgICAgICB0aGlzLnRva2VuLmxhbmcsXG4gICAgICAgIHRoaXMudG9rZW4uZXNjYXBlZCk7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgdmFyIGhlYWRlciA9ICcnXG4gICAgICAgICwgYm9keSA9ICcnXG4gICAgICAgICwgaVxuICAgICAgICAsIHJvd1xuICAgICAgICAsIGNlbGxcbiAgICAgICAgLCBmbGFnc1xuICAgICAgICAsIGo7XG5cbiAgICAgIC8vIGhlYWRlclxuICAgICAgY2VsbCA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZsYWdzID0geyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH07XG4gICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4uaGVhZGVyW2ldKSxcbiAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJvdyA9IHRoaXMudG9rZW4uY2VsbHNbaV07XG5cbiAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dChyb3dbal0pLFxuICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnXG4gICAgICAgICwgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZDtcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2tlbi50eXBlID09PSAndGV4dCdcbiAgICAgICAgICA/IHRoaXMucGFyc2VUZXh0KClcbiAgICAgICAgICA6IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsb29zZV9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgdmFyIGh0bWwgPSAhdGhpcy50b2tlbi5wcmUgJiYgIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICA/IHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpXG4gICAgICAgIDogdGhpcy50b2tlbi50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbChodG1sKTtcbiAgICB9XG4gICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpKTtcbiAgICB9XG4gICAgY2FzZSAndGV4dCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlVGV4dCgpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSghZW5jb2RlID8gLyYoPyEjP1xcdys7KS9nIDogLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKC8mKFsjXFx3XSspOy9nLCBmdW5jdGlvbihfLCBuKSB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlKHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGYobmFtZSwgdmFsKSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvKF58W15cXFtdKVxcXi9nLCAnJDEnKTtcbiAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5ub29wLmV4ZWMgPSBub29wO1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgdmFyIGkgPSAxXG4gICAgLCB0YXJnZXRcbiAgICAsIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgaWYgKGNhbGxiYWNrIHx8IHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcblxuICAgIHZhciBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0XG4gICAgICAsIHRva2Vuc1xuICAgICAgLCBwZW5kaW5nXG4gICAgICAsIGkgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgcGVuZGluZyA9IHRva2Vucy5sZW5ndGg7XG5cbiAgICB2YXIgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG91dDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgb3V0ID0gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXJyID0gZTtcbiAgICAgIH1cblxuICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgcmV0dXJuIGVyclxuICAgICAgICA/IGNhbGxiYWNrKGVycilcbiAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgIH07XG5cbiAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUoKTtcblxuICAgIGZvciAoOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAoZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICdjb2RlJykge1xuICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICBpZiAoY29kZSA9PSBudWxsIHx8IGNvZGUgPT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRva2Vuc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKG9wdCkgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKExleGVyLmxleChzcmMsIG9wdCksIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWQuJztcbiAgICBpZiAoKG9wdCB8fCBtYXJrZWQuZGVmYXVsdHMpLnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWVyZ2UobWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmRlZmF1bHRzID0ge1xuICBnZm06IHRydWUsXG4gIHRhYmxlczogdHJ1ZSxcbiAgYnJlYWtzOiBmYWxzZSxcbiAgcGVkYW50aWM6IGZhbHNlLFxuICBzYW5pdGl6ZTogZmFsc2UsXG4gIHNhbml0aXplcjogbnVsbCxcbiAgbWFuZ2xlOiB0cnVlLFxuICBzbWFydExpc3RzOiBmYWxzZSxcbiAgc2lsZW50OiBmYWxzZSxcbiAgaGlnaGxpZ2h0OiBudWxsLFxuICBsYW5nUHJlZml4OiAnbGFuZy0nLFxuICBzbWFydHlwYW50czogZmFsc2UsXG4gIGhlYWRlclByZWZpeDogJycsXG4gIHJlbmRlcmVyOiBuZXcgUmVuZGVyZXIsXG4gIHhodG1sOiBmYWxzZVxufTtcblxuLyoqXG4gKiBFeHBvc2VcbiAqL1xuXG5tYXJrZWQuUGFyc2VyID0gUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IFBhcnNlci5wYXJzZTtcblxubWFya2VkLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5cbm1hcmtlZC5MZXhlciA9IExleGVyO1xubWFya2VkLmxleGVyID0gTGV4ZXIubGV4O1xuXG5tYXJrZWQuSW5saW5lTGV4ZXIgPSBJbmxpbmVMZXhlcjtcbm1hcmtlZC5pbmxpbmVMZXhlciA9IElubGluZUxleGVyLm91dHB1dDtcblxubWFya2VkLnBhcnNlID0gbWFya2VkO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gbWFya2VkO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbWFya2VkOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMubWFya2VkID0gbWFya2VkO1xufVxuXG59KS5jYWxsKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcyB8fCAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWwpO1xufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzLlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24gfHxcblx0d2luZG93Lm1velJUQ1Nlc3Npb25EZXNjcmlwdGlvbjtcbm1vZHVsZS5leHBvcnRzLlJUQ1BlZXJDb25uZWN0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8XG5cdHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb247XG5tb2R1bGUuZXhwb3J0cy5SVENJY2VDYW5kaWRhdGUgPSB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlIHx8XG5cdHdpbmRvdy5tb3pSVENJY2VDYW5kaWRhdGU7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcbnZhciBOZWdvdGlhdG9yID0gcmVxdWlyZSgnLi9uZWdvdGlhdG9yJyk7XG52YXIgUmVsaWFibGUgPSByZXF1aXJlKCdyZWxpYWJsZScpO1xuXG4vKipcbiAqIFdyYXBzIGEgRGF0YUNoYW5uZWwgYmV0d2VlbiB0d28gUGVlcnMuXG4gKi9cbmZ1bmN0aW9uIERhdGFDb25uZWN0aW9uKHBlZXIsIHByb3ZpZGVyLCBvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBEYXRhQ29ubmVjdGlvbikpIHJldHVybiBuZXcgRGF0YUNvbm5lY3Rpb24ocGVlciwgcHJvdmlkZXIsIG9wdGlvbnMpO1xuICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICB0aGlzLm9wdGlvbnMgPSB1dGlsLmV4dGVuZCh7XG4gICAgc2VyaWFsaXphdGlvbjogJ2JpbmFyeScsXG4gICAgcmVsaWFibGU6IGZhbHNlXG4gIH0sIG9wdGlvbnMpO1xuXG4gIC8vIENvbm5lY3Rpb24gaXMgbm90IG9wZW4geWV0LlxuICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgdGhpcy50eXBlID0gJ2RhdGEnO1xuICB0aGlzLnBlZXIgPSBwZWVyO1xuICB0aGlzLnByb3ZpZGVyID0gcHJvdmlkZXI7XG5cbiAgdGhpcy5pZCA9IHRoaXMub3B0aW9ucy5jb25uZWN0aW9uSWQgfHwgRGF0YUNvbm5lY3Rpb24uX2lkUHJlZml4ICsgdXRpbC5yYW5kb21Ub2tlbigpO1xuXG4gIHRoaXMubGFiZWwgPSB0aGlzLm9wdGlvbnMubGFiZWwgfHwgdGhpcy5pZDtcbiAgdGhpcy5tZXRhZGF0YSA9IHRoaXMub3B0aW9ucy5tZXRhZGF0YTtcbiAgdGhpcy5zZXJpYWxpemF0aW9uID0gdGhpcy5vcHRpb25zLnNlcmlhbGl6YXRpb247XG4gIHRoaXMucmVsaWFibGUgPSB0aGlzLm9wdGlvbnMucmVsaWFibGU7XG5cbiAgLy8gRGF0YSBjaGFubmVsIGJ1ZmZlcmluZy5cbiAgdGhpcy5fYnVmZmVyID0gW107XG4gIHRoaXMuX2J1ZmZlcmluZyA9IGZhbHNlO1xuICB0aGlzLmJ1ZmZlclNpemUgPSAwO1xuXG4gIC8vIEZvciBzdG9yaW5nIGxhcmdlIGRhdGEuXG4gIHRoaXMuX2NodW5rZWREYXRhID0ge307XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5fcGF5bG9hZCkge1xuICAgIHRoaXMuX3BlZXJCcm93c2VyID0gdGhpcy5vcHRpb25zLl9wYXlsb2FkLmJyb3dzZXI7XG4gIH1cblxuICBOZWdvdGlhdG9yLnN0YXJ0Q29ubmVjdGlvbihcbiAgICB0aGlzLFxuICAgIHRoaXMub3B0aW9ucy5fcGF5bG9hZCB8fCB7XG4gICAgICBvcmlnaW5hdG9yOiB0cnVlXG4gICAgfVxuICApO1xufVxuXG51dGlsLmluaGVyaXRzKERhdGFDb25uZWN0aW9uLCBFdmVudEVtaXR0ZXIpO1xuXG5EYXRhQ29ubmVjdGlvbi5faWRQcmVmaXggPSAnZGNfJztcblxuLyoqIENhbGxlZCBieSB0aGUgTmVnb3RpYXRvciB3aGVuIHRoZSBEYXRhQ2hhbm5lbCBpcyByZWFkeS4gKi9cbkRhdGFDb25uZWN0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oZGMpIHtcbiAgdGhpcy5fZGMgPSB0aGlzLmRhdGFDaGFubmVsID0gZGM7XG4gIHRoaXMuX2NvbmZpZ3VyZURhdGFDaGFubmVsKCk7XG59XG5cbkRhdGFDb25uZWN0aW9uLnByb3RvdHlwZS5fY29uZmlndXJlRGF0YUNoYW5uZWwgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZiAodXRpbC5zdXBwb3J0cy5zY3RwKSB7XG4gICAgdGhpcy5fZGMuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gIH1cbiAgdGhpcy5fZGMub25vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgdXRpbC5sb2coJ0RhdGEgY2hhbm5lbCBjb25uZWN0aW9uIHN1Y2Nlc3MnKTtcbiAgICBzZWxmLm9wZW4gPSB0cnVlO1xuICAgIHNlbGYuZW1pdCgnb3BlbicpO1xuICB9XG5cbiAgLy8gVXNlIHRoZSBSZWxpYWJsZSBzaGltIGZvciBub24gRmlyZWZveCBicm93c2Vyc1xuICBpZiAoIXV0aWwuc3VwcG9ydHMuc2N0cCAmJiB0aGlzLnJlbGlhYmxlKSB7XG4gICAgdGhpcy5fcmVsaWFibGUgPSBuZXcgUmVsaWFibGUodGhpcy5fZGMsIHV0aWwuZGVidWcpO1xuICB9XG5cbiAgaWYgKHRoaXMuX3JlbGlhYmxlKSB7XG4gICAgdGhpcy5fcmVsaWFibGUub25tZXNzYWdlID0gZnVuY3Rpb24obXNnKSB7XG4gICAgICBzZWxmLmVtaXQoJ2RhdGEnLCBtc2cpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGMub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICAgICAgc2VsZi5faGFuZGxlRGF0YU1lc3NhZ2UoZSk7XG4gICAgfTtcbiAgfVxuICB0aGlzLl9kYy5vbmNsb3NlID0gZnVuY3Rpb24oZSkge1xuICAgIHV0aWwubG9nKCdEYXRhQ2hhbm5lbCBjbG9zZWQgZm9yOicsIHNlbGYucGVlcik7XG4gICAgc2VsZi5jbG9zZSgpO1xuICB9O1xufVxuXG4vLyBIYW5kbGVzIGEgRGF0YUNoYW5uZWwgbWVzc2FnZS5cbkRhdGFDb25uZWN0aW9uLnByb3RvdHlwZS5faGFuZGxlRGF0YU1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGRhdGEgPSBlLmRhdGE7XG4gIHZhciBkYXRhdHlwZSA9IGRhdGEuY29uc3RydWN0b3I7XG4gIGlmICh0aGlzLnNlcmlhbGl6YXRpb24gPT09ICdiaW5hcnknIHx8IHRoaXMuc2VyaWFsaXphdGlvbiA9PT0gJ2JpbmFyeS11dGY4Jykge1xuICAgIGlmIChkYXRhdHlwZSA9PT0gQmxvYikge1xuICAgICAgLy8gRGF0YXR5cGUgc2hvdWxkIG5ldmVyIGJlIGJsb2JcbiAgICAgIHV0aWwuYmxvYlRvQXJyYXlCdWZmZXIoZGF0YSwgZnVuY3Rpb24oYWIpIHtcbiAgICAgICAgZGF0YSA9IHV0aWwudW5wYWNrKGFiKTtcbiAgICAgICAgc2VsZi5lbWl0KCdkYXRhJywgZGF0YSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGRhdGF0eXBlID09PSBBcnJheUJ1ZmZlcikge1xuICAgICAgZGF0YSA9IHV0aWwudW5wYWNrKGRhdGEpO1xuICAgIH0gZWxzZSBpZiAoZGF0YXR5cGUgPT09IFN0cmluZykge1xuICAgICAgLy8gU3RyaW5nIGZhbGxiYWNrIGZvciBiaW5hcnkgZGF0YSBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IGJpbmFyeSB5ZXRcbiAgICAgIHZhciBhYiA9IHV0aWwuYmluYXJ5U3RyaW5nVG9BcnJheUJ1ZmZlcihkYXRhKTtcbiAgICAgIGRhdGEgPSB1dGlsLnVucGFjayhhYik7XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMuc2VyaWFsaXphdGlvbiA9PT0gJ2pzb24nKSB7XG4gICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gIH1cblxuICAvLyBDaGVjayBpZiB3ZSd2ZSBjaHVua2VkLS1pZiBzbywgcGllY2UgdGhpbmdzIGJhY2sgdG9nZXRoZXIuXG4gIC8vIFdlJ3JlIGd1YXJhbnRlZWQgdGhhdCB0aGlzIGlzbid0IDAuXG4gIGlmIChkYXRhLl9fcGVlckRhdGEpIHtcbiAgICB2YXIgaWQgPSBkYXRhLl9fcGVlckRhdGE7XG4gICAgdmFyIGNodW5rSW5mbyA9IHRoaXMuX2NodW5rZWREYXRhW2lkXSB8fCB7ZGF0YTogW10sIGNvdW50OiAwLCB0b3RhbDogZGF0YS50b3RhbH07XG5cbiAgICBjaHVua0luZm8uZGF0YVtkYXRhLm5dID0gZGF0YS5kYXRhO1xuICAgIGNodW5rSW5mby5jb3VudCArPSAxO1xuXG4gICAgaWYgKGNodW5rSW5mby50b3RhbCA9PT0gY2h1bmtJbmZvLmNvdW50KSB7XG4gICAgICAvLyBDbGVhbiB1cCBiZWZvcmUgbWFraW5nIHRoZSByZWN1cnNpdmUgY2FsbCB0byBgX2hhbmRsZURhdGFNZXNzYWdlYC5cbiAgICAgIGRlbGV0ZSB0aGlzLl9jaHVua2VkRGF0YVtpZF07XG5cbiAgICAgIC8vIFdlJ3ZlIHJlY2VpdmVkIGFsbCB0aGUgY2h1bmtzLS10aW1lIHRvIGNvbnN0cnVjdCB0aGUgY29tcGxldGUgZGF0YS5cbiAgICAgIGRhdGEgPSBuZXcgQmxvYihjaHVua0luZm8uZGF0YSk7XG4gICAgICB0aGlzLl9oYW5kbGVEYXRhTWVzc2FnZSh7ZGF0YTogZGF0YX0pO1xuICAgIH1cblxuICAgIHRoaXMuX2NodW5rZWREYXRhW2lkXSA9IGNodW5rSW5mbztcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmVtaXQoJ2RhdGEnLCBkYXRhKTtcbn1cblxuLyoqXG4gKiBFeHBvc2VkIGZ1bmN0aW9uYWxpdHkgZm9yIHVzZXJzLlxuICovXG5cbi8qKiBBbGxvd3MgdXNlciB0byBjbG9zZSBjb25uZWN0aW9uLiAqL1xuRGF0YUNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5vcGVuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMub3BlbiA9IGZhbHNlO1xuICBOZWdvdGlhdG9yLmNsZWFudXAodGhpcyk7XG4gIHRoaXMuZW1pdCgnY2xvc2UnKTtcbn1cblxuLyoqIEFsbG93cyB1c2VyIHRvIHNlbmQgZGF0YS4gKi9cbkRhdGFDb25uZWN0aW9uLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSwgY2h1bmtlZCkge1xuICBpZiAoIXRoaXMub3Blbikge1xuICAgIHRoaXMuZW1pdCgnZXJyb3InLCBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gaXMgbm90IG9wZW4uIFlvdSBzaG91bGQgbGlzdGVuIGZvciB0aGUgYG9wZW5gIGV2ZW50IGJlZm9yZSBzZW5kaW5nIG1lc3NhZ2VzLicpKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHRoaXMuX3JlbGlhYmxlKSB7XG4gICAgLy8gTm90ZTogcmVsaWFibGUgc2hpbSBzZW5kaW5nIHdpbGwgbWFrZSBpdCBzbyB0aGF0IHlvdSBjYW5ub3QgY3VzdG9taXplXG4gICAgLy8gc2VyaWFsaXphdGlvbi5cbiAgICB0aGlzLl9yZWxpYWJsZS5zZW5kKGRhdGEpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICh0aGlzLnNlcmlhbGl6YXRpb24gPT09ICdqc29uJykge1xuICAgIHRoaXMuX2J1ZmZlcmVkU2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gIH0gZWxzZSBpZiAodGhpcy5zZXJpYWxpemF0aW9uID09PSAnYmluYXJ5JyB8fCB0aGlzLnNlcmlhbGl6YXRpb24gPT09ICdiaW5hcnktdXRmOCcpIHtcbiAgICB2YXIgYmxvYiA9IHV0aWwucGFjayhkYXRhKTtcblxuICAgIC8vIEZvciBDaHJvbWUtRmlyZWZveCBpbnRlcm9wZXJhYmlsaXR5LCB3ZSBuZWVkIHRvIG1ha2UgRmlyZWZveCBcImNodW5rXCJcbiAgICAvLyB0aGUgZGF0YSBpdCBzZW5kcyBvdXQuXG4gICAgdmFyIG5lZWRzQ2h1bmtpbmcgPSB1dGlsLmNodW5rZWRCcm93c2Vyc1t0aGlzLl9wZWVyQnJvd3Nlcl0gfHwgdXRpbC5jaHVua2VkQnJvd3NlcnNbdXRpbC5icm93c2VyXTtcbiAgICBpZiAobmVlZHNDaHVua2luZyAmJiAhY2h1bmtlZCAmJiBibG9iLnNpemUgPiB1dGlsLmNodW5rZWRNVFUpIHtcbiAgICAgIHRoaXMuX3NlbmRDaHVua3MoYmxvYik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGF0YUNoYW5uZWwgY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgc3RyaW5ncy5cbiAgICBpZiAoIXV0aWwuc3VwcG9ydHMuc2N0cCkge1xuICAgICAgdXRpbC5ibG9iVG9CaW5hcnlTdHJpbmcoYmxvYiwgZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHNlbGYuX2J1ZmZlcmVkU2VuZChzdHIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghdXRpbC5zdXBwb3J0cy5iaW5hcnlCbG9iKSB7XG4gICAgICAvLyBXZSBvbmx5IGRvIHRoaXMgaWYgd2UgcmVhbGx5IG5lZWQgdG8gKGUuZy4gYmxvYnMgYXJlIG5vdCBzdXBwb3J0ZWQpLFxuICAgICAgLy8gYmVjYXVzZSB0aGlzIGNvbnZlcnNpb24gaXMgY29zdGx5LlxuICAgICAgdXRpbC5ibG9iVG9BcnJheUJ1ZmZlcihibG9iLCBmdW5jdGlvbihhYikge1xuICAgICAgICBzZWxmLl9idWZmZXJlZFNlbmQoYWIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2J1ZmZlcmVkU2VuZChibG9iKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fYnVmZmVyZWRTZW5kKGRhdGEpO1xuICB9XG59XG5cbkRhdGFDb25uZWN0aW9uLnByb3RvdHlwZS5fYnVmZmVyZWRTZW5kID0gZnVuY3Rpb24obXNnKSB7XG4gIGlmICh0aGlzLl9idWZmZXJpbmcgfHwgIXRoaXMuX3RyeVNlbmQobXNnKSkge1xuICAgIHRoaXMuX2J1ZmZlci5wdXNoKG1zZyk7XG4gICAgdGhpcy5idWZmZXJTaXplID0gdGhpcy5fYnVmZmVyLmxlbmd0aDtcbiAgfVxufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIHNlbmQgc3VjY2VlZHMuXG5EYXRhQ29ubmVjdGlvbi5wcm90b3R5cGUuX3RyeVNlbmQgPSBmdW5jdGlvbihtc2cpIHtcbiAgdHJ5IHtcbiAgICB0aGlzLl9kYy5zZW5kKG1zZyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aGlzLl9idWZmZXJpbmcgPSB0cnVlO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAvLyBUcnkgYWdhaW4uXG4gICAgICBzZWxmLl9idWZmZXJpbmcgPSBmYWxzZTtcbiAgICAgIHNlbGYuX3RyeUJ1ZmZlcigpO1xuICAgIH0sIDEwMCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBUcnkgdG8gc2VuZCB0aGUgZmlyc3QgbWVzc2FnZSBpbiB0aGUgYnVmZmVyLlxuRGF0YUNvbm5lY3Rpb24ucHJvdG90eXBlLl90cnlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuX2J1ZmZlci5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbXNnID0gdGhpcy5fYnVmZmVyWzBdO1xuXG4gIGlmICh0aGlzLl90cnlTZW5kKG1zZykpIHtcbiAgICB0aGlzLl9idWZmZXIuc2hpZnQoKTtcbiAgICB0aGlzLmJ1ZmZlclNpemUgPSB0aGlzLl9idWZmZXIubGVuZ3RoO1xuICAgIHRoaXMuX3RyeUJ1ZmZlcigpO1xuICB9XG59XG5cbkRhdGFDb25uZWN0aW9uLnByb3RvdHlwZS5fc2VuZENodW5rcyA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgdmFyIGJsb2JzID0gdXRpbC5jaHVuayhibG9iKTtcbiAgZm9yICh2YXIgaSA9IDAsIGlpID0gYmxvYnMubGVuZ3RoOyBpIDwgaWk7IGkgKz0gMSkge1xuICAgIHZhciBibG9iID0gYmxvYnNbaV07XG4gICAgdGhpcy5zZW5kKGJsb2IsIHRydWUpO1xuICB9XG59XG5cbkRhdGFDb25uZWN0aW9uLnByb3RvdHlwZS5oYW5kbGVNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgcGF5bG9hZCA9IG1lc3NhZ2UucGF5bG9hZDtcblxuICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgIGNhc2UgJ0FOU1dFUic6XG4gICAgICB0aGlzLl9wZWVyQnJvd3NlciA9IHBheWxvYWQuYnJvd3NlcjtcblxuICAgICAgLy8gRm9yd2FyZCB0byBuZWdvdGlhdG9yXG4gICAgICBOZWdvdGlhdG9yLmhhbmRsZVNEUChtZXNzYWdlLnR5cGUsIHRoaXMsIHBheWxvYWQuc2RwKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0NBTkRJREFURSc6XG4gICAgICBOZWdvdGlhdG9yLmhhbmRsZUNhbmRpZGF0ZSh0aGlzLCBwYXlsb2FkLmNhbmRpZGF0ZSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdXRpbC53YXJuKCdVbnJlY29nbml6ZWQgbWVzc2FnZSB0eXBlOicsIG1lc3NhZ2UudHlwZSwgJ2Zyb20gcGVlcjonLCB0aGlzLnBlZXIpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhQ29ubmVjdGlvbjtcbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpO1xudmFyIE5lZ290aWF0b3IgPSByZXF1aXJlKCcuL25lZ290aWF0b3InKTtcblxuLyoqXG4gKiBXcmFwcyB0aGUgc3RyZWFtaW5nIGludGVyZmFjZSBiZXR3ZWVuIHR3byBQZWVycy5cbiAqL1xuZnVuY3Rpb24gTWVkaWFDb25uZWN0aW9uKHBlZXIsIHByb3ZpZGVyLCBvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBNZWRpYUNvbm5lY3Rpb24pKSByZXR1cm4gbmV3IE1lZGlhQ29ubmVjdGlvbihwZWVyLCBwcm92aWRlciwgb3B0aW9ucyk7XG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gIHRoaXMub3B0aW9ucyA9IHV0aWwuZXh0ZW5kKHt9LCBvcHRpb25zKTtcblxuICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgdGhpcy50eXBlID0gJ21lZGlhJztcbiAgdGhpcy5wZWVyID0gcGVlcjtcbiAgdGhpcy5wcm92aWRlciA9IHByb3ZpZGVyO1xuICB0aGlzLm1ldGFkYXRhID0gdGhpcy5vcHRpb25zLm1ldGFkYXRhO1xuICB0aGlzLmxvY2FsU3RyZWFtID0gdGhpcy5vcHRpb25zLl9zdHJlYW07XG5cbiAgdGhpcy5pZCA9IHRoaXMub3B0aW9ucy5jb25uZWN0aW9uSWQgfHwgTWVkaWFDb25uZWN0aW9uLl9pZFByZWZpeCArIHV0aWwucmFuZG9tVG9rZW4oKTtcbiAgaWYgKHRoaXMubG9jYWxTdHJlYW0pIHtcbiAgICBOZWdvdGlhdG9yLnN0YXJ0Q29ubmVjdGlvbihcbiAgICAgIHRoaXMsXG4gICAgICB7X3N0cmVhbTogdGhpcy5sb2NhbFN0cmVhbSwgb3JpZ2luYXRvcjogdHJ1ZX1cbiAgICApO1xuICB9XG59O1xuXG51dGlsLmluaGVyaXRzKE1lZGlhQ29ubmVjdGlvbiwgRXZlbnRFbWl0dGVyKTtcblxuTWVkaWFDb25uZWN0aW9uLl9pZFByZWZpeCA9ICdtY18nO1xuXG5NZWRpYUNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHJlbW90ZVN0cmVhbSkge1xuICB1dGlsLmxvZygnUmVjZWl2aW5nIHN0cmVhbScsIHJlbW90ZVN0cmVhbSk7XG5cbiAgdGhpcy5yZW1vdGVTdHJlYW0gPSByZW1vdGVTdHJlYW07XG4gIHRoaXMuZW1pdCgnc3RyZWFtJywgcmVtb3RlU3RyZWFtKTsgLy8gU2hvdWxkIHdlIGNhbGwgdGhpcyBgb3BlbmA/XG5cbn07XG5cbk1lZGlhQ29ubmVjdGlvbi5wcm90b3R5cGUuaGFuZGxlTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHBheWxvYWQgPSBtZXNzYWdlLnBheWxvYWQ7XG5cbiAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcbiAgICBjYXNlICdBTlNXRVInOlxuICAgICAgLy8gRm9yd2FyZCB0byBuZWdvdGlhdG9yXG4gICAgICBOZWdvdGlhdG9yLmhhbmRsZVNEUChtZXNzYWdlLnR5cGUsIHRoaXMsIHBheWxvYWQuc2RwKTtcbiAgICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdDQU5ESURBVEUnOlxuICAgICAgTmVnb3RpYXRvci5oYW5kbGVDYW5kaWRhdGUodGhpcywgcGF5bG9hZC5jYW5kaWRhdGUpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHV0aWwud2FybignVW5yZWNvZ25pemVkIG1lc3NhZ2UgdHlwZTonLCBtZXNzYWdlLnR5cGUsICdmcm9tIHBlZXI6JywgdGhpcy5wZWVyKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbk1lZGlhQ29ubmVjdGlvbi5wcm90b3R5cGUuYW5zd2VyID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gIGlmICh0aGlzLmxvY2FsU3RyZWFtKSB7XG4gICAgdXRpbC53YXJuKCdMb2NhbCBzdHJlYW0gYWxyZWFkeSBleGlzdHMgb24gdGhpcyBNZWRpYUNvbm5lY3Rpb24uIEFyZSB5b3UgYW5zd2VyaW5nIGEgY2FsbCB0d2ljZT8nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLm9wdGlvbnMuX3BheWxvYWQuX3N0cmVhbSA9IHN0cmVhbTtcblxuICB0aGlzLmxvY2FsU3RyZWFtID0gc3RyZWFtO1xuICBOZWdvdGlhdG9yLnN0YXJ0Q29ubmVjdGlvbihcbiAgICB0aGlzLFxuICAgIHRoaXMub3B0aW9ucy5fcGF5bG9hZFxuICApXG4gIC8vIFJldHJpZXZlIGxvc3QgbWVzc2FnZXMgc3RvcmVkIGJlY2F1c2UgUGVlckNvbm5lY3Rpb24gbm90IHNldCB1cC5cbiAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm92aWRlci5fZ2V0TWVzc2FnZXModGhpcy5pZCk7XG4gIGZvciAodmFyIGkgPSAwLCBpaSA9IG1lc3NhZ2VzLmxlbmd0aDsgaSA8IGlpOyBpICs9IDEpIHtcbiAgICB0aGlzLmhhbmRsZU1lc3NhZ2UobWVzc2FnZXNbaV0pO1xuICB9XG4gIHRoaXMub3BlbiA9IHRydWU7XG59O1xuXG4vKipcbiAqIEV4cG9zZWQgZnVuY3Rpb25hbGl0eSBmb3IgdXNlcnMuXG4gKi9cblxuLyoqIEFsbG93cyB1c2VyIHRvIGNsb3NlIGNvbm5lY3Rpb24uICovXG5NZWRpYUNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5vcGVuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMub3BlbiA9IGZhbHNlO1xuICBOZWdvdGlhdG9yLmNsZWFudXAodGhpcyk7XG4gIHRoaXMuZW1pdCgnY2xvc2UnKVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZWRpYUNvbm5lY3Rpb247XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIFJUQ1BlZXJDb25uZWN0aW9uID0gcmVxdWlyZSgnLi9hZGFwdGVyJykuUlRDUGVlckNvbm5lY3Rpb247XG52YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gcmVxdWlyZSgnLi9hZGFwdGVyJykuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uO1xudmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IHJlcXVpcmUoJy4vYWRhcHRlcicpLlJUQ0ljZUNhbmRpZGF0ZTtcblxuLyoqXG4gKiBNYW5hZ2VzIGFsbCBuZWdvdGlhdGlvbnMgYmV0d2VlbiBQZWVycy5cbiAqL1xudmFyIE5lZ290aWF0b3IgPSB7XG4gIHBjczoge1xuICAgIGRhdGE6IHt9LFxuICAgIG1lZGlhOiB7fVxuICB9LCAvLyB0eXBlID0+IHtwZWVySWQ6IHtwY19pZDogcGN9fS5cbiAgLy9wcm92aWRlcnM6IHt9LCAvLyBwcm92aWRlcidzIGlkID0+IHByb3ZpZGVycyAodGhlcmUgbWF5IGJlIG11bHRpcGxlIHByb3ZpZGVycy9jbGllbnQuXG4gIHF1ZXVlOiBbXSAvLyBjb25uZWN0aW9ucyB0aGF0IGFyZSBkZWxheWVkIGR1ZSB0byBhIFBDIGJlaW5nIGluIHVzZS5cbn1cblxuTmVnb3RpYXRvci5faWRQcmVmaXggPSAncGNfJztcblxuLyoqIFJldHVybnMgYSBQZWVyQ29ubmVjdGlvbiBvYmplY3Qgc2V0IHVwIGNvcnJlY3RseSAoZm9yIGRhdGEsIG1lZGlhKS4gKi9cbk5lZ290aWF0b3Iuc3RhcnRDb25uZWN0aW9uID0gZnVuY3Rpb24oY29ubmVjdGlvbiwgb3B0aW9ucykge1xuICB2YXIgcGMgPSBOZWdvdGlhdG9yLl9nZXRQZWVyQ29ubmVjdGlvbihjb25uZWN0aW9uLCBvcHRpb25zKTtcblxuICBpZiAoY29ubmVjdGlvbi50eXBlID09PSAnbWVkaWEnICYmIG9wdGlvbnMuX3N0cmVhbSkge1xuICAgIC8vIEFkZCB0aGUgc3RyZWFtLlxuICAgIHBjLmFkZFN0cmVhbShvcHRpb25zLl9zdHJlYW0pO1xuICB9XG5cbiAgLy8gU2V0IHRoZSBjb25uZWN0aW9uJ3MgUEMuXG4gIGNvbm5lY3Rpb24ucGMgPSBjb25uZWN0aW9uLnBlZXJDb25uZWN0aW9uID0gcGM7XG4gIC8vIFdoYXQgZG8gd2UgbmVlZCB0byBkbyBub3c/XG4gIGlmIChvcHRpb25zLm9yaWdpbmF0b3IpIHtcbiAgICBpZiAoY29ubmVjdGlvbi50eXBlID09PSAnZGF0YScpIHtcbiAgICAgIC8vIENyZWF0ZSB0aGUgZGF0YWNoYW5uZWwuXG4gICAgICB2YXIgY29uZmlnID0ge307XG4gICAgICAvLyBEcm9wcGluZyByZWxpYWJsZTpmYWxzZSBzdXBwb3J0LCBzaW5jZSBpdCBzZWVtcyB0byBiZSBjcmFzaGluZ1xuICAgICAgLy8gQ2hyb21lLlxuICAgICAgLyppZiAodXRpbC5zdXBwb3J0cy5zY3RwICYmICFvcHRpb25zLnJlbGlhYmxlKSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgY2Fub25pY2FsIHJlbGlhYmxlIHN1cHBvcnQuLi5cbiAgICAgICAgY29uZmlnID0ge21heFJldHJhbnNtaXRzOiAwfTtcbiAgICAgIH0qL1xuICAgICAgLy8gRmFsbGJhY2sgdG8gZW5zdXJlIG9sZGVyIGJyb3dzZXJzIGRvbid0IGNyYXNoLlxuICAgICAgaWYgKCF1dGlsLnN1cHBvcnRzLnNjdHApIHtcbiAgICAgICAgY29uZmlnID0ge3JlbGlhYmxlOiBvcHRpb25zLnJlbGlhYmxlfTtcbiAgICAgIH1cbiAgICAgIHZhciBkYyA9IHBjLmNyZWF0ZURhdGFDaGFubmVsKGNvbm5lY3Rpb24ubGFiZWwsIGNvbmZpZyk7XG4gICAgICBjb25uZWN0aW9uLmluaXRpYWxpemUoZGMpO1xuICAgIH1cblxuICAgIGlmICghdXRpbC5zdXBwb3J0cy5vbm5lZ290aWF0aW9ubmVlZGVkKSB7XG4gICAgICBOZWdvdGlhdG9yLl9tYWtlT2ZmZXIoY29ubmVjdGlvbik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIE5lZ290aWF0b3IuaGFuZGxlU0RQKCdPRkZFUicsIGNvbm5lY3Rpb24sIG9wdGlvbnMuc2RwKTtcbiAgfVxufVxuXG5OZWdvdGlhdG9yLl9nZXRQZWVyQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKGNvbm5lY3Rpb24sIG9wdGlvbnMpIHtcbiAgaWYgKCFOZWdvdGlhdG9yLnBjc1tjb25uZWN0aW9uLnR5cGVdKSB7XG4gICAgdXRpbC5lcnJvcihjb25uZWN0aW9uLnR5cGUgKyAnIGlzIG5vdCBhIHZhbGlkIGNvbm5lY3Rpb24gdHlwZS4gTWF5YmUgeW91IG92ZXJyb2RlIHRoZSBgdHlwZWAgcHJvcGVydHkgc29tZXdoZXJlLicpO1xuICB9XG5cbiAgaWYgKCFOZWdvdGlhdG9yLnBjc1tjb25uZWN0aW9uLnR5cGVdW2Nvbm5lY3Rpb24ucGVlcl0pIHtcbiAgICBOZWdvdGlhdG9yLnBjc1tjb25uZWN0aW9uLnR5cGVdW2Nvbm5lY3Rpb24ucGVlcl0gPSB7fTtcbiAgfVxuICB2YXIgcGVlckNvbm5lY3Rpb25zID0gTmVnb3RpYXRvci5wY3NbY29ubmVjdGlvbi50eXBlXVtjb25uZWN0aW9uLnBlZXJdO1xuXG4gIHZhciBwYztcbiAgLy8gTm90IG11bHRpcGxleGluZyB3aGlsZSBGRiBhbmQgQ2hyb21lIGhhdmUgbm90LWdyZWF0IHN1cHBvcnQgZm9yIGl0LlxuICAvKmlmIChvcHRpb25zLm11bHRpcGxleCkge1xuICAgIGlkcyA9IE9iamVjdC5rZXlzKHBlZXJDb25uZWN0aW9ucyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGlpID0gaWRzLmxlbmd0aDsgaSA8IGlpOyBpICs9IDEpIHtcbiAgICAgIHBjID0gcGVlckNvbm5lY3Rpb25zW2lkc1tpXV07XG4gICAgICBpZiAocGMuc2lnbmFsaW5nU3RhdGUgPT09ICdzdGFibGUnKSB7XG4gICAgICAgIGJyZWFrOyAvLyBXZSBjYW4gZ28gYWhlYWQgYW5kIHVzZSB0aGlzIFBDLlxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlICovXG4gIGlmIChvcHRpb25zLnBjKSB7IC8vIFNpbXBsZXN0IGNhc2U6IFBDIGlkIGFscmVhZHkgcHJvdmlkZWQgZm9yIHVzLlxuICAgIHBjID0gTmVnb3RpYXRvci5wY3NbY29ubmVjdGlvbi50eXBlXVtjb25uZWN0aW9uLnBlZXJdW29wdGlvbnMucGNdO1xuICB9XG5cbiAgaWYgKCFwYyB8fCBwYy5zaWduYWxpbmdTdGF0ZSAhPT0gJ3N0YWJsZScpIHtcbiAgICBwYyA9IE5lZ290aWF0b3IuX3N0YXJ0UGVlckNvbm5lY3Rpb24oY29ubmVjdGlvbik7XG4gIH1cbiAgcmV0dXJuIHBjO1xufVxuXG4vKlxuTmVnb3RpYXRvci5fYWRkUHJvdmlkZXIgPSBmdW5jdGlvbihwcm92aWRlcikge1xuICBpZiAoKCFwcm92aWRlci5pZCAmJiAhcHJvdmlkZXIuZGlzY29ubmVjdGVkKSB8fCAhcHJvdmlkZXIuc29ja2V0Lm9wZW4pIHtcbiAgICAvLyBXYWl0IGZvciBwcm92aWRlciB0byBvYnRhaW4gYW4gSUQuXG4gICAgcHJvdmlkZXIub24oJ29wZW4nLCBmdW5jdGlvbihpZCkge1xuICAgICAgTmVnb3RpYXRvci5fYWRkUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIE5lZ290aWF0b3IucHJvdmlkZXJzW3Byb3ZpZGVyLmlkXSA9IHByb3ZpZGVyO1xuICB9XG59Ki9cblxuXG4vKiogU3RhcnQgYSBQQy4gKi9cbk5lZ290aWF0b3IuX3N0YXJ0UGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihjb25uZWN0aW9uKSB7XG4gIHV0aWwubG9nKCdDcmVhdGluZyBSVENQZWVyQ29ubmVjdGlvbi4nKTtcblxuICB2YXIgaWQgPSBOZWdvdGlhdG9yLl9pZFByZWZpeCArIHV0aWwucmFuZG9tVG9rZW4oKTtcbiAgdmFyIG9wdGlvbmFsID0ge307XG5cbiAgaWYgKGNvbm5lY3Rpb24udHlwZSA9PT0gJ2RhdGEnICYmICF1dGlsLnN1cHBvcnRzLnNjdHApIHtcbiAgICBvcHRpb25hbCA9IHtvcHRpb25hbDogW3tSdHBEYXRhQ2hhbm5lbHM6IHRydWV9XX07XG4gIH0gZWxzZSBpZiAoY29ubmVjdGlvbi50eXBlID09PSAnbWVkaWEnKSB7XG4gICAgLy8gSW50ZXJvcCByZXEgZm9yIGNocm9tZS5cbiAgICBvcHRpb25hbCA9IHtvcHRpb25hbDogW3tEdGxzU3J0cEtleUFncmVlbWVudDogdHJ1ZX1dfTtcbiAgfVxuXG4gIHZhciBwYyA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihjb25uZWN0aW9uLnByb3ZpZGVyLm9wdGlvbnMuY29uZmlnLCBvcHRpb25hbCk7XG4gIE5lZ290aWF0b3IucGNzW2Nvbm5lY3Rpb24udHlwZV1bY29ubmVjdGlvbi5wZWVyXVtpZF0gPSBwYztcblxuICBOZWdvdGlhdG9yLl9zZXR1cExpc3RlbmVycyhjb25uZWN0aW9uLCBwYywgaWQpO1xuXG4gIHJldHVybiBwYztcbn1cblxuLyoqIFNldCB1cCB2YXJpb3VzIFdlYlJUQyBsaXN0ZW5lcnMuICovXG5OZWdvdGlhdG9yLl9zZXR1cExpc3RlbmVycyA9IGZ1bmN0aW9uKGNvbm5lY3Rpb24sIHBjLCBwY19pZCkge1xuICB2YXIgcGVlcklkID0gY29ubmVjdGlvbi5wZWVyO1xuICB2YXIgY29ubmVjdGlvbklkID0gY29ubmVjdGlvbi5pZDtcbiAgdmFyIHByb3ZpZGVyID0gY29ubmVjdGlvbi5wcm92aWRlcjtcblxuICAvLyBJQ0UgQ0FORElEQVRFUy5cbiAgdXRpbC5sb2coJ0xpc3RlbmluZyBmb3IgSUNFIGNhbmRpZGF0ZXMuJyk7XG4gIHBjLm9uaWNlY2FuZGlkYXRlID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgaWYgKGV2dC5jYW5kaWRhdGUpIHtcbiAgICAgIHV0aWwubG9nKCdSZWNlaXZlZCBJQ0UgY2FuZGlkYXRlcyBmb3I6JywgY29ubmVjdGlvbi5wZWVyKTtcbiAgICAgIHByb3ZpZGVyLnNvY2tldC5zZW5kKHtcbiAgICAgICAgdHlwZTogJ0NBTkRJREFURScsXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGUsXG4gICAgICAgICAgdHlwZTogY29ubmVjdGlvbi50eXBlLFxuICAgICAgICAgIGNvbm5lY3Rpb25JZDogY29ubmVjdGlvbi5pZFxuICAgICAgICB9LFxuICAgICAgICBkc3Q6IHBlZXJJZFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIHBjLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoIChwYy5pY2VDb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgIGNhc2UgJ2Rpc2Nvbm5lY3RlZCc6XG4gICAgICBjYXNlICdmYWlsZWQnOlxuICAgICAgICB1dGlsLmxvZygnaWNlQ29ubmVjdGlvblN0YXRlIGlzIGRpc2Nvbm5lY3RlZCwgY2xvc2luZyBjb25uZWN0aW9ucyB0byAnICsgcGVlcklkKTtcbiAgICAgICAgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbXBsZXRlZCc6XG4gICAgICAgIHBjLm9uaWNlY2FuZGlkYXRlID0gdXRpbC5ub29wO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH07XG5cbiAgLy8gRmFsbGJhY2sgZm9yIG9sZGVyIENocm9tZSBpbXBscy5cbiAgcGMub25pY2VjaGFuZ2UgPSBwYy5vbmljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZTtcblxuICAvLyBPTk5FR09USUFUSU9OTkVFREVEIChDaHJvbWUpXG4gIHV0aWwubG9nKCdMaXN0ZW5pbmcgZm9yIGBuZWdvdGlhdGlvbm5lZWRlZGAnKTtcbiAgcGMub25uZWdvdGlhdGlvbm5lZWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHV0aWwubG9nKCdgbmVnb3RpYXRpb25uZWVkZWRgIHRyaWdnZXJlZCcpO1xuICAgIGlmIChwYy5zaWduYWxpbmdTdGF0ZSA9PSAnc3RhYmxlJykge1xuICAgICAgTmVnb3RpYXRvci5fbWFrZU9mZmVyKGNvbm5lY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB1dGlsLmxvZygnb25uZWdvdGlhdGlvbm5lZWRlZCB0cmlnZ2VyZWQgd2hlbiBub3Qgc3RhYmxlLiBJcyBhbm90aGVyIGNvbm5lY3Rpb24gYmVpbmcgZXN0YWJsaXNoZWQ/Jyk7XG4gICAgfVxuICB9O1xuXG4gIC8vIERBVEFDT05ORUNUSU9OLlxuICB1dGlsLmxvZygnTGlzdGVuaW5nIGZvciBkYXRhIGNoYW5uZWwnKTtcbiAgLy8gRmlyZWQgYmV0d2VlbiBvZmZlciBhbmQgYW5zd2VyLCBzbyBvcHRpb25zIHNob3VsZCBhbHJlYWR5IGJlIHNhdmVkXG4gIC8vIGluIHRoZSBvcHRpb25zIGhhc2guXG4gIHBjLm9uZGF0YWNoYW5uZWwgPSBmdW5jdGlvbihldnQpIHtcbiAgICB1dGlsLmxvZygnUmVjZWl2ZWQgZGF0YSBjaGFubmVsJyk7XG4gICAgdmFyIGRjID0gZXZ0LmNoYW5uZWw7XG4gICAgdmFyIGNvbm5lY3Rpb24gPSBwcm92aWRlci5nZXRDb25uZWN0aW9uKHBlZXJJZCwgY29ubmVjdGlvbklkKTtcbiAgICBjb25uZWN0aW9uLmluaXRpYWxpemUoZGMpO1xuICB9O1xuXG4gIC8vIE1FRElBQ09OTkVDVElPTi5cbiAgdXRpbC5sb2coJ0xpc3RlbmluZyBmb3IgcmVtb3RlIHN0cmVhbScpO1xuICBwYy5vbmFkZHN0cmVhbSA9IGZ1bmN0aW9uKGV2dCkge1xuICAgIHV0aWwubG9nKCdSZWNlaXZlZCByZW1vdGUgc3RyZWFtJyk7XG4gICAgdmFyIHN0cmVhbSA9IGV2dC5zdHJlYW07XG4gICAgdmFyIGNvbm5lY3Rpb24gPSBwcm92aWRlci5nZXRDb25uZWN0aW9uKHBlZXJJZCwgY29ubmVjdGlvbklkKTtcbiAgICAvLyAxMC8xMC8yMDE0OiBsb29rcyBsaWtlIGluIENocm9tZSAzOCwgb25hZGRzdHJlYW0gaXMgdHJpZ2dlcmVkIGFmdGVyXG4gICAgLy8gc2V0dGluZyB0aGUgcmVtb3RlIGRlc2NyaXB0aW9uLiBPdXIgY29ubmVjdGlvbiBvYmplY3QgaW4gdGhlc2UgY2FzZXNcbiAgICAvLyBpcyBhY3R1YWxseSBhIERBVEEgY29ubmVjdGlvbiwgc28gYWRkU3RyZWFtIGZhaWxzLlxuICAgIC8vIFRPRE86IFRoaXMgaXMgaG9wZWZ1bGx5IGp1c3QgYSB0ZW1wb3JhcnkgZml4LiBXZSBzaG91bGQgdHJ5IHRvXG4gICAgLy8gdW5kZXJzdGFuZCB3aHkgdGhpcyBpcyBoYXBwZW5pbmcuXG4gICAgaWYgKGNvbm5lY3Rpb24udHlwZSA9PT0gJ21lZGlhJykge1xuICAgICAgY29ubmVjdGlvbi5hZGRTdHJlYW0oc3RyZWFtKTtcbiAgICB9XG4gIH07XG59XG5cbk5lZ290aWF0b3IuY2xlYW51cCA9IGZ1bmN0aW9uKGNvbm5lY3Rpb24pIHtcbiAgdXRpbC5sb2coJ0NsZWFuaW5nIHVwIFBlZXJDb25uZWN0aW9uIHRvICcgKyBjb25uZWN0aW9uLnBlZXIpO1xuXG4gIHZhciBwYyA9IGNvbm5lY3Rpb24ucGM7XG5cbiAgaWYgKCEhcGMgJiYgKHBjLnJlYWR5U3RhdGUgIT09ICdjbG9zZWQnIHx8IHBjLnNpZ25hbGluZ1N0YXRlICE9PSAnY2xvc2VkJykpIHtcbiAgICBwYy5jbG9zZSgpO1xuICAgIGNvbm5lY3Rpb24ucGMgPSBudWxsO1xuICB9XG59XG5cbk5lZ290aWF0b3IuX21ha2VPZmZlciA9IGZ1bmN0aW9uKGNvbm5lY3Rpb24pIHtcbiAgdmFyIHBjID0gY29ubmVjdGlvbi5wYztcbiAgcGMuY3JlYXRlT2ZmZXIoZnVuY3Rpb24ob2ZmZXIpIHtcbiAgICB1dGlsLmxvZygnQ3JlYXRlZCBvZmZlci4nKTtcblxuICAgIGlmICghdXRpbC5zdXBwb3J0cy5zY3RwICYmIGNvbm5lY3Rpb24udHlwZSA9PT0gJ2RhdGEnICYmIGNvbm5lY3Rpb24ucmVsaWFibGUpIHtcbiAgICAgIG9mZmVyLnNkcCA9IFJlbGlhYmxlLmhpZ2hlckJhbmR3aWR0aFNEUChvZmZlci5zZHApO1xuICAgIH1cblxuICAgIHBjLnNldExvY2FsRGVzY3JpcHRpb24ob2ZmZXIsIGZ1bmN0aW9uKCkge1xuICAgICAgdXRpbC5sb2coJ1NldCBsb2NhbERlc2NyaXB0aW9uOiBvZmZlcicsICdmb3I6JywgY29ubmVjdGlvbi5wZWVyKTtcbiAgICAgIGNvbm5lY3Rpb24ucHJvdmlkZXIuc29ja2V0LnNlbmQoe1xuICAgICAgICB0eXBlOiAnT0ZGRVInLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgc2RwOiBvZmZlcixcbiAgICAgICAgICB0eXBlOiBjb25uZWN0aW9uLnR5cGUsXG4gICAgICAgICAgbGFiZWw6IGNvbm5lY3Rpb24ubGFiZWwsXG4gICAgICAgICAgY29ubmVjdGlvbklkOiBjb25uZWN0aW9uLmlkLFxuICAgICAgICAgIHJlbGlhYmxlOiBjb25uZWN0aW9uLnJlbGlhYmxlLFxuICAgICAgICAgIHNlcmlhbGl6YXRpb246IGNvbm5lY3Rpb24uc2VyaWFsaXphdGlvbixcbiAgICAgICAgICBtZXRhZGF0YTogY29ubmVjdGlvbi5tZXRhZGF0YSxcbiAgICAgICAgICBicm93c2VyOiB1dGlsLmJyb3dzZXJcbiAgICAgICAgfSxcbiAgICAgICAgZHN0OiBjb25uZWN0aW9uLnBlZXJcbiAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgY29ubmVjdGlvbi5wcm92aWRlci5lbWl0RXJyb3IoJ3dlYnJ0YycsIGVycik7XG4gICAgICB1dGlsLmxvZygnRmFpbGVkIHRvIHNldExvY2FsRGVzY3JpcHRpb24sICcsIGVycik7XG4gICAgfSk7XG4gIH0sIGZ1bmN0aW9uKGVycikge1xuICAgIGNvbm5lY3Rpb24ucHJvdmlkZXIuZW1pdEVycm9yKCd3ZWJydGMnLCBlcnIpO1xuICAgIHV0aWwubG9nKCdGYWlsZWQgdG8gY3JlYXRlT2ZmZXIsICcsIGVycik7XG4gIH0sIGNvbm5lY3Rpb24ub3B0aW9ucy5jb25zdHJhaW50cyk7XG59XG5cbk5lZ290aWF0b3IuX21ha2VBbnN3ZXIgPSBmdW5jdGlvbihjb25uZWN0aW9uKSB7XG4gIHZhciBwYyA9IGNvbm5lY3Rpb24ucGM7XG5cbiAgcGMuY3JlYXRlQW5zd2VyKGZ1bmN0aW9uKGFuc3dlcikge1xuICAgIHV0aWwubG9nKCdDcmVhdGVkIGFuc3dlci4nKTtcblxuICAgIGlmICghdXRpbC5zdXBwb3J0cy5zY3RwICYmIGNvbm5lY3Rpb24udHlwZSA9PT0gJ2RhdGEnICYmIGNvbm5lY3Rpb24ucmVsaWFibGUpIHtcbiAgICAgIGFuc3dlci5zZHAgPSBSZWxpYWJsZS5oaWdoZXJCYW5kd2lkdGhTRFAoYW5zd2VyLnNkcCk7XG4gICAgfVxuXG4gICAgcGMuc2V0TG9jYWxEZXNjcmlwdGlvbihhbnN3ZXIsIGZ1bmN0aW9uKCkge1xuICAgICAgdXRpbC5sb2coJ1NldCBsb2NhbERlc2NyaXB0aW9uOiBhbnN3ZXInLCAnZm9yOicsIGNvbm5lY3Rpb24ucGVlcik7XG4gICAgICBjb25uZWN0aW9uLnByb3ZpZGVyLnNvY2tldC5zZW5kKHtcbiAgICAgICAgdHlwZTogJ0FOU1dFUicsXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBzZHA6IGFuc3dlcixcbiAgICAgICAgICB0eXBlOiBjb25uZWN0aW9uLnR5cGUsXG4gICAgICAgICAgY29ubmVjdGlvbklkOiBjb25uZWN0aW9uLmlkLFxuICAgICAgICAgIGJyb3dzZXI6IHV0aWwuYnJvd3NlclxuICAgICAgICB9LFxuICAgICAgICBkc3Q6IGNvbm5lY3Rpb24ucGVlclxuICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjb25uZWN0aW9uLnByb3ZpZGVyLmVtaXRFcnJvcignd2VicnRjJywgZXJyKTtcbiAgICAgIHV0aWwubG9nKCdGYWlsZWQgdG8gc2V0TG9jYWxEZXNjcmlwdGlvbiwgJywgZXJyKTtcbiAgICB9KTtcbiAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgY29ubmVjdGlvbi5wcm92aWRlci5lbWl0RXJyb3IoJ3dlYnJ0YycsIGVycik7XG4gICAgdXRpbC5sb2coJ0ZhaWxlZCB0byBjcmVhdGUgYW5zd2VyLCAnLCBlcnIpO1xuICB9KTtcbn1cblxuLyoqIEhhbmRsZSBhbiBTRFAuICovXG5OZWdvdGlhdG9yLmhhbmRsZVNEUCA9IGZ1bmN0aW9uKHR5cGUsIGNvbm5lY3Rpb24sIHNkcCkge1xuICBzZHAgPSBuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHNkcCk7XG4gIHZhciBwYyA9IGNvbm5lY3Rpb24ucGM7XG5cbiAgdXRpbC5sb2coJ1NldHRpbmcgcmVtb3RlIGRlc2NyaXB0aW9uJywgc2RwKTtcbiAgcGMuc2V0UmVtb3RlRGVzY3JpcHRpb24oc2RwLCBmdW5jdGlvbigpIHtcbiAgICB1dGlsLmxvZygnU2V0IHJlbW90ZURlc2NyaXB0aW9uOicsIHR5cGUsICdmb3I6JywgY29ubmVjdGlvbi5wZWVyKTtcblxuICAgIGlmICh0eXBlID09PSAnT0ZGRVInKSB7XG4gICAgICBOZWdvdGlhdG9yLl9tYWtlQW5zd2VyKGNvbm5lY3Rpb24pO1xuICAgIH1cbiAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgY29ubmVjdGlvbi5wcm92aWRlci5lbWl0RXJyb3IoJ3dlYnJ0YycsIGVycik7XG4gICAgdXRpbC5sb2coJ0ZhaWxlZCB0byBzZXRSZW1vdGVEZXNjcmlwdGlvbiwgJywgZXJyKTtcbiAgfSk7XG59XG5cbi8qKiBIYW5kbGUgYSBjYW5kaWRhdGUuICovXG5OZWdvdGlhdG9yLmhhbmRsZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGNvbm5lY3Rpb24sIGljZSkge1xuICB2YXIgY2FuZGlkYXRlID0gaWNlLmNhbmRpZGF0ZTtcbiAgdmFyIHNkcE1MaW5lSW5kZXggPSBpY2Uuc2RwTUxpbmVJbmRleDtcbiAgY29ubmVjdGlvbi5wYy5hZGRJY2VDYW5kaWRhdGUobmV3IFJUQ0ljZUNhbmRpZGF0ZSh7XG4gICAgc2RwTUxpbmVJbmRleDogc2RwTUxpbmVJbmRleCxcbiAgICBjYW5kaWRhdGU6IGNhbmRpZGF0ZVxuICB9KSk7XG4gIHV0aWwubG9nKCdBZGRlZCBJQ0UgY2FuZGlkYXRlIGZvcjonLCBjb25uZWN0aW9uLnBlZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5lZ290aWF0b3I7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcbnZhciBTb2NrZXQgPSByZXF1aXJlKCcuL3NvY2tldCcpO1xudmFyIE1lZGlhQ29ubmVjdGlvbiA9IHJlcXVpcmUoJy4vbWVkaWFjb25uZWN0aW9uJyk7XG52YXIgRGF0YUNvbm5lY3Rpb24gPSByZXF1aXJlKCcuL2RhdGFjb25uZWN0aW9uJyk7XG5cbi8qKlxuICogQSBwZWVyIHdobyBjYW4gaW5pdGlhdGUgY29ubmVjdGlvbnMgd2l0aCBvdGhlciBwZWVycy5cbiAqL1xuZnVuY3Rpb24gUGVlcihpZCwgb3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUGVlcikpIHJldHVybiBuZXcgUGVlcihpZCwgb3B0aW9ucyk7XG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gIC8vIERlYWwgd2l0aCBvdmVybG9hZGluZ1xuICBpZiAoaWQgJiYgaWQuY29uc3RydWN0b3IgPT0gT2JqZWN0KSB7XG4gICAgb3B0aW9ucyA9IGlkO1xuICAgIGlkID0gdW5kZWZpbmVkO1xuICB9IGVsc2UgaWYgKGlkKSB7XG4gICAgLy8gRW5zdXJlIGlkIGlzIGEgc3RyaW5nXG4gICAgaWQgPSBpZC50b1N0cmluZygpO1xuICB9XG4gIC8vXG5cbiAgLy8gQ29uZmlndXJpemUgb3B0aW9uc1xuICBvcHRpb25zID0gdXRpbC5leHRlbmQoe1xuICAgIGRlYnVnOiAwLCAvLyAxOiBFcnJvcnMsIDI6IFdhcm5pbmdzLCAzOiBBbGwgbG9nc1xuICAgIGhvc3Q6IHV0aWwuQ0xPVURfSE9TVCxcbiAgICBwb3J0OiB1dGlsLkNMT1VEX1BPUlQsXG4gICAga2V5OiAncGVlcmpzJyxcbiAgICBwYXRoOiAnLycsXG4gICAgdG9rZW46IHV0aWwucmFuZG9tVG9rZW4oKSxcbiAgICBjb25maWc6IHV0aWwuZGVmYXVsdENvbmZpZ1xuICB9LCBvcHRpb25zKTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgLy8gRGV0ZWN0IHJlbGF0aXZlIFVSTCBob3N0LlxuICBpZiAob3B0aW9ucy5ob3N0ID09PSAnLycpIHtcbiAgICBvcHRpb25zLmhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG4gIH1cbiAgLy8gU2V0IHBhdGggY29ycmVjdGx5LlxuICBpZiAob3B0aW9ucy5wYXRoWzBdICE9PSAnLycpIHtcbiAgICBvcHRpb25zLnBhdGggPSAnLycgKyBvcHRpb25zLnBhdGg7XG4gIH1cbiAgaWYgKG9wdGlvbnMucGF0aFtvcHRpb25zLnBhdGgubGVuZ3RoIC0gMV0gIT09ICcvJykge1xuICAgIG9wdGlvbnMucGF0aCArPSAnLyc7XG4gIH1cblxuICAvLyBTZXQgd2hldGhlciB3ZSB1c2UgU1NMIHRvIHNhbWUgYXMgY3VycmVudCBob3N0XG4gIGlmIChvcHRpb25zLnNlY3VyZSA9PT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuaG9zdCAhPT0gdXRpbC5DTE9VRF9IT1NUKSB7XG4gICAgb3B0aW9ucy5zZWN1cmUgPSB1dGlsLmlzU2VjdXJlKCk7XG4gIH1cbiAgLy8gU2V0IGEgY3VzdG9tIGxvZyBmdW5jdGlvbiBpZiBwcmVzZW50XG4gIGlmIChvcHRpb25zLmxvZ0Z1bmN0aW9uKSB7XG4gICAgdXRpbC5zZXRMb2dGdW5jdGlvbihvcHRpb25zLmxvZ0Z1bmN0aW9uKTtcbiAgfVxuICB1dGlsLnNldExvZ0xldmVsKG9wdGlvbnMuZGVidWcpO1xuICAvL1xuXG4gIC8vIFNhbml0eSBjaGVja3NcbiAgLy8gRW5zdXJlIFdlYlJUQyBzdXBwb3J0ZWRcbiAgaWYgKCF1dGlsLnN1cHBvcnRzLmF1ZGlvVmlkZW8gJiYgIXV0aWwuc3VwcG9ydHMuZGF0YSApIHtcbiAgICB0aGlzLl9kZWxheWVkQWJvcnQoJ2Jyb3dzZXItaW5jb21wYXRpYmxlJywgJ1RoZSBjdXJyZW50IGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBXZWJSVEMnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gRW5zdXJlIGFscGhhbnVtZXJpYyBpZFxuICBpZiAoIXV0aWwudmFsaWRhdGVJZChpZCkpIHtcbiAgICB0aGlzLl9kZWxheWVkQWJvcnQoJ2ludmFsaWQtaWQnLCAnSUQgXCInICsgaWQgKyAnXCIgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBFbnN1cmUgdmFsaWQga2V5XG4gIGlmICghdXRpbC52YWxpZGF0ZUtleShvcHRpb25zLmtleSkpIHtcbiAgICB0aGlzLl9kZWxheWVkQWJvcnQoJ2ludmFsaWQta2V5JywgJ0FQSSBLRVkgXCInICsgb3B0aW9ucy5rZXkgKyAnXCIgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBFbnN1cmUgbm90IHVzaW5nIHVuc2VjdXJlIGNsb3VkIHNlcnZlciBvbiBTU0wgcGFnZVxuICBpZiAob3B0aW9ucy5zZWN1cmUgJiYgb3B0aW9ucy5ob3N0ID09PSAnMC5wZWVyanMuY29tJykge1xuICAgIHRoaXMuX2RlbGF5ZWRBYm9ydCgnc3NsLXVuYXZhaWxhYmxlJyxcbiAgICAgICdUaGUgY2xvdWQgc2VydmVyIGN1cnJlbnRseSBkb2VzIG5vdCBzdXBwb3J0IEhUVFBTLiBQbGVhc2UgcnVuIHlvdXIgb3duIFBlZXJTZXJ2ZXIgdG8gdXNlIEhUVFBTLicpO1xuICAgIHJldHVybjtcbiAgfVxuICAvL1xuXG4gIC8vIFN0YXRlcy5cbiAgdGhpcy5kZXN0cm95ZWQgPSBmYWxzZTsgLy8gQ29ubmVjdGlvbnMgaGF2ZSBiZWVuIGtpbGxlZFxuICB0aGlzLmRpc2Nvbm5lY3RlZCA9IGZhbHNlOyAvLyBDb25uZWN0aW9uIHRvIFBlZXJTZXJ2ZXIga2lsbGVkIGJ1dCBQMlAgY29ubmVjdGlvbnMgc3RpbGwgYWN0aXZlXG4gIHRoaXMub3BlbiA9IGZhbHNlOyAvLyBTb2NrZXRzIGFuZCBzdWNoIGFyZSBub3QgeWV0IG9wZW4uXG4gIC8vXG5cbiAgLy8gUmVmZXJlbmNlc1xuICB0aGlzLmNvbm5lY3Rpb25zID0ge307IC8vIERhdGFDb25uZWN0aW9ucyBmb3IgdGhpcyBwZWVyLlxuICB0aGlzLl9sb3N0TWVzc2FnZXMgPSB7fTsgLy8gc3JjID0+IFtsaXN0IG9mIG1lc3NhZ2VzXVxuICAvL1xuXG4gIC8vIFN0YXJ0IHRoZSBzZXJ2ZXIgY29ubmVjdGlvblxuICB0aGlzLl9pbml0aWFsaXplU2VydmVyQ29ubmVjdGlvbigpO1xuICBpZiAoaWQpIHtcbiAgICB0aGlzLl9pbml0aWFsaXplKGlkKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9yZXRyaWV2ZUlkKCk7XG4gIH1cbiAgLy9cbn1cblxudXRpbC5pbmhlcml0cyhQZWVyLCBFdmVudEVtaXR0ZXIpO1xuXG4vLyBJbml0aWFsaXplIHRoZSAnc29ja2V0JyAod2hpY2ggaXMgYWN0dWFsbHkgYSBtaXggb2YgWEhSIHN0cmVhbWluZyBhbmRcbi8vIHdlYnNvY2tldHMuKVxuUGVlci5wcm90b3R5cGUuX2luaXRpYWxpemVTZXJ2ZXJDb25uZWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5zb2NrZXQgPSBuZXcgU29ja2V0KHRoaXMub3B0aW9ucy5zZWN1cmUsIHRoaXMub3B0aW9ucy5ob3N0LCB0aGlzLm9wdGlvbnMucG9ydCwgdGhpcy5vcHRpb25zLnBhdGgsIHRoaXMub3B0aW9ucy5rZXkpO1xuICB0aGlzLnNvY2tldC5vbignbWVzc2FnZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBzZWxmLl9oYW5kbGVNZXNzYWdlKGRhdGEpO1xuICB9KTtcbiAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICBzZWxmLl9hYm9ydCgnc29ja2V0LWVycm9yJywgZXJyb3IpO1xuICB9KTtcbiAgdGhpcy5zb2NrZXQub24oJ2Rpc2Nvbm5lY3RlZCcsIGZ1bmN0aW9uKCkge1xuICAgIC8vIElmIHdlIGhhdmVuJ3QgZXhwbGljaXRseSBkaXNjb25uZWN0ZWQsIGVtaXQgZXJyb3IgYW5kIGRpc2Nvbm5lY3QuXG4gICAgaWYgKCFzZWxmLmRpc2Nvbm5lY3RlZCkge1xuICAgICAgc2VsZi5lbWl0RXJyb3IoJ25ldHdvcmsnLCAnTG9zdCBjb25uZWN0aW9uIHRvIHNlcnZlci4nKTtcbiAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfSk7XG4gIHRoaXMuc29ja2V0Lm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgIC8vIElmIHdlIGhhdmVuJ3QgZXhwbGljaXRseSBkaXNjb25uZWN0ZWQsIGVtaXQgZXJyb3IuXG4gICAgaWYgKCFzZWxmLmRpc2Nvbm5lY3RlZCkge1xuICAgICAgc2VsZi5fYWJvcnQoJ3NvY2tldC1jbG9zZWQnLCAnVW5kZXJseWluZyBzb2NrZXQgaXMgYWxyZWFkeSBjbG9zZWQuJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKiBHZXQgYSB1bmlxdWUgSUQgZnJvbSB0aGUgc2VydmVyIHZpYSBYSFIuICovXG5QZWVyLnByb3RvdHlwZS5fcmV0cmlldmVJZCA9IGZ1bmN0aW9uKGNiKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgdmFyIHByb3RvY29sID0gdGhpcy5vcHRpb25zLnNlY3VyZSA/ICdodHRwczovLycgOiAnaHR0cDovLyc7XG4gIHZhciB1cmwgPSBwcm90b2NvbCArIHRoaXMub3B0aW9ucy5ob3N0ICsgJzonICsgdGhpcy5vcHRpb25zLnBvcnQgK1xuICAgIHRoaXMub3B0aW9ucy5wYXRoICsgdGhpcy5vcHRpb25zLmtleSArICcvaWQnO1xuICB2YXIgcXVlcnlTdHJpbmcgPSAnP3RzPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSArICcnICsgTWF0aC5yYW5kb20oKTtcbiAgdXJsICs9IHF1ZXJ5U3RyaW5nO1xuXG4gIC8vIElmIHRoZXJlJ3Mgbm8gSUQgd2UgbmVlZCB0byB3YWl0IGZvciBvbmUgYmVmb3JlIHRyeWluZyB0byBpbml0IHNvY2tldC5cbiAgaHR0cC5vcGVuKCdnZXQnLCB1cmwsIHRydWUpO1xuICBodHRwLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgdXRpbC5lcnJvcignRXJyb3IgcmV0cmlldmluZyBJRCcsIGUpO1xuICAgIHZhciBwYXRoRXJyb3IgPSAnJztcbiAgICBpZiAoc2VsZi5vcHRpb25zLnBhdGggPT09ICcvJyAmJiBzZWxmLm9wdGlvbnMuaG9zdCAhPT0gdXRpbC5DTE9VRF9IT1NUKSB7XG4gICAgICBwYXRoRXJyb3IgPSAnIElmIHlvdSBwYXNzZWQgaW4gYSBgcGF0aGAgdG8geW91ciBzZWxmLWhvc3RlZCBQZWVyU2VydmVyLCAnICtcbiAgICAgICAgJ3lvdVxcJ2xsIGFsc28gbmVlZCB0byBwYXNzIGluIHRoYXQgc2FtZSBwYXRoIHdoZW4gY3JlYXRpbmcgYSBuZXcgJyArXG4gICAgICAgICdQZWVyLic7XG4gICAgfVxuICAgIHNlbGYuX2Fib3J0KCdzZXJ2ZXItZXJyb3InLCAnQ291bGQgbm90IGdldCBhbiBJRCBmcm9tIHRoZSBzZXJ2ZXIuJyArIHBhdGhFcnJvcik7XG4gIH07XG4gIGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGh0dHAucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaHR0cC5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgaHR0cC5vbmVycm9yKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuX2luaXRpYWxpemUoaHR0cC5yZXNwb25zZVRleHQpO1xuICB9O1xuICBodHRwLnNlbmQobnVsbCk7XG59O1xuXG4vKiogSW5pdGlhbGl6ZSBhIGNvbm5lY3Rpb24gd2l0aCB0aGUgc2VydmVyLiAqL1xuUGVlci5wcm90b3R5cGUuX2luaXRpYWxpemUgPSBmdW5jdGlvbihpZCkge1xuICB0aGlzLmlkID0gaWQ7XG4gIHRoaXMuc29ja2V0LnN0YXJ0KHRoaXMuaWQsIHRoaXMub3B0aW9ucy50b2tlbik7XG59O1xuXG4vKiogSGFuZGxlcyBtZXNzYWdlcyBmcm9tIHRoZSBzZXJ2ZXIuICovXG5QZWVyLnByb3RvdHlwZS5faGFuZGxlTWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHR5cGUgPSBtZXNzYWdlLnR5cGU7XG4gIHZhciBwYXlsb2FkID0gbWVzc2FnZS5wYXlsb2FkO1xuICB2YXIgcGVlciA9IG1lc3NhZ2Uuc3JjO1xuICB2YXIgY29ubmVjdGlvbjtcblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdPUEVOJzogLy8gVGhlIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciBpcyBvcGVuLlxuICAgICAgdGhpcy5lbWl0KCdvcGVuJywgdGhpcy5pZCk7XG4gICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRVJST1InOiAvLyBTZXJ2ZXIgZXJyb3IuXG4gICAgICB0aGlzLl9hYm9ydCgnc2VydmVyLWVycm9yJywgcGF5bG9hZC5tc2cpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSUQtVEFLRU4nOiAvLyBUaGUgc2VsZWN0ZWQgSUQgaXMgdGFrZW4uXG4gICAgICB0aGlzLl9hYm9ydCgndW5hdmFpbGFibGUtaWQnLCAnSUQgYCcgKyB0aGlzLmlkICsgJ2AgaXMgdGFrZW4nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0lOVkFMSUQtS0VZJzogLy8gVGhlIGdpdmVuIEFQSSBrZXkgY2Fubm90IGJlIGZvdW5kLlxuICAgICAgdGhpcy5fYWJvcnQoJ2ludmFsaWQta2V5JywgJ0FQSSBLRVkgXCInICsgdGhpcy5vcHRpb25zLmtleSArICdcIiBpcyBpbnZhbGlkJyk7XG4gICAgICBicmVhaztcblxuICAgIC8vXG4gICAgY2FzZSAnTEVBVkUnOiAvLyBBbm90aGVyIHBlZXIgaGFzIGNsb3NlZCBpdHMgY29ubmVjdGlvbiB0byB0aGlzIHBlZXIuXG4gICAgICB1dGlsLmxvZygnUmVjZWl2ZWQgbGVhdmUgbWVzc2FnZSBmcm9tJywgcGVlcik7XG4gICAgICB0aGlzLl9jbGVhbnVwUGVlcihwZWVyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnRVhQSVJFJzogLy8gVGhlIG9mZmVyIHNlbnQgdG8gYSBwZWVyIGhhcyBleHBpcmVkIHdpdGhvdXQgcmVzcG9uc2UuXG4gICAgICB0aGlzLmVtaXRFcnJvcigncGVlci11bmF2YWlsYWJsZScsICdDb3VsZCBub3QgY29ubmVjdCB0byBwZWVyICcgKyBwZWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ09GRkVSJzogLy8gd2Ugc2hvdWxkIGNvbnNpZGVyIHN3aXRjaGluZyB0aGlzIHRvIENBTEwvQ09OTkVDVCwgYnV0IHRoaXMgaXMgdGhlIGxlYXN0IGJyZWFraW5nIG9wdGlvbi5cbiAgICAgIHZhciBjb25uZWN0aW9uSWQgPSBwYXlsb2FkLmNvbm5lY3Rpb25JZDtcbiAgICAgIGNvbm5lY3Rpb24gPSB0aGlzLmdldENvbm5lY3Rpb24ocGVlciwgY29ubmVjdGlvbklkKTtcblxuICAgICAgaWYgKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgdXRpbC53YXJuKCdPZmZlciByZWNlaXZlZCBmb3IgZXhpc3RpbmcgQ29ubmVjdGlvbiBJRDonLCBjb25uZWN0aW9uSWQpO1xuICAgICAgICAvL2Nvbm5lY3Rpb24uaGFuZGxlTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIG5ldyBjb25uZWN0aW9uLlxuICAgICAgICBpZiAocGF5bG9hZC50eXBlID09PSAnbWVkaWEnKSB7XG4gICAgICAgICAgY29ubmVjdGlvbiA9IG5ldyBNZWRpYUNvbm5lY3Rpb24ocGVlciwgdGhpcywge1xuICAgICAgICAgICAgY29ubmVjdGlvbklkOiBjb25uZWN0aW9uSWQsXG4gICAgICAgICAgICBfcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIG1ldGFkYXRhOiBwYXlsb2FkLm1ldGFkYXRhXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fYWRkQ29ubmVjdGlvbihwZWVyLCBjb25uZWN0aW9uKTtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2NhbGwnLCBjb25uZWN0aW9uKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnR5cGUgPT09ICdkYXRhJykge1xuICAgICAgICAgIGNvbm5lY3Rpb24gPSBuZXcgRGF0YUNvbm5lY3Rpb24ocGVlciwgdGhpcywge1xuICAgICAgICAgICAgY29ubmVjdGlvbklkOiBjb25uZWN0aW9uSWQsXG4gICAgICAgICAgICBfcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIG1ldGFkYXRhOiBwYXlsb2FkLm1ldGFkYXRhLFxuICAgICAgICAgICAgbGFiZWw6IHBheWxvYWQubGFiZWwsXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uOiBwYXlsb2FkLnNlcmlhbGl6YXRpb24sXG4gICAgICAgICAgICByZWxpYWJsZTogcGF5bG9hZC5yZWxpYWJsZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuX2FkZENvbm5lY3Rpb24ocGVlciwgY29ubmVjdGlvbik7XG4gICAgICAgICAgdGhpcy5lbWl0KCdjb25uZWN0aW9uJywgY29ubmVjdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXRpbC53YXJuKCdSZWNlaXZlZCBtYWxmb3JtZWQgY29ubmVjdGlvbiB0eXBlOicsIHBheWxvYWQudHlwZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZpbmQgbWVzc2FnZXMuXG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMuX2dldE1lc3NhZ2VzKGNvbm5lY3Rpb25JZCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IG1lc3NhZ2VzLmxlbmd0aDsgaSA8IGlpOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25uZWN0aW9uLmhhbmRsZU1lc3NhZ2UobWVzc2FnZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKCFwYXlsb2FkKSB7XG4gICAgICAgIHV0aWwud2FybignWW91IHJlY2VpdmVkIGEgbWFsZm9ybWVkIG1lc3NhZ2UgZnJvbSAnICsgcGVlciArICcgb2YgdHlwZSAnICsgdHlwZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGlkID0gcGF5bG9hZC5jb25uZWN0aW9uSWQ7XG4gICAgICBjb25uZWN0aW9uID0gdGhpcy5nZXRDb25uZWN0aW9uKHBlZXIsIGlkKTtcblxuICAgICAgaWYgKGNvbm5lY3Rpb24gJiYgY29ubmVjdGlvbi5wYykge1xuICAgICAgICAvLyBQYXNzIGl0IG9uLlxuICAgICAgICBjb25uZWN0aW9uLmhhbmRsZU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICB9IGVsc2UgaWYgKGlkKSB7XG4gICAgICAgIC8vIFN0b3JlIGZvciBwb3NzaWJsZSBsYXRlciB1c2VcbiAgICAgICAgdGhpcy5fc3RvcmVNZXNzYWdlKGlkLCBtZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHV0aWwud2FybignWW91IHJlY2VpdmVkIGFuIHVucmVjb2duaXplZCBtZXNzYWdlOicsIG1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbi8qKiBTdG9yZXMgbWVzc2FnZXMgd2l0aG91dCBhIHNldCB1cCBjb25uZWN0aW9uLCB0byBiZSBjbGFpbWVkIGxhdGVyLiAqL1xuUGVlci5wcm90b3R5cGUuX3N0b3JlTWVzc2FnZSA9IGZ1bmN0aW9uKGNvbm5lY3Rpb25JZCwgbWVzc2FnZSkge1xuICBpZiAoIXRoaXMuX2xvc3RNZXNzYWdlc1tjb25uZWN0aW9uSWRdKSB7XG4gICAgdGhpcy5fbG9zdE1lc3NhZ2VzW2Nvbm5lY3Rpb25JZF0gPSBbXTtcbiAgfVxuICB0aGlzLl9sb3N0TWVzc2FnZXNbY29ubmVjdGlvbklkXS5wdXNoKG1lc3NhZ2UpO1xufTtcblxuLyoqIFJldHJpZXZlIG1lc3NhZ2VzIGZyb20gbG9zdCBtZXNzYWdlIHN0b3JlICovXG5QZWVyLnByb3RvdHlwZS5fZ2V0TWVzc2FnZXMgPSBmdW5jdGlvbihjb25uZWN0aW9uSWQpIHtcbiAgdmFyIG1lc3NhZ2VzID0gdGhpcy5fbG9zdE1lc3NhZ2VzW2Nvbm5lY3Rpb25JZF07XG4gIGlmIChtZXNzYWdlcykge1xuICAgIGRlbGV0ZSB0aGlzLl9sb3N0TWVzc2FnZXNbY29ubmVjdGlvbklkXTtcbiAgICByZXR1cm4gbWVzc2FnZXM7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBEYXRhQ29ubmVjdGlvbiB0byB0aGUgc3BlY2lmaWVkIHBlZXIuIFNlZSBkb2N1bWVudGF0aW9uIGZvciBhXG4gKiBjb21wbGV0ZSBsaXN0IG9mIG9wdGlvbnMuXG4gKi9cblBlZXIucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbihwZWVyLCBvcHRpb25zKSB7XG4gIGlmICh0aGlzLmRpc2Nvbm5lY3RlZCkge1xuICAgIHV0aWwud2FybignWW91IGNhbm5vdCBjb25uZWN0IHRvIGEgbmV3IFBlZXIgYmVjYXVzZSB5b3UgY2FsbGVkICcgK1xuICAgICAgJy5kaXNjb25uZWN0KCkgb24gdGhpcyBQZWVyIGFuZCBlbmRlZCB5b3VyIGNvbm5lY3Rpb24gd2l0aCB0aGUgJyArXG4gICAgICAnc2VydmVyLiBZb3UgY2FuIGNyZWF0ZSBhIG5ldyBQZWVyIHRvIHJlY29ubmVjdCwgb3IgY2FsbCByZWNvbm5lY3QgJyArXG4gICAgICAnb24gdGhpcyBwZWVyIGlmIHlvdSBiZWxpZXZlIGl0cyBJRCB0byBzdGlsbCBiZSBhdmFpbGFibGUuJyk7XG4gICAgdGhpcy5lbWl0RXJyb3IoJ2Rpc2Nvbm5lY3RlZCcsICdDYW5ub3QgY29ubmVjdCB0byBuZXcgUGVlciBhZnRlciBkaXNjb25uZWN0aW5nIGZyb20gc2VydmVyLicpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgY29ubmVjdGlvbiA9IG5ldyBEYXRhQ29ubmVjdGlvbihwZWVyLCB0aGlzLCBvcHRpb25zKTtcbiAgdGhpcy5fYWRkQ29ubmVjdGlvbihwZWVyLCBjb25uZWN0aW9uKTtcbiAgcmV0dXJuIGNvbm5lY3Rpb247XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBNZWRpYUNvbm5lY3Rpb24gdG8gdGhlIHNwZWNpZmllZCBwZWVyLiBTZWUgZG9jdW1lbnRhdGlvbiBmb3IgYVxuICogY29tcGxldGUgbGlzdCBvZiBvcHRpb25zLlxuICovXG5QZWVyLnByb3RvdHlwZS5jYWxsID0gZnVuY3Rpb24ocGVlciwgc3RyZWFtLCBvcHRpb25zKSB7XG4gIGlmICh0aGlzLmRpc2Nvbm5lY3RlZCkge1xuICAgIHV0aWwud2FybignWW91IGNhbm5vdCBjb25uZWN0IHRvIGEgbmV3IFBlZXIgYmVjYXVzZSB5b3UgY2FsbGVkICcgK1xuICAgICAgJy5kaXNjb25uZWN0KCkgb24gdGhpcyBQZWVyIGFuZCBlbmRlZCB5b3VyIGNvbm5lY3Rpb24gd2l0aCB0aGUgJyArXG4gICAgICAnc2VydmVyLiBZb3UgY2FuIGNyZWF0ZSBhIG5ldyBQZWVyIHRvIHJlY29ubmVjdC4nKTtcbiAgICB0aGlzLmVtaXRFcnJvcignZGlzY29ubmVjdGVkJywgJ0Nhbm5vdCBjb25uZWN0IHRvIG5ldyBQZWVyIGFmdGVyIGRpc2Nvbm5lY3RpbmcgZnJvbSBzZXJ2ZXIuJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICghc3RyZWFtKSB7XG4gICAgdXRpbC5lcnJvcignVG8gY2FsbCBhIHBlZXIsIHlvdSBtdXN0IHByb3ZpZGUgYSBzdHJlYW0gZnJvbSB5b3VyIGJyb3dzZXJcXCdzIGBnZXRVc2VyTWVkaWFgLicpO1xuICAgIHJldHVybjtcbiAgfVxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgb3B0aW9ucy5fc3RyZWFtID0gc3RyZWFtO1xuICB2YXIgY2FsbCA9IG5ldyBNZWRpYUNvbm5lY3Rpb24ocGVlciwgdGhpcywgb3B0aW9ucyk7XG4gIHRoaXMuX2FkZENvbm5lY3Rpb24ocGVlciwgY2FsbCk7XG4gIHJldHVybiBjYWxsO1xufTtcblxuLyoqIEFkZCBhIGRhdGEvbWVkaWEgY29ubmVjdGlvbiB0byB0aGlzIHBlZXIuICovXG5QZWVyLnByb3RvdHlwZS5fYWRkQ29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBlZXIsIGNvbm5lY3Rpb24pIHtcbiAgaWYgKCF0aGlzLmNvbm5lY3Rpb25zW3BlZXJdKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uc1twZWVyXSA9IFtdO1xuICB9XG4gIHRoaXMuY29ubmVjdGlvbnNbcGVlcl0ucHVzaChjb25uZWN0aW9uKTtcbn07XG5cbi8qKiBSZXRyaWV2ZSBhIGRhdGEvbWVkaWEgY29ubmVjdGlvbiBmb3IgdGhpcyBwZWVyLiAqL1xuUGVlci5wcm90b3R5cGUuZ2V0Q29ubmVjdGlvbiA9IGZ1bmN0aW9uKHBlZXIsIGlkKSB7XG4gIHZhciBjb25uZWN0aW9ucyA9IHRoaXMuY29ubmVjdGlvbnNbcGVlcl07XG4gIGlmICghY29ubmVjdGlvbnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBmb3IgKHZhciBpID0gMCwgaWkgPSBjb25uZWN0aW9ucy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgaWYgKGNvbm5lY3Rpb25zW2ldLmlkID09PSBpZCkge1xuICAgICAgcmV0dXJuIGNvbm5lY3Rpb25zW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cblBlZXIucHJvdG90eXBlLl9kZWxheWVkQWJvcnQgPSBmdW5jdGlvbih0eXBlLCBtZXNzYWdlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdXRpbC5zZXRaZXJvVGltZW91dChmdW5jdGlvbigpe1xuICAgIHNlbGYuX2Fib3J0KHR5cGUsIG1lc3NhZ2UpO1xuICB9KTtcbn07XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIFBlZXIgYW5kIGVtaXRzIGFuIGVycm9yIG1lc3NhZ2UuXG4gKiBUaGUgUGVlciBpcyBub3QgZGVzdHJveWVkIGlmIGl0J3MgaW4gYSBkaXNjb25uZWN0ZWQgc3RhdGUsIGluIHdoaWNoIGNhc2VcbiAqIGl0IHJldGFpbnMgaXRzIGRpc2Nvbm5lY3RlZCBzdGF0ZSBhbmQgaXRzIGV4aXN0aW5nIGNvbm5lY3Rpb25zLlxuICovXG5QZWVyLnByb3RvdHlwZS5fYWJvcnQgPSBmdW5jdGlvbih0eXBlLCBtZXNzYWdlKSB7XG4gIHV0aWwuZXJyb3IoJ0Fib3J0aW5nIScpO1xuICBpZiAoIXRoaXMuX2xhc3RTZXJ2ZXJJZCkge1xuICAgIHRoaXMuZGVzdHJveSgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZGlzY29ubmVjdCgpO1xuICB9XG4gIHRoaXMuZW1pdEVycm9yKHR5cGUsIG1lc3NhZ2UpO1xufTtcblxuLyoqIEVtaXRzIGEgdHlwZWQgZXJyb3IgbWVzc2FnZS4gKi9cblBlZXIucHJvdG90eXBlLmVtaXRFcnJvciA9IGZ1bmN0aW9uKHR5cGUsIGVycikge1xuICB1dGlsLmVycm9yKCdFcnJvcjonLCBlcnIpO1xuICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICBlcnIgPSBuZXcgRXJyb3IoZXJyKTtcbiAgfVxuICBlcnIudHlwZSA9IHR5cGU7XG4gIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xufTtcblxuLyoqXG4gKiBEZXN0cm95cyB0aGUgUGVlcjogY2xvc2VzIGFsbCBhY3RpdmUgY29ubmVjdGlvbnMgYXMgd2VsbCBhcyB0aGUgY29ubmVjdGlvblxuICogIHRvIHRoZSBzZXJ2ZXIuXG4gKiBXYXJuaW5nOiBUaGUgcGVlciBjYW4gbm8gbG9uZ2VyIGNyZWF0ZSBvciBhY2NlcHQgY29ubmVjdGlvbnMgYWZ0ZXIgYmVpbmdcbiAqICBkZXN0cm95ZWQuXG4gKi9cblBlZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLmRlc3Ryb3llZCkge1xuICAgIHRoaXMuX2NsZWFudXAoKTtcbiAgICB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gIH1cbn07XG5cblxuLyoqIERpc2Nvbm5lY3RzIGV2ZXJ5IGNvbm5lY3Rpb24gb24gdGhpcyBwZWVyLiAqL1xuUGVlci5wcm90b3R5cGUuX2NsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuY29ubmVjdGlvbnMpIHtcbiAgICB2YXIgcGVlcnMgPSBPYmplY3Qua2V5cyh0aGlzLmNvbm5lY3Rpb25zKTtcbiAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwZWVycy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICB0aGlzLl9jbGVhbnVwUGVlcihwZWVyc1tpXSk7XG4gICAgfVxuICB9XG4gIHRoaXMuZW1pdCgnY2xvc2UnKTtcbn07XG5cbi8qKiBDbG9zZXMgYWxsIGNvbm5lY3Rpb25zIHRvIHRoaXMgcGVlci4gKi9cblBlZXIucHJvdG90eXBlLl9jbGVhbnVwUGVlciA9IGZ1bmN0aW9uKHBlZXIpIHtcbiAgdmFyIGNvbm5lY3Rpb25zID0gdGhpcy5jb25uZWN0aW9uc1twZWVyXTtcbiAgZm9yICh2YXIgaiA9IDAsIGpqID0gY29ubmVjdGlvbnMubGVuZ3RoOyBqIDwgamo7IGogKz0gMSkge1xuICAgIGNvbm5lY3Rpb25zW2pdLmNsb3NlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogRGlzY29ubmVjdHMgdGhlIFBlZXIncyBjb25uZWN0aW9uIHRvIHRoZSBQZWVyU2VydmVyLiBEb2VzIG5vdCBjbG9zZSBhbnlcbiAqICBhY3RpdmUgY29ubmVjdGlvbnMuXG4gKiBXYXJuaW5nOiBUaGUgcGVlciBjYW4gbm8gbG9uZ2VyIGNyZWF0ZSBvciBhY2NlcHQgY29ubmVjdGlvbnMgYWZ0ZXIgYmVpbmdcbiAqICBkaXNjb25uZWN0ZWQuIEl0IGFsc28gY2Fubm90IHJlY29ubmVjdCB0byB0aGUgc2VydmVyLlxuICovXG5QZWVyLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdXRpbC5zZXRaZXJvVGltZW91dChmdW5jdGlvbigpe1xuICAgIGlmICghc2VsZi5kaXNjb25uZWN0ZWQpIHtcbiAgICAgIHNlbGYuZGlzY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIHNlbGYub3BlbiA9IGZhbHNlO1xuICAgICAgaWYgKHNlbGYuc29ja2V0KSB7XG4gICAgICAgIHNlbGYuc29ja2V0LmNsb3NlKCk7XG4gICAgICB9XG4gICAgICBzZWxmLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIHNlbGYuaWQpO1xuICAgICAgc2VsZi5fbGFzdFNlcnZlcklkID0gc2VsZi5pZDtcbiAgICAgIHNlbGYuaWQgPSBudWxsO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKiogQXR0ZW1wdHMgdG8gcmVjb25uZWN0IHdpdGggdGhlIHNhbWUgSUQuICovXG5QZWVyLnByb3RvdHlwZS5yZWNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuZGlzY29ubmVjdGVkICYmICF0aGlzLmRlc3Ryb3llZCkge1xuICAgIHV0aWwubG9nKCdBdHRlbXB0aW5nIHJlY29ubmVjdGlvbiB0byBzZXJ2ZXIgd2l0aCBJRCAnICsgdGhpcy5fbGFzdFNlcnZlcklkKTtcbiAgICB0aGlzLmRpc2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2luaXRpYWxpemVTZXJ2ZXJDb25uZWN0aW9uKCk7XG4gICAgdGhpcy5faW5pdGlhbGl6ZSh0aGlzLl9sYXN0U2VydmVySWQpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVzdHJveWVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHBlZXIgY2Fubm90IHJlY29ubmVjdCB0byB0aGUgc2VydmVyLiBJdCBoYXMgYWxyZWFkeSBiZWVuIGRlc3Ryb3llZC4nKTtcbiAgfSBlbHNlIGlmICghdGhpcy5kaXNjb25uZWN0ZWQgJiYgIXRoaXMub3Blbikge1xuICAgIC8vIERvIG5vdGhpbmcuIFdlJ3JlIHN0aWxsIGNvbm5lY3RpbmcgdGhlIGZpcnN0IHRpbWUuXG4gICAgdXRpbC5lcnJvcignSW4gYSBodXJyeT8gV2VcXCdyZSBzdGlsbCB0cnlpbmcgdG8gbWFrZSB0aGUgaW5pdGlhbCBjb25uZWN0aW9uIScpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignUGVlciAnICsgdGhpcy5pZCArICcgY2Fubm90IHJlY29ubmVjdCBiZWNhdXNlIGl0IGlzIG5vdCBkaXNjb25uZWN0ZWQgZnJvbSB0aGUgc2VydmVyIScpO1xuICB9XG59O1xuXG4vKipcbiAqIEdldCBhIGxpc3Qgb2YgYXZhaWxhYmxlIHBlZXIgSURzLiBJZiB5b3UncmUgcnVubmluZyB5b3VyIG93biBzZXJ2ZXIsIHlvdSdsbFxuICogd2FudCB0byBzZXQgYWxsb3dfZGlzY292ZXJ5OiB0cnVlIGluIHRoZSBQZWVyU2VydmVyIG9wdGlvbnMuIElmIHlvdSdyZSB1c2luZ1xuICogdGhlIGNsb3VkIHNlcnZlciwgZW1haWwgdGVhbUBwZWVyanMuY29tIHRvIGdldCB0aGUgZnVuY3Rpb25hbGl0eSBlbmFibGVkIGZvclxuICogeW91ciBrZXkuXG4gKi9cblBlZXIucHJvdG90eXBlLmxpc3RBbGxQZWVycyA9IGZ1bmN0aW9uKGNiKSB7XG4gIGNiID0gY2IgfHwgZnVuY3Rpb24oKSB7fTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICB2YXIgcHJvdG9jb2wgPSB0aGlzLm9wdGlvbnMuc2VjdXJlID8gJ2h0dHBzOi8vJyA6ICdodHRwOi8vJztcbiAgdmFyIHVybCA9IHByb3RvY29sICsgdGhpcy5vcHRpb25zLmhvc3QgKyAnOicgKyB0aGlzLm9wdGlvbnMucG9ydCArXG4gICAgdGhpcy5vcHRpb25zLnBhdGggKyB0aGlzLm9wdGlvbnMua2V5ICsgJy9wZWVycyc7XG4gIHZhciBxdWVyeVN0cmluZyA9ICc/dHM9JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgJycgKyBNYXRoLnJhbmRvbSgpO1xuICB1cmwgKz0gcXVlcnlTdHJpbmc7XG5cbiAgLy8gSWYgdGhlcmUncyBubyBJRCB3ZSBuZWVkIHRvIHdhaXQgZm9yIG9uZSBiZWZvcmUgdHJ5aW5nIHRvIGluaXQgc29ja2V0LlxuICBodHRwLm9wZW4oJ2dldCcsIHVybCwgdHJ1ZSk7XG4gIGh0dHAub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICBzZWxmLl9hYm9ydCgnc2VydmVyLWVycm9yJywgJ0NvdWxkIG5vdCBnZXQgcGVlcnMgZnJvbSB0aGUgc2VydmVyLicpO1xuICAgIGNiKFtdKTtcbiAgfTtcbiAgaHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoaHR0cC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChodHRwLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICB2YXIgaGVscGZ1bEVycm9yID0gJyc7XG4gICAgICBpZiAoc2VsZi5vcHRpb25zLmhvc3QgIT09IHV0aWwuQ0xPVURfSE9TVCkge1xuICAgICAgICBoZWxwZnVsRXJyb3IgPSAnSXQgbG9va3MgbGlrZSB5b3VcXCdyZSB1c2luZyB0aGUgY2xvdWQgc2VydmVyLiBZb3UgY2FuIGVtYWlsICcgK1xuICAgICAgICAgICd0ZWFtQHBlZXJqcy5jb20gdG8gZW5hYmxlIHBlZXIgbGlzdGluZyBmb3IgeW91ciBBUEkga2V5Lic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWxwZnVsRXJyb3IgPSAnWW91IG5lZWQgdG8gZW5hYmxlIGBhbGxvd19kaXNjb3ZlcnlgIG9uIHlvdXIgc2VsZi1ob3N0ZWQgJyArXG4gICAgICAgICAgJ1BlZXJTZXJ2ZXIgdG8gdXNlIHRoaXMgZmVhdHVyZS4nO1xuICAgICAgfVxuICAgICAgY2IoW10pO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdCBkb2VzblxcJ3QgbG9vayBsaWtlIHlvdSBoYXZlIHBlcm1pc3Npb24gdG8gbGlzdCBwZWVycyBJRHMuICcgKyBoZWxwZnVsRXJyb3IpO1xuICAgIH0gZWxzZSBpZiAoaHR0cC5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgY2IoW10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYihKU09OLnBhcnNlKGh0dHAucmVzcG9uc2VUZXh0KSk7XG4gICAgfVxuICB9O1xuICBodHRwLnNlbmQobnVsbCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBlZXI7XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcblxuLyoqXG4gKiBBbiBhYnN0cmFjdGlvbiBvbiB0b3Agb2YgV2ViU29ja2V0cyBhbmQgWEhSIHN0cmVhbWluZyB0byBwcm92aWRlIGZhc3Rlc3RcbiAqIHBvc3NpYmxlIGNvbm5lY3Rpb24gZm9yIHBlZXJzLlxuICovXG5mdW5jdGlvbiBTb2NrZXQoc2VjdXJlLCBob3N0LCBwb3J0LCBwYXRoLCBrZXkpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNvY2tldCkpIHJldHVybiBuZXcgU29ja2V0KHNlY3VyZSwgaG9zdCwgcG9ydCwgcGF0aCwga2V5KTtcblxuICBFdmVudEVtaXR0ZXIuY2FsbCh0aGlzKTtcblxuICAvLyBEaXNjb25uZWN0ZWQgbWFudWFsbHkuXG4gIHRoaXMuZGlzY29ubmVjdGVkID0gZmFsc2U7XG4gIHRoaXMuX3F1ZXVlID0gW107XG5cbiAgdmFyIGh0dHBQcm90b2NvbCA9IHNlY3VyZSA/ICdodHRwczovLycgOiAnaHR0cDovLyc7XG4gIHZhciB3c1Byb3RvY29sID0gc2VjdXJlID8gJ3dzczovLycgOiAnd3M6Ly8nO1xuICB0aGlzLl9odHRwVXJsID0gaHR0cFByb3RvY29sICsgaG9zdCArICc6JyArIHBvcnQgKyBwYXRoICsga2V5O1xuICB0aGlzLl93c1VybCA9IHdzUHJvdG9jb2wgKyBob3N0ICsgJzonICsgcG9ydCArIHBhdGggKyAncGVlcmpzP2tleT0nICsga2V5O1xufVxuXG51dGlsLmluaGVyaXRzKFNvY2tldCwgRXZlbnRFbWl0dGVyKTtcblxuXG4vKiogQ2hlY2sgaW4gd2l0aCBJRCBvciBnZXQgb25lIGZyb20gc2VydmVyLiAqL1xuU29ja2V0LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGlkLCB0b2tlbikge1xuICB0aGlzLmlkID0gaWQ7XG5cbiAgdGhpcy5faHR0cFVybCArPSAnLycgKyBpZCArICcvJyArIHRva2VuO1xuICB0aGlzLl93c1VybCArPSAnJmlkPScgKyBpZCArICcmdG9rZW49JyArIHRva2VuO1xuXG4gIHRoaXMuX3N0YXJ0WGhyU3RyZWFtKCk7XG4gIHRoaXMuX3N0YXJ0V2ViU29ja2V0KCk7XG59XG5cblxuLyoqIFN0YXJ0IHVwIHdlYnNvY2tldCBjb21tdW5pY2F0aW9ucy4gKi9cblNvY2tldC5wcm90b3R5cGUuX3N0YXJ0V2ViU29ja2V0ID0gZnVuY3Rpb24oaWQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICh0aGlzLl9zb2NrZXQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHRoaXMuX3dzVXJsKTtcblxuICB0aGlzLl9zb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgdXRpbC5sb2coJ0ludmFsaWQgc2VydmVyIG1lc3NhZ2UnLCBldmVudC5kYXRhKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdtZXNzYWdlJywgZGF0YSk7XG4gIH07XG5cbiAgdGhpcy5fc29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHV0aWwubG9nKCdTb2NrZXQgY2xvc2VkLicpO1xuICAgIHNlbGYuZGlzY29ubmVjdGVkID0gdHJ1ZTtcbiAgICBzZWxmLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcpO1xuICB9O1xuXG4gIC8vIFRha2UgY2FyZSBvZiB0aGUgcXVldWUgb2YgY29ubmVjdGlvbnMgaWYgbmVjZXNzYXJ5IGFuZCBtYWtlIHN1cmUgUGVlciBrbm93c1xuICAvLyBzb2NrZXQgaXMgb3Blbi5cbiAgdGhpcy5fc29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChzZWxmLl90aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQoc2VsZi5fdGltZW91dCk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIHNlbGYuX2h0dHAuYWJvcnQoKTtcbiAgICAgICAgc2VsZi5faHR0cCA9IG51bGw7XG4gICAgICB9LCA1MDAwKTtcbiAgICB9XG4gICAgc2VsZi5fc2VuZFF1ZXVlZE1lc3NhZ2VzKCk7XG4gICAgdXRpbC5sb2coJ1NvY2tldCBvcGVuJyk7XG4gIH07XG59XG5cbi8qKiBTdGFydCBYSFIgc3RyZWFtaW5nLiAqL1xuU29ja2V0LnByb3RvdHlwZS5fc3RhcnRYaHJTdHJlYW0gPSBmdW5jdGlvbihuKSB7XG4gIHRyeSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2h0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB0aGlzLl9odHRwLl9pbmRleCA9IDE7XG4gICAgdGhpcy5faHR0cC5fc3RyZWFtSW5kZXggPSBuIHx8IDA7XG4gICAgdGhpcy5faHR0cC5vcGVuKCdwb3N0JywgdGhpcy5faHR0cFVybCArICcvaWQ/aT0nICsgdGhpcy5faHR0cC5fc3RyZWFtSW5kZXgsIHRydWUpO1xuICAgIHRoaXMuX2h0dHAub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gSWYgd2UgZ2V0IGFuIGVycm9yLCBsaWtlbHkgc29tZXRoaW5nIHdlbnQgd3JvbmcuXG4gICAgICAvLyBTdG9wIHN0cmVhbWluZy5cbiAgICAgIGNsZWFyVGltZW91dChzZWxmLl90aW1lb3V0KTtcbiAgICAgIHNlbGYuZW1pdCgnZGlzY29ubmVjdGVkJyk7XG4gICAgfVxuICAgIHRoaXMuX2h0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IDIgJiYgdGhpcy5vbGQpIHtcbiAgICAgICAgdGhpcy5vbGQuYWJvcnQoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMub2xkO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlYWR5U3RhdGUgPiAyICYmIHRoaXMuc3RhdHVzID09PSAyMDAgJiYgdGhpcy5yZXNwb25zZVRleHQpIHtcbiAgICAgICAgc2VsZi5faGFuZGxlU3RyZWFtKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5faHR0cC5zZW5kKG51bGwpO1xuICAgIHRoaXMuX3NldEhUVFBUaW1lb3V0KCk7XG4gIH0gY2F0Y2goZSkge1xuICAgIHV0aWwubG9nKCdYTUxIdHRwUmVxdWVzdCBub3QgYXZhaWxhYmxlOyBkZWZhdWx0aW5nIHRvIFdlYlNvY2tldHMnKTtcbiAgfVxufVxuXG5cbi8qKiBIYW5kbGVzIG9ucmVhZHlzdGF0ZWNoYW5nZSByZXNwb25zZSBhcyBhIHN0cmVhbS4gKi9cblNvY2tldC5wcm90b3R5cGUuX2hhbmRsZVN0cmVhbSA9IGZ1bmN0aW9uKGh0dHApIHtcbiAgLy8gMyBhbmQgNCBhcmUgbG9hZGluZy9kb25lIHN0YXRlLiBBbGwgb3RoZXJzIGFyZSBub3QgcmVsZXZhbnQuXG4gIHZhciBtZXNzYWdlcyA9IGh0dHAucmVzcG9uc2VUZXh0LnNwbGl0KCdcXG4nKTtcblxuICAvLyBDaGVjayB0byBzZWUgaWYgYW55dGhpbmcgbmVlZHMgdG8gYmUgcHJvY2Vzc2VkIG9uIGJ1ZmZlci5cbiAgaWYgKGh0dHAuX2J1ZmZlcikge1xuICAgIHdoaWxlIChodHRwLl9idWZmZXIubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGluZGV4ID0gaHR0cC5fYnVmZmVyLnNoaWZ0KCk7XG4gICAgICB2YXIgYnVmZmVyZWRNZXNzYWdlID0gbWVzc2FnZXNbaW5kZXhdO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYnVmZmVyZWRNZXNzYWdlID0gSlNPTi5wYXJzZShidWZmZXJlZE1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIGh0dHAuX2J1ZmZlci5zaGlmdChpbmRleCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgYnVmZmVyZWRNZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VzW2h0dHAuX2luZGV4XTtcbiAgaWYgKG1lc3NhZ2UpIHtcbiAgICBodHRwLl9pbmRleCArPSAxO1xuICAgIC8vIEJ1ZmZlcmluZy0tdGhpcyBtZXNzYWdlIGlzIGluY29tcGxldGUgYW5kIHdlJ2xsIGdldCB0byBpdCBuZXh0IHRpbWUuXG4gICAgLy8gVGhpcyBjaGVja3MgaWYgdGhlIGh0dHBSZXNwb25zZSBlbmRlZCBpbiBhIGBcXG5gLCBpbiB3aGljaCBjYXNlIHRoZSBsYXN0XG4gICAgLy8gZWxlbWVudCBvZiBtZXNzYWdlcyBzaG91bGQgYmUgdGhlIGVtcHR5IHN0cmluZy5cbiAgICBpZiAoaHR0cC5faW5kZXggPT09IG1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgaWYgKCFodHRwLl9idWZmZXIpIHtcbiAgICAgICAgaHR0cC5fYnVmZmVyID0gW107XG4gICAgICB9XG4gICAgICBodHRwLl9idWZmZXIucHVzaChodHRwLl9pbmRleCAtIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cnkge1xuICAgICAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShtZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB1dGlsLmxvZygnSW52YWxpZCBzZXJ2ZXIgbWVzc2FnZScsIG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBtZXNzYWdlKTtcbiAgICB9XG4gIH1cbn1cblxuU29ja2V0LnByb3RvdHlwZS5fc2V0SFRUUFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICB2YXIgb2xkID0gc2VsZi5faHR0cDtcbiAgICBpZiAoIXNlbGYuX3dzT3BlbigpKSB7XG4gICAgICBzZWxmLl9zdGFydFhoclN0cmVhbShvbGQuX3N0cmVhbUluZGV4ICsgMSk7XG4gICAgICBzZWxmLl9odHRwLm9sZCA9IG9sZDtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkLmFib3J0KCk7XG4gICAgfVxuICB9LCAyNTAwMCk7XG59XG5cbi8qKiBJcyB0aGUgd2Vic29ja2V0IGN1cnJlbnRseSBvcGVuPyAqL1xuU29ja2V0LnByb3RvdHlwZS5fd3NPcGVuID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9zb2NrZXQgJiYgdGhpcy5fc29ja2V0LnJlYWR5U3RhdGUgPT0gMTtcbn1cblxuLyoqIFNlbmQgcXVldWVkIG1lc3NhZ2VzLiAqL1xuU29ja2V0LnByb3RvdHlwZS5fc2VuZFF1ZXVlZE1lc3NhZ2VzID0gZnVuY3Rpb24oKSB7XG4gIGZvciAodmFyIGkgPSAwLCBpaSA9IHRoaXMuX3F1ZXVlLmxlbmd0aDsgaSA8IGlpOyBpICs9IDEpIHtcbiAgICB0aGlzLnNlbmQodGhpcy5fcXVldWVbaV0pO1xuICB9XG59XG5cbi8qKiBFeHBvc2VkIHNlbmQgZm9yIERDICYgUGVlci4gKi9cblNvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgaWYgKHRoaXMuZGlzY29ubmVjdGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgd2UgZGlkbid0IGdldCBhbiBJRCB5ZXQsIHdlIGNhbid0IHlldCBzZW5kIGFueXRoaW5nIHNvIHdlIHNob3VsZCBxdWV1ZVxuICAvLyB1cCB0aGVzZSBtZXNzYWdlcy5cbiAgaWYgKCF0aGlzLmlkKSB7XG4gICAgdGhpcy5fcXVldWUucHVzaChkYXRhKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWRhdGEudHlwZSkge1xuICAgIHRoaXMuZW1pdCgnZXJyb3InLCAnSW52YWxpZCBtZXNzYWdlJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgaWYgKHRoaXMuX3dzT3BlbigpKSB7XG4gICAgdGhpcy5fc29ja2V0LnNlbmQobWVzc2FnZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB2YXIgdXJsID0gdGhpcy5faHR0cFVybCArICcvJyArIGRhdGEudHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgIGh0dHAub3BlbigncG9zdCcsIHVybCwgdHJ1ZSk7XG4gICAgaHR0cC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIGh0dHAuc2VuZChtZXNzYWdlKTtcbiAgfVxufVxuXG5Tb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5kaXNjb25uZWN0ZWQgJiYgdGhpcy5fd3NPcGVuKCkpIHtcbiAgICB0aGlzLl9zb2NrZXQuY2xvc2UoKTtcbiAgICB0aGlzLmRpc2Nvbm5lY3RlZCA9IHRydWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTb2NrZXQ7XG4iLCJ2YXIgZGVmYXVsdENvbmZpZyA9IHsnaWNlU2VydmVycyc6IFt7ICd1cmwnOiAnc3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMicgfV19O1xudmFyIGRhdGFDb3VudCA9IDE7XG5cbnZhciBCaW5hcnlQYWNrID0gcmVxdWlyZSgnanMtYmluYXJ5cGFjaycpO1xudmFyIFJUQ1BlZXJDb25uZWN0aW9uID0gcmVxdWlyZSgnLi9hZGFwdGVyJykuUlRDUGVlckNvbm5lY3Rpb247XG5cbnZhciB1dGlsID0ge1xuICBub29wOiBmdW5jdGlvbigpIHt9LFxuXG4gIENMT1VEX0hPU1Q6ICcwLnBlZXJqcy5jb20nLFxuICBDTE9VRF9QT1JUOiA5MDAwLFxuXG4gIC8vIEJyb3dzZXJzIHRoYXQgbmVlZCBjaHVua2luZzpcbiAgY2h1bmtlZEJyb3dzZXJzOiB7J0Nocm9tZSc6IDF9LFxuICBjaHVua2VkTVRVOiAxNjMwMCwgLy8gVGhlIG9yaWdpbmFsIDYwMDAwIGJ5dGVzIHNldHRpbmcgZG9lcyBub3Qgd29yayB3aGVuIHNlbmRpbmcgZGF0YSBmcm9tIEZpcmVmb3ggdG8gQ2hyb21lLCB3aGljaCBpcyBcImN1dCBvZmZcIiBhZnRlciAxNjM4NCBieXRlcyBhbmQgZGVsaXZlcmVkIGluZGl2aWR1YWxseS5cblxuICAvLyBMb2dnaW5nIGxvZ2ljXG4gIGxvZ0xldmVsOiAwLFxuICBzZXRMb2dMZXZlbDogZnVuY3Rpb24obGV2ZWwpIHtcbiAgICB2YXIgZGVidWdMZXZlbCA9IHBhcnNlSW50KGxldmVsLCAxMCk7XG4gICAgaWYgKCFpc05hTihwYXJzZUludChsZXZlbCwgMTApKSkge1xuICAgICAgdXRpbC5sb2dMZXZlbCA9IGRlYnVnTGV2ZWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHRoZXkgYXJlIHVzaW5nIHRydXRoeS9mYWxzeSB2YWx1ZXMgZm9yIGRlYnVnXG4gICAgICB1dGlsLmxvZ0xldmVsID0gbGV2ZWwgPyAzIDogMDtcbiAgICB9XG4gICAgdXRpbC5sb2cgPSB1dGlsLndhcm4gPSB1dGlsLmVycm9yID0gdXRpbC5ub29wO1xuICAgIGlmICh1dGlsLmxvZ0xldmVsID4gMCkge1xuICAgICAgdXRpbC5lcnJvciA9IHV0aWwuX3ByaW50V2l0aCgnRVJST1InKTtcbiAgICB9XG4gICAgaWYgKHV0aWwubG9nTGV2ZWwgPiAxKSB7XG4gICAgICB1dGlsLndhcm4gPSB1dGlsLl9wcmludFdpdGgoJ1dBUk5JTkcnKTtcbiAgICB9XG4gICAgaWYgKHV0aWwubG9nTGV2ZWwgPiAyKSB7XG4gICAgICB1dGlsLmxvZyA9IHV0aWwuX3ByaW50O1xuICAgIH1cbiAgfSxcbiAgc2V0TG9nRnVuY3Rpb246IGZ1bmN0aW9uKGZuKSB7XG4gICAgaWYgKGZuLmNvbnN0cnVjdG9yICE9PSBGdW5jdGlvbikge1xuICAgICAgdXRpbC53YXJuKCdUaGUgbG9nIGZ1bmN0aW9uIHlvdSBwYXNzZWQgaW4gaXMgbm90IGEgZnVuY3Rpb24uIERlZmF1bHRpbmcgdG8gcmVndWxhciBsb2dzLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1dGlsLl9wcmludCA9IGZuO1xuICAgIH1cbiAgfSxcblxuICBfcHJpbnRXaXRoOiBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29weSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBjb3B5LnVuc2hpZnQocHJlZml4KTtcbiAgICAgIHV0aWwuX3ByaW50LmFwcGx5KHV0aWwsIGNvcHkpO1xuICAgIH07XG4gIH0sXG4gIF9wcmludDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBlcnIgPSBmYWxzZTtcbiAgICB2YXIgY29weSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgY29weS51bnNoaWZ0KCdQZWVySlM6ICcpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY29weS5sZW5ndGg7IGkgPCBsOyBpKyspe1xuICAgICAgaWYgKGNvcHlbaV0gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb3B5W2ldID0gJygnICsgY29weVtpXS5uYW1lICsgJykgJyArIGNvcHlbaV0ubWVzc2FnZTtcbiAgICAgICAgZXJyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXJyID8gY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBjb3B5KSA6IGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGNvcHkpO1xuICB9LFxuICAvL1xuXG4gIC8vIFJldHVybnMgYnJvd3Nlci1hZ25vc3RpYyBkZWZhdWx0IGNvbmZpZ1xuICBkZWZhdWx0Q29uZmlnOiBkZWZhdWx0Q29uZmlnLFxuICAvL1xuXG4gIC8vIFJldHVybnMgdGhlIGN1cnJlbnQgYnJvd3Nlci5cbiAgYnJvd3NlcjogKGZ1bmN0aW9uKCkge1xuICAgIGlmICh3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybiAnRmlyZWZveCc7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybiAnQ2hyb21lJztcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgcmV0dXJuICdTdXBwb3J0ZWQnO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ1Vuc3VwcG9ydGVkJztcbiAgICB9XG4gIH0pKCksXG4gIC8vXG5cbiAgLy8gTGlzdHMgd2hpY2ggZmVhdHVyZXMgYXJlIHN1cHBvcnRlZFxuICBzdXBwb3J0czogKGZ1bmN0aW9uKCkge1xuICAgIGlmICh0eXBlb2YgUlRDUGVlckNvbm5lY3Rpb24gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgdmFyIGRhdGEgPSB0cnVlO1xuICAgIHZhciBhdWRpb1ZpZGVvID0gdHJ1ZTtcblxuICAgIHZhciBiaW5hcnlCbG9iID0gZmFsc2U7XG4gICAgdmFyIHNjdHAgPSBmYWxzZTtcbiAgICB2YXIgb25uZWdvdGlhdGlvbm5lZWRlZCA9ICEhd2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uO1xuXG4gICAgdmFyIHBjLCBkYztcbiAgICB0cnkge1xuICAgICAgcGMgPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oZGVmYXVsdENvbmZpZywge29wdGlvbmFsOiBbe1J0cERhdGFDaGFubmVsczogdHJ1ZX1dfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZGF0YSA9IGZhbHNlO1xuICAgICAgYXVkaW9WaWRlbyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChkYXRhKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYyA9IHBjLmNyZWF0ZURhdGFDaGFubmVsKCdfUEVFUkpTVEVTVCcpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkYXRhID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRhdGEpIHtcbiAgICAgIC8vIEJpbmFyeSB0ZXN0XG4gICAgICB0cnkge1xuICAgICAgICBkYy5iaW5hcnlUeXBlID0gJ2Jsb2InO1xuICAgICAgICBiaW5hcnlCbG9iID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cblxuICAgICAgLy8gUmVsaWFibGUgdGVzdC5cbiAgICAgIC8vIFVuZm9ydHVuYXRlbHkgQ2hyb21lIGlzIGEgYml0IHVucmVsaWFibGUgYWJvdXQgd2hldGhlciBvciBub3QgdGhleVxuICAgICAgLy8gc3VwcG9ydCByZWxpYWJsZS5cbiAgICAgIHZhciByZWxpYWJsZVBDID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKGRlZmF1bHRDb25maWcsIHt9KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByZWxpYWJsZURDID0gcmVsaWFibGVQQy5jcmVhdGVEYXRhQ2hhbm5lbCgnX1BFRVJKU1JFTElBQkxFVEVTVCcsIHt9KTtcbiAgICAgICAgc2N0cCA9IHJlbGlhYmxlREMucmVsaWFibGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZWxpYWJsZVBDLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgLy8gRklYTUU6IG5vdCByZWFsbHkgdGhlIGJlc3QgY2hlY2suLi5cbiAgICBpZiAoYXVkaW9WaWRlbykge1xuICAgICAgYXVkaW9WaWRlbyA9ICEhcGMuYWRkU3RyZWFtO1xuICAgIH1cblxuICAgIC8vIEZJWE1FOiB0aGlzIGlzIG5vdCBncmVhdCBiZWNhdXNlIGluIHRoZW9yeSBpdCBkb2Vzbid0IHdvcmsgZm9yXG4gICAgLy8gYXYtb25seSBicm93c2VycyAoPykuXG4gICAgaWYgKCFvbm5lZ290aWF0aW9ubmVlZGVkICYmIGRhdGEpIHtcbiAgICAgIC8vIHN5bmMgZGVmYXVsdCBjaGVjay5cbiAgICAgIHZhciBuZWdvdGlhdGlvblBDID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKGRlZmF1bHRDb25maWcsIHtvcHRpb25hbDogW3tSdHBEYXRhQ2hhbm5lbHM6IHRydWV9XX0pO1xuICAgICAgbmVnb3RpYXRpb25QQy5vbm5lZ290aWF0aW9ubmVlZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG9ubmVnb3RpYXRpb25uZWVkZWQgPSB0cnVlO1xuICAgICAgICAvLyBhc3luYyBjaGVjay5cbiAgICAgICAgaWYgKHV0aWwgJiYgdXRpbC5zdXBwb3J0cykge1xuICAgICAgICAgIHV0aWwuc3VwcG9ydHMub25uZWdvdGlhdGlvbm5lZWRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBuZWdvdGlhdGlvblBDLmNyZWF0ZURhdGFDaGFubmVsKCdfUEVFUkpTTkVHT1RJQVRJT05URVNUJyk7XG5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIG5lZ290aWF0aW9uUEMuY2xvc2UoKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuICAgIGlmIChwYykge1xuICAgICAgcGMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYXVkaW9WaWRlbzogYXVkaW9WaWRlbyxcbiAgICAgIGRhdGE6IGRhdGEsXG4gICAgICBiaW5hcnlCbG9iOiBiaW5hcnlCbG9iLFxuICAgICAgYmluYXJ5OiBzY3RwLCAvLyBkZXByZWNhdGVkOyBzY3RwIGltcGxpZXMgYmluYXJ5IHN1cHBvcnQuXG4gICAgICByZWxpYWJsZTogc2N0cCwgLy8gZGVwcmVjYXRlZDsgc2N0cCBpbXBsaWVzIHJlbGlhYmxlIGRhdGEuXG4gICAgICBzY3RwOiBzY3RwLFxuICAgICAgb25uZWdvdGlhdGlvbm5lZWRlZDogb25uZWdvdGlhdGlvbm5lZWRlZFxuICAgIH07XG4gIH0oKSksXG4gIC8vXG5cbiAgLy8gRW5zdXJlIGFscGhhbnVtZXJpYyBpZHNcbiAgdmFsaWRhdGVJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAvLyBBbGxvdyBlbXB0eSBpZHNcbiAgICByZXR1cm4gIWlkIHx8IC9eW0EtWmEtejAtOV0rKD86WyBfLV1bQS1aYS16MC05XSspKiQvLmV4ZWMoaWQpO1xuICB9LFxuXG4gIHZhbGlkYXRlS2V5OiBmdW5jdGlvbihrZXkpIHtcbiAgICAvLyBBbGxvdyBlbXB0eSBrZXlzXG4gICAgcmV0dXJuICFrZXkgfHwgL15bQS1aYS16MC05XSsoPzpbIF8tXVtBLVphLXowLTldKykqJC8uZXhlYyhrZXkpO1xuICB9LFxuXG5cbiAgZGVidWc6IGZhbHNlLFxuXG4gIGluaGVyaXRzOiBmdW5jdGlvbihjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvcjtcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGV4dGVuZDogZnVuY3Rpb24oZGVzdCwgc291cmNlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZihzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBkZXN0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlc3Q7XG4gIH0sXG4gIHBhY2s6IEJpbmFyeVBhY2sucGFjayxcbiAgdW5wYWNrOiBCaW5hcnlQYWNrLnVucGFjayxcblxuICBsb2c6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodXRpbC5kZWJ1Zykge1xuICAgICAgdmFyIGVyciA9IGZhbHNlO1xuICAgICAgdmFyIGNvcHkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgY29weS51bnNoaWZ0KCdQZWVySlM6ICcpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb3B5Lmxlbmd0aDsgaSA8IGw7IGkrKyl7XG4gICAgICAgIGlmIChjb3B5W2ldIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICBjb3B5W2ldID0gJygnICsgY29weVtpXS5uYW1lICsgJykgJyArIGNvcHlbaV0ubWVzc2FnZTtcbiAgICAgICAgICBlcnIgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlcnIgPyBjb25zb2xlLmVycm9yLmFwcGx5KGNvbnNvbGUsIGNvcHkpIDogY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgY29weSk7XG4gICAgfVxuICB9LFxuXG4gIHNldFplcm9UaW1lb3V0OiAoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICAgdmFyIHRpbWVvdXRzID0gW107XG4gICAgdmFyIG1lc3NhZ2VOYW1lID0gJ3plcm8tdGltZW91dC1tZXNzYWdlJztcblxuICAgIC8vIExpa2Ugc2V0VGltZW91dCwgYnV0IG9ubHkgdGFrZXMgYSBmdW5jdGlvbiBhcmd1bWVudC5cdCBUaGVyZSdzXG4gICAgLy8gbm8gdGltZSBhcmd1bWVudCAoYWx3YXlzIHplcm8pIGFuZCBubyBhcmd1bWVudHMgKHlvdSBoYXZlIHRvXG4gICAgLy8gdXNlIGEgY2xvc3VyZSkuXG4gICAgZnVuY3Rpb24gc2V0WmVyb1RpbWVvdXRQb3N0TWVzc2FnZShmbikge1xuICAgICAgdGltZW91dHMucHVzaChmbik7XG4gICAgICBnbG9iYWwucG9zdE1lc3NhZ2UobWVzc2FnZU5hbWUsICcqJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnNvdXJjZSA9PSBnbG9iYWwgJiYgZXZlbnQuZGF0YSA9PSBtZXNzYWdlTmFtZSkge1xuICAgICAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpbWVvdXRzLmxlbmd0aCkge1xuICAgICAgICAgIHRpbWVvdXRzLnNoaWZ0KCkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgaGFuZGxlTWVzc2FnZSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChnbG9iYWwuYXR0YWNoRXZlbnQpIHtcbiAgICAgIGdsb2JhbC5hdHRhY2hFdmVudCgnb25tZXNzYWdlJywgaGFuZGxlTWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBzZXRaZXJvVGltZW91dFBvc3RNZXNzYWdlO1xuICB9KHdpbmRvdykpLFxuXG4gIC8vIEJpbmFyeSBzdHVmZlxuXG4gIC8vIGNodW5rcyBhIGJsb2IuXG4gIGNodW5rOiBmdW5jdGlvbihibCkge1xuICAgIHZhciBjaHVua3MgPSBbXTtcbiAgICB2YXIgc2l6ZSA9IGJsLnNpemU7XG4gICAgdmFyIHN0YXJ0ID0gaW5kZXggPSAwO1xuICAgIHZhciB0b3RhbCA9IE1hdGguY2VpbChzaXplIC8gdXRpbC5jaHVua2VkTVRVKTtcbiAgICB3aGlsZSAoc3RhcnQgPCBzaXplKSB7XG4gICAgICB2YXIgZW5kID0gTWF0aC5taW4oc2l6ZSwgc3RhcnQgKyB1dGlsLmNodW5rZWRNVFUpO1xuICAgICAgdmFyIGIgPSBibC5zbGljZShzdGFydCwgZW5kKTtcblxuICAgICAgdmFyIGNodW5rID0ge1xuICAgICAgICBfX3BlZXJEYXRhOiBkYXRhQ291bnQsXG4gICAgICAgIG46IGluZGV4LFxuICAgICAgICBkYXRhOiBiLFxuICAgICAgICB0b3RhbDogdG90YWxcbiAgICAgIH07XG5cbiAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcblxuICAgICAgc3RhcnQgPSBlbmQ7XG4gICAgICBpbmRleCArPSAxO1xuICAgIH1cbiAgICBkYXRhQ291bnQgKz0gMTtcbiAgICByZXR1cm4gY2h1bmtzO1xuICB9LFxuXG4gIGJsb2JUb0FycmF5QnVmZmVyOiBmdW5jdGlvbihibG9iLCBjYil7XG4gICAgdmFyIGZyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICBmci5vbmxvYWQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgIGNiKGV2dC50YXJnZXQucmVzdWx0KTtcbiAgICB9O1xuICAgIGZyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpO1xuICB9LFxuICBibG9iVG9CaW5hcnlTdHJpbmc6IGZ1bmN0aW9uKGJsb2IsIGNiKXtcbiAgICB2YXIgZnIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgIGZyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgY2IoZXZ0LnRhcmdldC5yZXN1bHQpO1xuICAgIH07XG4gICAgZnIucmVhZEFzQmluYXJ5U3RyaW5nKGJsb2IpO1xuICB9LFxuICBiaW5hcnlTdHJpbmdUb0FycmF5QnVmZmVyOiBmdW5jdGlvbihiaW5hcnkpIHtcbiAgICB2YXIgYnl0ZUFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ5dGVBcnJheVtpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpICYgMHhmZjtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVBcnJheS5idWZmZXI7XG4gIH0sXG4gIHJhbmRvbVRva2VuOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKTtcbiAgfSxcbiAgLy9cblxuICBpc1NlY3VyZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm4gW107XG4gIGlmICh0aGlzLl9ldmVudHNbZXZlbnRdLmZuKSByZXR1cm4gW3RoaXMuX2V2ZW50c1tldmVudF0uZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5fZXZlbnRzW2V2ZW50XS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSB0aGlzLl9ldmVudHNbZXZlbnRdW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XS5mbikgdGhpcy5fZXZlbnRzW2V2ZW50XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZlbnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0uZm4pIHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZlbnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2ZW50XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIG9uY2UpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLmZuICYmIChsaXN0ZW5lcnMuZm4gIT09IGZuIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSkpKSB7XG4gICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xuICAgIH1cbiAgICBpZiAoIWxpc3RlbmVycy5mbikgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5mbiAhPT0gZm4gfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKSkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZlbnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2ZW50XTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZlbnRdO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIyID0gRXZlbnRFbWl0dGVyO1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlcjMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbiIsInZhciBCdWZmZXJCdWlsZGVyID0gcmVxdWlyZSgnLi9idWZmZXJidWlsZGVyJykuQnVmZmVyQnVpbGRlcjtcclxudmFyIGJpbmFyeUZlYXR1cmVzID0gcmVxdWlyZSgnLi9idWZmZXJidWlsZGVyJykuYmluYXJ5RmVhdHVyZXM7XHJcblxyXG52YXIgQmluYXJ5UGFjayA9IHtcclxuICB1bnBhY2s6IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgdmFyIHVucGFja2VyID0gbmV3IFVucGFja2VyKGRhdGEpO1xyXG4gICAgcmV0dXJuIHVucGFja2VyLnVucGFjaygpO1xyXG4gIH0sXHJcbiAgcGFjazogZnVuY3Rpb24oZGF0YSl7XHJcbiAgICB2YXIgcGFja2VyID0gbmV3IFBhY2tlcigpO1xyXG4gICAgcGFja2VyLnBhY2soZGF0YSk7XHJcbiAgICB2YXIgYnVmZmVyID0gcGFja2VyLmdldEJ1ZmZlcigpO1xyXG4gICAgcmV0dXJuIGJ1ZmZlcjtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJpbmFyeVBhY2s7XHJcblxyXG5mdW5jdGlvbiBVbnBhY2tlciAoZGF0YSl7XHJcbiAgLy8gRGF0YSBpcyBBcnJheUJ1ZmZlclxyXG4gIHRoaXMuaW5kZXggPSAwO1xyXG4gIHRoaXMuZGF0YUJ1ZmZlciA9IGRhdGE7XHJcbiAgdGhpcy5kYXRhVmlldyA9IG5ldyBVaW50OEFycmF5KHRoaXMuZGF0YUJ1ZmZlcik7XHJcbiAgdGhpcy5sZW5ndGggPSB0aGlzLmRhdGFCdWZmZXIuYnl0ZUxlbmd0aDtcclxufVxyXG5cclxuVW5wYWNrZXIucHJvdG90eXBlLnVucGFjayA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIHR5cGUgPSB0aGlzLnVucGFja191aW50OCgpO1xyXG4gIGlmICh0eXBlIDwgMHg4MCl7XHJcbiAgICB2YXIgcG9zaXRpdmVfZml4bnVtID0gdHlwZTtcclxuICAgIHJldHVybiBwb3NpdGl2ZV9maXhudW07XHJcbiAgfSBlbHNlIGlmICgodHlwZSBeIDB4ZTApIDwgMHgyMCl7XHJcbiAgICB2YXIgbmVnYXRpdmVfZml4bnVtID0gKHR5cGUgXiAweGUwKSAtIDB4MjA7XHJcbiAgICByZXR1cm4gbmVnYXRpdmVfZml4bnVtO1xyXG4gIH1cclxuICB2YXIgc2l6ZTtcclxuICBpZiAoKHNpemUgPSB0eXBlIF4gMHhhMCkgPD0gMHgwZil7XHJcbiAgICByZXR1cm4gdGhpcy51bnBhY2tfcmF3KHNpemUpO1xyXG4gIH0gZWxzZSBpZiAoKHNpemUgPSB0eXBlIF4gMHhiMCkgPD0gMHgwZil7XHJcbiAgICByZXR1cm4gdGhpcy51bnBhY2tfc3RyaW5nKHNpemUpO1xyXG4gIH0gZWxzZSBpZiAoKHNpemUgPSB0eXBlIF4gMHg5MCkgPD0gMHgwZil7XHJcbiAgICByZXR1cm4gdGhpcy51bnBhY2tfYXJyYXkoc2l6ZSk7XHJcbiAgfSBlbHNlIGlmICgoc2l6ZSA9IHR5cGUgXiAweDgwKSA8PSAweDBmKXtcclxuICAgIHJldHVybiB0aGlzLnVucGFja19tYXAoc2l6ZSk7XHJcbiAgfVxyXG4gIHN3aXRjaCh0eXBlKXtcclxuICAgIGNhc2UgMHhjMDpcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICBjYXNlIDB4YzE6XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICBjYXNlIDB4YzI6XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIGNhc2UgMHhjMzpcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBjYXNlIDB4Y2E6XHJcbiAgICAgIHJldHVybiB0aGlzLnVucGFja19mbG9hdCgpO1xyXG4gICAgY2FzZSAweGNiOlxyXG4gICAgICByZXR1cm4gdGhpcy51bnBhY2tfZG91YmxlKCk7XHJcbiAgICBjYXNlIDB4Y2M6XHJcbiAgICAgIHJldHVybiB0aGlzLnVucGFja191aW50OCgpO1xyXG4gICAgY2FzZSAweGNkOlxyXG4gICAgICByZXR1cm4gdGhpcy51bnBhY2tfdWludDE2KCk7XHJcbiAgICBjYXNlIDB4Y2U6XHJcbiAgICAgIHJldHVybiB0aGlzLnVucGFja191aW50MzIoKTtcclxuICAgIGNhc2UgMHhjZjpcclxuICAgICAgcmV0dXJuIHRoaXMudW5wYWNrX3VpbnQ2NCgpO1xyXG4gICAgY2FzZSAweGQwOlxyXG4gICAgICByZXR1cm4gdGhpcy51bnBhY2tfaW50OCgpO1xyXG4gICAgY2FzZSAweGQxOlxyXG4gICAgICByZXR1cm4gdGhpcy51bnBhY2tfaW50MTYoKTtcclxuICAgIGNhc2UgMHhkMjpcclxuICAgICAgcmV0dXJuIHRoaXMudW5wYWNrX2ludDMyKCk7XHJcbiAgICBjYXNlIDB4ZDM6XHJcbiAgICAgIHJldHVybiB0aGlzLnVucGFja19pbnQ2NCgpO1xyXG4gICAgY2FzZSAweGQ0OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgY2FzZSAweGQ1OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgY2FzZSAweGQ2OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgY2FzZSAweGQ3OlxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgY2FzZSAweGQ4OlxyXG4gICAgICBzaXplID0gdGhpcy51bnBhY2tfdWludDE2KCk7XHJcbiAgICAgIHJldHVybiB0aGlzLnVucGFja19zdHJpbmcoc2l6ZSk7XHJcbiAgICBjYXNlIDB4ZDk6XHJcbiAgICAgIHNpemUgPSB0aGlzLnVucGFja191aW50MzIoKTtcclxuICAgICAgcmV0dXJuIHRoaXMudW5wYWNrX3N0cmluZyhzaXplKTtcclxuICAgIGNhc2UgMHhkYTpcclxuICAgICAgc2l6ZSA9IHRoaXMudW5wYWNrX3VpbnQxNigpO1xyXG4gICAgICByZXR1cm4gdGhpcy51bnBhY2tfcmF3KHNpemUpO1xyXG4gICAgY2FzZSAweGRiOlxyXG4gICAgICBzaXplID0gdGhpcy51bnBhY2tfdWludDMyKCk7XHJcbiAgICAgIHJldHVybiB0aGlzLnVucGFja19yYXcoc2l6ZSk7XHJcbiAgICBjYXNlIDB4ZGM6XHJcbiAgICAgIHNpemUgPSB0aGlzLnVucGFja191aW50MTYoKTtcclxuICAgICAgcmV0dXJuIHRoaXMudW5wYWNrX2FycmF5KHNpemUpO1xyXG4gICAgY2FzZSAweGRkOlxyXG4gICAgICBzaXplID0gdGhpcy51bnBhY2tfdWludDMyKCk7XHJcbiAgICAgIHJldHVybiB0aGlzLnVucGFja19hcnJheShzaXplKTtcclxuICAgIGNhc2UgMHhkZTpcclxuICAgICAgc2l6ZSA9IHRoaXMudW5wYWNrX3VpbnQxNigpO1xyXG4gICAgICByZXR1cm4gdGhpcy51bnBhY2tfbWFwKHNpemUpO1xyXG4gICAgY2FzZSAweGRmOlxyXG4gICAgICBzaXplID0gdGhpcy51bnBhY2tfdWludDMyKCk7XHJcbiAgICAgIHJldHVybiB0aGlzLnVucGFja19tYXAoc2l6ZSk7XHJcbiAgfVxyXG59XHJcblxyXG5VbnBhY2tlci5wcm90b3R5cGUudW5wYWNrX3VpbnQ4ID0gZnVuY3Rpb24oKXtcclxuICB2YXIgYnl0ZSA9IHRoaXMuZGF0YVZpZXdbdGhpcy5pbmRleF0gJiAweGZmO1xyXG4gIHRoaXMuaW5kZXgrKztcclxuICByZXR1cm4gYnl0ZTtcclxufTtcclxuXHJcblVucGFja2VyLnByb3RvdHlwZS51bnBhY2tfdWludDE2ID0gZnVuY3Rpb24oKXtcclxuICB2YXIgYnl0ZXMgPSB0aGlzLnJlYWQoMik7XHJcbiAgdmFyIHVpbnQxNiA9XHJcbiAgICAoKGJ5dGVzWzBdICYgMHhmZikgKiAyNTYpICsgKGJ5dGVzWzFdICYgMHhmZik7XHJcbiAgdGhpcy5pbmRleCArPSAyO1xyXG4gIHJldHVybiB1aW50MTY7XHJcbn1cclxuXHJcblVucGFja2VyLnByb3RvdHlwZS51bnBhY2tfdWludDMyID0gZnVuY3Rpb24oKXtcclxuICB2YXIgYnl0ZXMgPSB0aGlzLnJlYWQoNCk7XHJcbiAgdmFyIHVpbnQzMiA9XHJcbiAgICAgKChieXRlc1swXSAgKiAyNTYgK1xyXG4gICAgICAgYnl0ZXNbMV0pICogMjU2ICtcclxuICAgICAgIGJ5dGVzWzJdKSAqIDI1NiArXHJcbiAgICAgICBieXRlc1szXTtcclxuICB0aGlzLmluZGV4ICs9IDQ7XHJcbiAgcmV0dXJuIHVpbnQzMjtcclxufVxyXG5cclxuVW5wYWNrZXIucHJvdG90eXBlLnVucGFja191aW50NjQgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBieXRlcyA9IHRoaXMucmVhZCg4KTtcclxuICB2YXIgdWludDY0ID1cclxuICAgKCgoKCgoYnl0ZXNbMF0gICogMjU2ICtcclxuICAgICAgIGJ5dGVzWzFdKSAqIDI1NiArXHJcbiAgICAgICBieXRlc1syXSkgKiAyNTYgK1xyXG4gICAgICAgYnl0ZXNbM10pICogMjU2ICtcclxuICAgICAgIGJ5dGVzWzRdKSAqIDI1NiArXHJcbiAgICAgICBieXRlc1s1XSkgKiAyNTYgK1xyXG4gICAgICAgYnl0ZXNbNl0pICogMjU2ICtcclxuICAgICAgIGJ5dGVzWzddO1xyXG4gIHRoaXMuaW5kZXggKz0gODtcclxuICByZXR1cm4gdWludDY0O1xyXG59XHJcblxyXG5cclxuVW5wYWNrZXIucHJvdG90eXBlLnVucGFja19pbnQ4ID0gZnVuY3Rpb24oKXtcclxuICB2YXIgdWludDggPSB0aGlzLnVucGFja191aW50OCgpO1xyXG4gIHJldHVybiAodWludDggPCAweDgwICkgPyB1aW50OCA6IHVpbnQ4IC0gKDEgPDwgOCk7XHJcbn07XHJcblxyXG5VbnBhY2tlci5wcm90b3R5cGUudW5wYWNrX2ludDE2ID0gZnVuY3Rpb24oKXtcclxuICB2YXIgdWludDE2ID0gdGhpcy51bnBhY2tfdWludDE2KCk7XHJcbiAgcmV0dXJuICh1aW50MTYgPCAweDgwMDAgKSA/IHVpbnQxNiA6IHVpbnQxNiAtICgxIDw8IDE2KTtcclxufVxyXG5cclxuVW5wYWNrZXIucHJvdG90eXBlLnVucGFja19pbnQzMiA9IGZ1bmN0aW9uKCl7XHJcbiAgdmFyIHVpbnQzMiA9IHRoaXMudW5wYWNrX3VpbnQzMigpO1xyXG4gIHJldHVybiAodWludDMyIDwgTWF0aC5wb3coMiwgMzEpICkgPyB1aW50MzIgOlxyXG4gICAgdWludDMyIC0gTWF0aC5wb3coMiwgMzIpO1xyXG59XHJcblxyXG5VbnBhY2tlci5wcm90b3R5cGUudW5wYWNrX2ludDY0ID0gZnVuY3Rpb24oKXtcclxuICB2YXIgdWludDY0ID0gdGhpcy51bnBhY2tfdWludDY0KCk7XHJcbiAgcmV0dXJuICh1aW50NjQgPCBNYXRoLnBvdygyLCA2MykgKSA/IHVpbnQ2NCA6XHJcbiAgICB1aW50NjQgLSBNYXRoLnBvdygyLCA2NCk7XHJcbn1cclxuXHJcblVucGFja2VyLnByb3RvdHlwZS51bnBhY2tfcmF3ID0gZnVuY3Rpb24oc2l6ZSl7XHJcbiAgaWYgKCB0aGlzLmxlbmd0aCA8IHRoaXMuaW5kZXggKyBzaXplKXtcclxuICAgIHRocm93IG5ldyBFcnJvcignQmluYXJ5UGFja0ZhaWx1cmU6IGluZGV4IGlzIG91dCBvZiByYW5nZSdcclxuICAgICAgKyAnICcgKyB0aGlzLmluZGV4ICsgJyAnICsgc2l6ZSArICcgJyArIHRoaXMubGVuZ3RoKTtcclxuICB9XHJcbiAgdmFyIGJ1ZiA9IHRoaXMuZGF0YUJ1ZmZlci5zbGljZSh0aGlzLmluZGV4LCB0aGlzLmluZGV4ICsgc2l6ZSk7XHJcbiAgdGhpcy5pbmRleCArPSBzaXplO1xyXG5cclxuICAgIC8vYnVmID0gdXRpbC5idWZmZXJUb1N0cmluZyhidWYpO1xyXG5cclxuICByZXR1cm4gYnVmO1xyXG59XHJcblxyXG5VbnBhY2tlci5wcm90b3R5cGUudW5wYWNrX3N0cmluZyA9IGZ1bmN0aW9uKHNpemUpe1xyXG4gIHZhciBieXRlcyA9IHRoaXMucmVhZChzaXplKTtcclxuICB2YXIgaSA9IDAsIHN0ciA9ICcnLCBjLCBjb2RlO1xyXG4gIHdoaWxlKGkgPCBzaXplKXtcclxuICAgIGMgPSBieXRlc1tpXTtcclxuICAgIGlmICggYyA8IDEyOCl7XHJcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpO1xyXG4gICAgICBpKys7XHJcbiAgICB9IGVsc2UgaWYgKChjIF4gMHhjMCkgPCAzMil7XHJcbiAgICAgIGNvZGUgPSAoKGMgXiAweGMwKSA8PCA2KSB8IChieXRlc1tpKzFdICYgNjMpO1xyXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcclxuICAgICAgaSArPSAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29kZSA9ICgoYyAmIDE1KSA8PCAxMikgfCAoKGJ5dGVzW2krMV0gJiA2MykgPDwgNikgfFxyXG4gICAgICAgIChieXRlc1tpKzJdICYgNjMpO1xyXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKTtcclxuICAgICAgaSArPSAzO1xyXG4gICAgfVxyXG4gIH1cclxuICB0aGlzLmluZGV4ICs9IHNpemU7XHJcbiAgcmV0dXJuIHN0cjtcclxufVxyXG5cclxuVW5wYWNrZXIucHJvdG90eXBlLnVucGFja19hcnJheSA9IGZ1bmN0aW9uKHNpemUpe1xyXG4gIHZhciBvYmplY3RzID0gbmV3IEFycmF5KHNpemUpO1xyXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBzaXplIDsgaSsrKXtcclxuICAgIG9iamVjdHNbaV0gPSB0aGlzLnVucGFjaygpO1xyXG4gIH1cclxuICByZXR1cm4gb2JqZWN0cztcclxufVxyXG5cclxuVW5wYWNrZXIucHJvdG90eXBlLnVucGFja19tYXAgPSBmdW5jdGlvbihzaXplKXtcclxuICB2YXIgbWFwID0ge307XHJcbiAgZm9yKHZhciBpID0gMDsgaSA8IHNpemUgOyBpKyspe1xyXG4gICAgdmFyIGtleSAgPSB0aGlzLnVucGFjaygpO1xyXG4gICAgdmFyIHZhbHVlID0gdGhpcy51bnBhY2soKTtcclxuICAgIG1hcFtrZXldID0gdmFsdWU7XHJcbiAgfVxyXG4gIHJldHVybiBtYXA7XHJcbn1cclxuXHJcblVucGFja2VyLnByb3RvdHlwZS51bnBhY2tfZmxvYXQgPSBmdW5jdGlvbigpe1xyXG4gIHZhciB1aW50MzIgPSB0aGlzLnVucGFja191aW50MzIoKTtcclxuICB2YXIgc2lnbiA9IHVpbnQzMiA+PiAzMTtcclxuICB2YXIgZXhwICA9ICgodWludDMyID4+IDIzKSAmIDB4ZmYpIC0gMTI3O1xyXG4gIHZhciBmcmFjdGlvbiA9ICggdWludDMyICYgMHg3ZmZmZmYgKSB8IDB4ODAwMDAwO1xyXG4gIHJldHVybiAoc2lnbiA9PSAwID8gMSA6IC0xKSAqXHJcbiAgICBmcmFjdGlvbiAqIE1hdGgucG93KDIsIGV4cCAtIDIzKTtcclxufVxyXG5cclxuVW5wYWNrZXIucHJvdG90eXBlLnVucGFja19kb3VibGUgPSBmdW5jdGlvbigpe1xyXG4gIHZhciBoMzIgPSB0aGlzLnVucGFja191aW50MzIoKTtcclxuICB2YXIgbDMyID0gdGhpcy51bnBhY2tfdWludDMyKCk7XHJcbiAgdmFyIHNpZ24gPSBoMzIgPj4gMzE7XHJcbiAgdmFyIGV4cCAgPSAoKGgzMiA+PiAyMCkgJiAweDdmZikgLSAxMDIzO1xyXG4gIHZhciBoZnJhYyA9ICggaDMyICYgMHhmZmZmZiApIHwgMHgxMDAwMDA7XHJcbiAgdmFyIGZyYWMgPSBoZnJhYyAqIE1hdGgucG93KDIsIGV4cCAtIDIwKSArXHJcbiAgICBsMzIgICAqIE1hdGgucG93KDIsIGV4cCAtIDUyKTtcclxuICByZXR1cm4gKHNpZ24gPT0gMCA/IDEgOiAtMSkgKiBmcmFjO1xyXG59XHJcblxyXG5VbnBhY2tlci5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKGxlbmd0aCl7XHJcbiAgdmFyIGogPSB0aGlzLmluZGV4O1xyXG4gIGlmIChqICsgbGVuZ3RoIDw9IHRoaXMubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kYXRhVmlldy5zdWJhcnJheShqLCBqICsgbGVuZ3RoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCaW5hcnlQYWNrRmFpbHVyZTogcmVhZCBpbmRleCBvdXQgb2YgcmFuZ2UnKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFBhY2tlcigpe1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlciA9IG5ldyBCdWZmZXJCdWlsZGVyKCk7XHJcbn1cclxuXHJcblBhY2tlci5wcm90b3R5cGUuZ2V0QnVmZmVyID0gZnVuY3Rpb24oKXtcclxuICByZXR1cm4gdGhpcy5idWZmZXJCdWlsZGVyLmdldEJ1ZmZlcigpO1xyXG59XHJcblxyXG5QYWNrZXIucHJvdG90eXBlLnBhY2sgPSBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgdmFyIHR5cGUgPSB0eXBlb2YodmFsdWUpO1xyXG4gIGlmICh0eXBlID09ICdzdHJpbmcnKXtcclxuICAgIHRoaXMucGFja19zdHJpbmcodmFsdWUpO1xyXG4gIH0gZWxzZSBpZiAodHlwZSA9PSAnbnVtYmVyJyl7XHJcbiAgICBpZiAoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlKXtcclxuICAgICAgdGhpcy5wYWNrX2ludGVnZXIodmFsdWUpO1xyXG4gICAgfSBlbHNle1xyXG4gICAgICB0aGlzLnBhY2tfZG91YmxlKHZhbHVlKTtcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKHR5cGUgPT0gJ2Jvb2xlYW4nKXtcclxuICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSl7XHJcbiAgICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhjMyk7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBmYWxzZSl7XHJcbiAgICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhjMik7XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmICh0eXBlID09ICd1bmRlZmluZWQnKXtcclxuICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhjMCk7XHJcbiAgfSBlbHNlIGlmICh0eXBlID09ICdvYmplY3QnKXtcclxuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCl7XHJcbiAgICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhjMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgY29uc3RydWN0b3IgPSB2YWx1ZS5jb25zdHJ1Y3RvcjtcclxuICAgICAgaWYgKGNvbnN0cnVjdG9yID09IEFycmF5KXtcclxuICAgICAgICB0aGlzLnBhY2tfYXJyYXkodmFsdWUpO1xyXG4gICAgICB9IGVsc2UgaWYgKGNvbnN0cnVjdG9yID09IEJsb2IgfHwgY29uc3RydWN0b3IgPT0gRmlsZSkge1xyXG4gICAgICAgIHRoaXMucGFja19iaW4odmFsdWUpO1xyXG4gICAgICB9IGVsc2UgaWYgKGNvbnN0cnVjdG9yID09IEFycmF5QnVmZmVyKSB7XHJcbiAgICAgICAgaWYoYmluYXJ5RmVhdHVyZXMudXNlQXJyYXlCdWZmZXJWaWV3KSB7XHJcbiAgICAgICAgICB0aGlzLnBhY2tfYmluKG5ldyBVaW50OEFycmF5KHZhbHVlKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucGFja19iaW4odmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmICgnQllURVNfUEVSX0VMRU1FTlQnIGluIHZhbHVlKXtcclxuICAgICAgICBpZihiaW5hcnlGZWF0dXJlcy51c2VBcnJheUJ1ZmZlclZpZXcpIHtcclxuICAgICAgICAgIHRoaXMucGFja19iaW4obmV3IFVpbnQ4QXJyYXkodmFsdWUuYnVmZmVyKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucGFja19iaW4odmFsdWUuYnVmZmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoY29uc3RydWN0b3IgPT0gT2JqZWN0KXtcclxuICAgICAgICB0aGlzLnBhY2tfb2JqZWN0KHZhbHVlKTtcclxuICAgICAgfSBlbHNlIGlmIChjb25zdHJ1Y3RvciA9PSBEYXRlKXtcclxuICAgICAgICB0aGlzLnBhY2tfc3RyaW5nKHZhbHVlLnRvU3RyaW5nKCkpO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS50b0JpbmFyeVBhY2sgPT0gJ2Z1bmN0aW9uJyl7XHJcbiAgICAgICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCh2YWx1ZS50b0JpbmFyeVBhY2soKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUeXBlIFwiJyArIGNvbnN0cnVjdG9yLnRvU3RyaW5nKCkgKyAnXCIgbm90IHlldCBzdXBwb3J0ZWQnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1R5cGUgXCInICsgdHlwZSArICdcIiBub3QgeWV0IHN1cHBvcnRlZCcpO1xyXG4gIH1cclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuZmx1c2goKTtcclxufVxyXG5cclxuXHJcblBhY2tlci5wcm90b3R5cGUucGFja19iaW4gPSBmdW5jdGlvbihibG9iKXtcclxuICB2YXIgbGVuZ3RoID0gYmxvYi5sZW5ndGggfHwgYmxvYi5ieXRlTGVuZ3RoIHx8IGJsb2Iuc2l6ZTtcclxuICBpZiAobGVuZ3RoIDw9IDB4MGYpe1xyXG4gICAgdGhpcy5wYWNrX3VpbnQ4KDB4YTAgKyBsZW5ndGgpO1xyXG4gIH0gZWxzZSBpZiAobGVuZ3RoIDw9IDB4ZmZmZil7XHJcbiAgICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKDB4ZGEpIDtcclxuICAgIHRoaXMucGFja191aW50MTYobGVuZ3RoKTtcclxuICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAweGZmZmZmZmZmKXtcclxuICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhkYik7XHJcbiAgICB0aGlzLnBhY2tfdWludDMyKGxlbmd0aCk7XHJcbiAgfSBlbHNle1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGxlbmd0aCcpO1xyXG4gIH1cclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKGJsb2IpO1xyXG59XHJcblxyXG5QYWNrZXIucHJvdG90eXBlLnBhY2tfc3RyaW5nID0gZnVuY3Rpb24oc3RyKXtcclxuICB2YXIgbGVuZ3RoID0gdXRmOExlbmd0aChzdHIpO1xyXG5cclxuICBpZiAobGVuZ3RoIDw9IDB4MGYpe1xyXG4gICAgdGhpcy5wYWNrX3VpbnQ4KDB4YjAgKyBsZW5ndGgpO1xyXG4gIH0gZWxzZSBpZiAobGVuZ3RoIDw9IDB4ZmZmZil7XHJcbiAgICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKDB4ZDgpIDtcclxuICAgIHRoaXMucGFja191aW50MTYobGVuZ3RoKTtcclxuICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAweGZmZmZmZmZmKXtcclxuICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhkOSk7XHJcbiAgICB0aGlzLnBhY2tfdWludDMyKGxlbmd0aCk7XHJcbiAgfSBlbHNle1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGxlbmd0aCcpO1xyXG4gIH1cclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKHN0cik7XHJcbn1cclxuXHJcblBhY2tlci5wcm90b3R5cGUucGFja19hcnJheSA9IGZ1bmN0aW9uKGFyeSl7XHJcbiAgdmFyIGxlbmd0aCA9IGFyeS5sZW5ndGg7XHJcbiAgaWYgKGxlbmd0aCA8PSAweDBmKXtcclxuICAgIHRoaXMucGFja191aW50OCgweDkwICsgbGVuZ3RoKTtcclxuICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAweGZmZmYpe1xyXG4gICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCgweGRjKVxyXG4gICAgdGhpcy5wYWNrX3VpbnQxNihsZW5ndGgpO1xyXG4gIH0gZWxzZSBpZiAobGVuZ3RoIDw9IDB4ZmZmZmZmZmYpe1xyXG4gICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCgweGRkKTtcclxuICAgIHRoaXMucGFja191aW50MzIobGVuZ3RoKTtcclxuICB9IGVsc2V7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbGVuZ3RoJyk7XHJcbiAgfVxyXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBsZW5ndGggOyBpKyspe1xyXG4gICAgdGhpcy5wYWNrKGFyeVtpXSk7XHJcbiAgfVxyXG59XHJcblxyXG5QYWNrZXIucHJvdG90eXBlLnBhY2tfaW50ZWdlciA9IGZ1bmN0aW9uKG51bSl7XHJcbiAgaWYgKCAtMHgyMCA8PSBudW0gJiYgbnVtIDw9IDB4N2Ype1xyXG4gICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZChudW0gJiAweGZmKTtcclxuICB9IGVsc2UgaWYgKDB4MDAgPD0gbnVtICYmIG51bSA8PSAweGZmKXtcclxuICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhjYyk7XHJcbiAgICB0aGlzLnBhY2tfdWludDgobnVtKTtcclxuICB9IGVsc2UgaWYgKC0weDgwIDw9IG51bSAmJiBudW0gPD0gMHg3Zil7XHJcbiAgICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKDB4ZDApO1xyXG4gICAgdGhpcy5wYWNrX2ludDgobnVtKTtcclxuICB9IGVsc2UgaWYgKCAweDAwMDAgPD0gbnVtICYmIG51bSA8PSAweGZmZmYpe1xyXG4gICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCgweGNkKTtcclxuICAgIHRoaXMucGFja191aW50MTYobnVtKTtcclxuICB9IGVsc2UgaWYgKC0weDgwMDAgPD0gbnVtICYmIG51bSA8PSAweDdmZmYpe1xyXG4gICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCgweGQxKTtcclxuICAgIHRoaXMucGFja19pbnQxNihudW0pO1xyXG4gIH0gZWxzZSBpZiAoIDB4MDAwMDAwMDAgPD0gbnVtICYmIG51bSA8PSAweGZmZmZmZmZmKXtcclxuICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhjZSk7XHJcbiAgICB0aGlzLnBhY2tfdWludDMyKG51bSk7XHJcbiAgfSBlbHNlIGlmICgtMHg4MDAwMDAwMCA8PSBudW0gJiYgbnVtIDw9IDB4N2ZmZmZmZmYpe1xyXG4gICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCgweGQyKTtcclxuICAgIHRoaXMucGFja19pbnQzMihudW0pO1xyXG4gIH0gZWxzZSBpZiAoLTB4ODAwMDAwMDAwMDAwMDAwMCA8PSBudW0gJiYgbnVtIDw9IDB4N0ZGRkZGRkZGRkZGRkZGRil7XHJcbiAgICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKDB4ZDMpO1xyXG4gICAgdGhpcy5wYWNrX2ludDY0KG51bSk7XHJcbiAgfSBlbHNlIGlmICgweDAwMDAwMDAwMDAwMDAwMDAgPD0gbnVtICYmIG51bSA8PSAweEZGRkZGRkZGRkZGRkZGRkYpe1xyXG4gICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCgweGNmKTtcclxuICAgIHRoaXMucGFja191aW50NjQobnVtKTtcclxuICB9IGVsc2V7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW50ZWdlcicpO1xyXG4gIH1cclxufVxyXG5cclxuUGFja2VyLnByb3RvdHlwZS5wYWNrX2RvdWJsZSA9IGZ1bmN0aW9uKG51bSl7XHJcbiAgdmFyIHNpZ24gPSAwO1xyXG4gIGlmIChudW0gPCAwKXtcclxuICAgIHNpZ24gPSAxO1xyXG4gICAgbnVtID0gLW51bTtcclxuICB9XHJcbiAgdmFyIGV4cCAgPSBNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLkxOMik7XHJcbiAgdmFyIGZyYWMwID0gbnVtIC8gTWF0aC5wb3coMiwgZXhwKSAtIDE7XHJcbiAgdmFyIGZyYWMxID0gTWF0aC5mbG9vcihmcmFjMCAqIE1hdGgucG93KDIsIDUyKSk7XHJcbiAgdmFyIGIzMiAgID0gTWF0aC5wb3coMiwgMzIpO1xyXG4gIHZhciBoMzIgPSAoc2lnbiA8PCAzMSkgfCAoKGV4cCsxMDIzKSA8PCAyMCkgfFxyXG4gICAgICAoZnJhYzEgLyBiMzIpICYgMHgwZmZmZmY7XHJcbiAgdmFyIGwzMiA9IGZyYWMxICUgYjMyO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhjYik7XHJcbiAgdGhpcy5wYWNrX2ludDMyKGgzMik7XHJcbiAgdGhpcy5wYWNrX2ludDMyKGwzMik7XHJcbn1cclxuXHJcblBhY2tlci5wcm90b3R5cGUucGFja19vYmplY3QgPSBmdW5jdGlvbihvYmope1xyXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcclxuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XHJcbiAgaWYgKGxlbmd0aCA8PSAweDBmKXtcclxuICAgIHRoaXMucGFja191aW50OCgweDgwICsgbGVuZ3RoKTtcclxuICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAweGZmZmYpe1xyXG4gICAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCgweGRlKTtcclxuICAgIHRoaXMucGFja191aW50MTYobGVuZ3RoKTtcclxuICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAweGZmZmZmZmZmKXtcclxuICAgIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoMHhkZik7XHJcbiAgICB0aGlzLnBhY2tfdWludDMyKGxlbmd0aCk7XHJcbiAgfSBlbHNle1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGxlbmd0aCcpO1xyXG4gIH1cclxuICBmb3IodmFyIHByb3AgaW4gb2JqKXtcclxuICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpe1xyXG4gICAgICB0aGlzLnBhY2socHJvcCk7XHJcbiAgICAgIHRoaXMucGFjayhvYmpbcHJvcF0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuUGFja2VyLnByb3RvdHlwZS5wYWNrX3VpbnQ4ID0gZnVuY3Rpb24obnVtKXtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKG51bSk7XHJcbn1cclxuXHJcblBhY2tlci5wcm90b3R5cGUucGFja191aW50MTYgPSBmdW5jdGlvbihudW0pe1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQobnVtID4+IDgpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQobnVtICYgMHhmZik7XHJcbn1cclxuXHJcblBhY2tlci5wcm90b3R5cGUucGFja191aW50MzIgPSBmdW5jdGlvbihudW0pe1xyXG4gIHZhciBuID0gbnVtICYgMHhmZmZmZmZmZjtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChuICYgMHhmZjAwMDAwMCkgPj4+IDI0KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChuICYgMHgwMGZmMDAwMCkgPj4+IDE2KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChuICYgMHgwMDAwZmYwMCkgPj4+ICA4KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChuICYgMHgwMDAwMDBmZikpO1xyXG59XHJcblxyXG5QYWNrZXIucHJvdG90eXBlLnBhY2tfdWludDY0ID0gZnVuY3Rpb24obnVtKXtcclxuICB2YXIgaGlnaCA9IG51bSAvIE1hdGgucG93KDIsIDMyKTtcclxuICB2YXIgbG93ICA9IG51bSAlIE1hdGgucG93KDIsIDMyKTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChoaWdoICYgMHhmZjAwMDAwMCkgPj4+IDI0KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChoaWdoICYgMHgwMGZmMDAwMCkgPj4+IDE2KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChoaWdoICYgMHgwMDAwZmYwMCkgPj4+ICA4KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChoaWdoICYgMHgwMDAwMDBmZikpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKGxvdyAgJiAweGZmMDAwMDAwKSA+Pj4gMjQpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKGxvdyAgJiAweDAwZmYwMDAwKSA+Pj4gMTYpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKGxvdyAgJiAweDAwMDBmZjAwKSA+Pj4gIDgpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKGxvdyAgJiAweDAwMDAwMGZmKSk7XHJcbn1cclxuXHJcblBhY2tlci5wcm90b3R5cGUucGFja19pbnQ4ID0gZnVuY3Rpb24obnVtKXtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKG51bSAmIDB4ZmYpO1xyXG59XHJcblxyXG5QYWNrZXIucHJvdG90eXBlLnBhY2tfaW50MTYgPSBmdW5jdGlvbihudW0pe1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKG51bSAmIDB4ZmYwMCkgPj4gOCk7XHJcbiAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZChudW0gJiAweGZmKTtcclxufVxyXG5cclxuUGFja2VyLnByb3RvdHlwZS5wYWNrX2ludDMyID0gZnVuY3Rpb24obnVtKXtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChudW0gPj4+IDI0KSAmIDB4ZmYpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKG51bSAmIDB4MDBmZjAwMDApID4+PiAxNik7XHJcbiAgdGhpcy5idWZmZXJCdWlsZGVyLmFwcGVuZCgobnVtICYgMHgwMDAwZmYwMCkgPj4+IDgpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKG51bSAmIDB4MDAwMDAwZmYpKTtcclxufVxyXG5cclxuUGFja2VyLnByb3RvdHlwZS5wYWNrX2ludDY0ID0gZnVuY3Rpb24obnVtKXtcclxuICB2YXIgaGlnaCA9IE1hdGguZmxvb3IobnVtIC8gTWF0aC5wb3coMiwgMzIpKTtcclxuICB2YXIgbG93ICA9IG51bSAlIE1hdGgucG93KDIsIDMyKTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChoaWdoICYgMHhmZjAwMDAwMCkgPj4+IDI0KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChoaWdoICYgMHgwMGZmMDAwMCkgPj4+IDE2KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChoaWdoICYgMHgwMDAwZmYwMCkgPj4+ICA4KTtcclxuICB0aGlzLmJ1ZmZlckJ1aWxkZXIuYXBwZW5kKChoaWdoICYgMHgwMDAwMDBmZikpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKGxvdyAgJiAweGZmMDAwMDAwKSA+Pj4gMjQpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKGxvdyAgJiAweDAwZmYwMDAwKSA+Pj4gMTYpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKGxvdyAgJiAweDAwMDBmZjAwKSA+Pj4gIDgpO1xyXG4gIHRoaXMuYnVmZmVyQnVpbGRlci5hcHBlbmQoKGxvdyAgJiAweDAwMDAwMGZmKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF91dGY4UmVwbGFjZShtKXtcclxuICB2YXIgY29kZSA9IG0uY2hhckNvZGVBdCgwKTtcclxuXHJcbiAgaWYoY29kZSA8PSAweDdmZikgcmV0dXJuICcwMCc7XHJcbiAgaWYoY29kZSA8PSAweGZmZmYpIHJldHVybiAnMDAwJztcclxuICBpZihjb2RlIDw9IDB4MWZmZmZmKSByZXR1cm4gJzAwMDAnO1xyXG4gIGlmKGNvZGUgPD0gMHgzZmZmZmZmKSByZXR1cm4gJzAwMDAwJztcclxuICByZXR1cm4gJzAwMDAwMCc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHV0ZjhMZW5ndGgoc3RyKXtcclxuICBpZiAoc3RyLmxlbmd0aCA+IDYwMCkge1xyXG4gICAgLy8gQmxvYiBtZXRob2QgZmFzdGVyIGZvciBsYXJnZSBzdHJpbmdzXHJcbiAgICByZXR1cm4gKG5ldyBCbG9iKFtzdHJdKSkuc2l6ZTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXlxcdTAwMDAtXFx1MDA3Rl0vZywgX3V0ZjhSZXBsYWNlKS5sZW5ndGg7XHJcbiAgfVxyXG59XHJcbiIsInZhciBiaW5hcnlGZWF0dXJlcyA9IHt9O1xyXG5iaW5hcnlGZWF0dXJlcy51c2VCbG9iQnVpbGRlciA9IChmdW5jdGlvbigpe1xyXG4gIHRyeSB7XHJcbiAgICBuZXcgQmxvYihbXSk7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59KSgpO1xyXG5cclxuYmluYXJ5RmVhdHVyZXMudXNlQXJyYXlCdWZmZXJWaWV3ID0gIWJpbmFyeUZlYXR1cmVzLnVzZUJsb2JCdWlsZGVyICYmIChmdW5jdGlvbigpe1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gKG5ldyBCbG9iKFtuZXcgVWludDhBcnJheShbXSldKSkuc2l6ZSA9PT0gMDtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn0pKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5iaW5hcnlGZWF0dXJlcyA9IGJpbmFyeUZlYXR1cmVzO1xyXG52YXIgQmxvYkJ1aWxkZXIgPSBtb2R1bGUuZXhwb3J0cy5CbG9iQnVpbGRlcjtcclxuaWYgKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICBCbG9iQnVpbGRlciA9IG1vZHVsZS5leHBvcnRzLkJsb2JCdWlsZGVyID0gd2luZG93LldlYktpdEJsb2JCdWlsZGVyIHx8XHJcbiAgICB3aW5kb3cuTW96QmxvYkJ1aWxkZXIgfHwgd2luZG93Lk1TQmxvYkJ1aWxkZXIgfHwgd2luZG93LkJsb2JCdWlsZGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBCdWZmZXJCdWlsZGVyKCl7XHJcbiAgdGhpcy5fcGllY2VzID0gW107XHJcbiAgdGhpcy5fcGFydHMgPSBbXTtcclxufVxyXG5cclxuQnVmZmVyQnVpbGRlci5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gIGlmKHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJykge1xyXG4gICAgdGhpcy5fcGllY2VzLnB1c2goZGF0YSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuZmx1c2goKTtcclxuICAgIHRoaXMuX3BhcnRzLnB1c2goZGF0YSk7XHJcbiAgfVxyXG59O1xyXG5cclxuQnVmZmVyQnVpbGRlci5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbigpIHtcclxuICBpZiAodGhpcy5fcGllY2VzLmxlbmd0aCA+IDApIHtcclxuICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLl9waWVjZXMpO1xyXG4gICAgaWYoIWJpbmFyeUZlYXR1cmVzLnVzZUFycmF5QnVmZmVyVmlldykge1xyXG4gICAgICBidWYgPSBidWYuYnVmZmVyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcGFydHMucHVzaChidWYpO1xyXG4gICAgdGhpcy5fcGllY2VzID0gW107XHJcbiAgfVxyXG59O1xyXG5cclxuQnVmZmVyQnVpbGRlci5wcm90b3R5cGUuZ2V0QnVmZmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5mbHVzaCgpO1xyXG4gIGlmKGJpbmFyeUZlYXR1cmVzLnVzZUJsb2JCdWlsZGVyKSB7XHJcbiAgICB2YXIgYnVpbGRlciA9IG5ldyBCbG9iQnVpbGRlcigpO1xyXG4gICAgZm9yKHZhciBpID0gMCwgaWkgPSB0aGlzLl9wYXJ0cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XHJcbiAgICAgIGJ1aWxkZXIuYXBwZW5kKHRoaXMuX3BhcnRzW2ldKTtcclxuICAgIH1cclxuICAgIHJldHVybiBidWlsZGVyLmdldEJsb2IoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIG5ldyBCbG9iKHRoaXMuX3BhcnRzKTtcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5CdWZmZXJCdWlsZGVyID0gQnVmZmVyQnVpbGRlcjtcclxuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuLyoqXG4gKiBSZWxpYWJsZSB0cmFuc2ZlciBmb3IgQ2hyb21lIENhbmFyeSBEYXRhQ2hhbm5lbCBpbXBsLlxuICogQXV0aG9yOiBAbWljaGVsbGVidVxuICovXG5mdW5jdGlvbiBSZWxpYWJsZShkYywgZGVidWcpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlbGlhYmxlKSkgcmV0dXJuIG5ldyBSZWxpYWJsZShkYyk7XG4gIHRoaXMuX2RjID0gZGM7XG5cbiAgdXRpbC5kZWJ1ZyA9IGRlYnVnO1xuXG4gIC8vIE1lc3NhZ2VzIHNlbnQvcmVjZWl2ZWQgc28gZmFyLlxuICAvLyBpZDogeyBhY2s6IG4sIGNodW5rczogWy4uLl0gfVxuICB0aGlzLl9vdXRnb2luZyA9IHt9O1xuICAvLyBpZDogeyBhY2s6IFsnYWNrJywgaWQsIG5dLCBjaHVua3M6IFsuLi5dIH1cbiAgdGhpcy5faW5jb21pbmcgPSB7fTtcbiAgdGhpcy5fcmVjZWl2ZWQgPSB7fTtcblxuICAvLyBXaW5kb3cgc2l6ZS5cbiAgdGhpcy5fd2luZG93ID0gMTAwMDtcbiAgLy8gTVRVLlxuICB0aGlzLl9tdHUgPSA1MDA7XG4gIC8vIEludGVydmFsIGZvciBzZXRJbnRlcnZhbC4gSW4gbXMuXG4gIHRoaXMuX2ludGVydmFsID0gMDtcblxuICAvLyBNZXNzYWdlcyBzZW50LlxuICB0aGlzLl9jb3VudCA9IDA7XG5cbiAgLy8gT3V0Z29pbmcgbWVzc2FnZSBxdWV1ZS5cbiAgdGhpcy5fcXVldWUgPSBbXTtcblxuICB0aGlzLl9zZXR1cERDKCk7XG59O1xuXG4vLyBTZW5kIGEgbWVzc2FnZSByZWxpYWJseS5cblJlbGlhYmxlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24obXNnKSB7XG4gIC8vIERldGVybWluZSBpZiBjaHVua2luZyBpcyBuZWNlc3NhcnkuXG4gIHZhciBibCA9IHV0aWwucGFjayhtc2cpO1xuICBpZiAoYmwuc2l6ZSA8IHRoaXMuX210dSkge1xuICAgIHRoaXMuX2hhbmRsZVNlbmQoWydubycsIGJsXSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fb3V0Z29pbmdbdGhpcy5fY291bnRdID0ge1xuICAgIGFjazogMCxcbiAgICBjaHVua3M6IHRoaXMuX2NodW5rKGJsKVxuICB9O1xuXG4gIGlmICh1dGlsLmRlYnVnKSB7XG4gICAgdGhpcy5fb3V0Z29pbmdbdGhpcy5fY291bnRdLnRpbWVyID0gbmV3IERhdGUoKTtcbiAgfVxuXG4gIC8vIFNlbmQgcHJlbGltIHdpbmRvdy5cbiAgdGhpcy5fc2VuZFdpbmRvd2VkQ2h1bmtzKHRoaXMuX2NvdW50KTtcbiAgdGhpcy5fY291bnQgKz0gMTtcbn07XG5cbi8vIFNldCB1cCBpbnRlcnZhbCBmb3IgcHJvY2Vzc2luZyBxdWV1ZS5cblJlbGlhYmxlLnByb3RvdHlwZS5fc2V0dXBJbnRlcnZhbCA9IGZ1bmN0aW9uKCkge1xuICAvLyBUT0RPOiBmYWlsIGdyYWNlZnVsbHkuXG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl90aW1lb3V0ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgLy8gRklYTUU6IFN0cmluZyBzdHVmZiBtYWtlcyB0aGluZ3MgdGVycmlibHkgYXN5bmMuXG4gICAgdmFyIG1zZyA9IHNlbGYuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgaWYgKG1zZy5fbXVsdGlwbGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IG1zZy5sZW5ndGg7IGkgPCBpaTsgaSArPSAxKSB7XG4gICAgICAgIHNlbGYuX2ludGVydmFsU2VuZChtc2dbaV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLl9pbnRlcnZhbFNlbmQobXNnKTtcbiAgICB9XG4gIH0sIHRoaXMuX2ludGVydmFsKTtcbn07XG5cblJlbGlhYmxlLnByb3RvdHlwZS5faW50ZXJ2YWxTZW5kID0gZnVuY3Rpb24obXNnKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgbXNnID0gdXRpbC5wYWNrKG1zZyk7XG4gIHV0aWwuYmxvYlRvQmluYXJ5U3RyaW5nKG1zZywgZnVuY3Rpb24oc3RyKSB7XG4gICAgc2VsZi5fZGMuc2VuZChzdHIpO1xuICB9KTtcbiAgaWYgKHNlbGYuX3F1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgIGNsZWFyVGltZW91dChzZWxmLl90aW1lb3V0KTtcbiAgICBzZWxmLl90aW1lb3V0ID0gbnVsbDtcbiAgICAvL3NlbGYuX3Byb2Nlc3NBY2tzKCk7XG4gIH1cbn07XG5cbi8vIEdvIHRocm91Z2ggQUNLcyB0byBzZW5kIG1pc3NpbmcgcGllY2VzLlxuUmVsaWFibGUucHJvdG90eXBlLl9wcm9jZXNzQWNrcyA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpZCBpbiB0aGlzLl9vdXRnb2luZykge1xuICAgIGlmICh0aGlzLl9vdXRnb2luZy5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgIHRoaXMuX3NlbmRXaW5kb3dlZENodW5rcyhpZCk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBIYW5kbGUgc2VuZGluZyBhIG1lc3NhZ2UuXG4vLyBGSVhNRTogRG9uJ3Qgd2FpdCBmb3IgaW50ZXJ2YWwgdGltZSBmb3IgYWxsIG1lc3NhZ2VzLi4uXG5SZWxpYWJsZS5wcm90b3R5cGUuX2hhbmRsZVNlbmQgPSBmdW5jdGlvbihtc2cpIHtcbiAgdmFyIHB1c2ggPSB0cnVlO1xuICBmb3IgKHZhciBpID0gMCwgaWkgPSB0aGlzLl9xdWV1ZS5sZW5ndGg7IGkgPCBpaTsgaSArPSAxKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLl9xdWV1ZVtpXTtcbiAgICBpZiAoaXRlbSA9PT0gbXNnKSB7XG4gICAgICBwdXNoID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChpdGVtLl9tdWx0aXBsZSAmJiBpdGVtLmluZGV4T2YobXNnKSAhPT0gLTEpIHtcbiAgICAgIHB1c2ggPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgaWYgKHB1c2gpIHtcbiAgICB0aGlzLl9xdWV1ZS5wdXNoKG1zZyk7XG4gICAgaWYgKCF0aGlzLl90aW1lb3V0KSB7XG4gICAgICB0aGlzLl9zZXR1cEludGVydmFsKCk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBTZXQgdXAgRGF0YUNoYW5uZWwgaGFuZGxlcnMuXG5SZWxpYWJsZS5wcm90b3R5cGUuX3NldHVwREMgPSBmdW5jdGlvbigpIHtcbiAgLy8gSGFuZGxlIHZhcmlvdXMgbWVzc2FnZSB0eXBlcy5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9kYy5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIG1zZyA9IGUuZGF0YTtcbiAgICB2YXIgZGF0YXR5cGUgPSBtc2cuY29uc3RydWN0b3I7XG4gICAgLy8gRklYTUU6IG1zZyBpcyBTdHJpbmcgdW50aWwgYmluYXJ5IGlzIHN1cHBvcnRlZC5cbiAgICAvLyBPbmNlIHRoYXQgaGFwcGVucywgdGhpcyB3aWxsIGhhdmUgdG8gYmUgc21hcnRlci5cbiAgICBpZiAoZGF0YXR5cGUgPT09IFN0cmluZykge1xuICAgICAgdmFyIGFiID0gdXRpbC5iaW5hcnlTdHJpbmdUb0FycmF5QnVmZmVyKG1zZyk7XG4gICAgICBtc2cgPSB1dGlsLnVucGFjayhhYik7XG4gICAgICBzZWxmLl9oYW5kbGVNZXNzYWdlKG1zZyk7XG4gICAgfVxuICB9O1xufTtcblxuLy8gSGFuZGxlcyBhbiBpbmNvbWluZyBtZXNzYWdlLlxuUmVsaWFibGUucHJvdG90eXBlLl9oYW5kbGVNZXNzYWdlID0gZnVuY3Rpb24obXNnKSB7XG4gIHZhciBpZCA9IG1zZ1sxXTtcbiAgdmFyIGlkYXRhID0gdGhpcy5faW5jb21pbmdbaWRdO1xuICB2YXIgb2RhdGEgPSB0aGlzLl9vdXRnb2luZ1tpZF07XG4gIHZhciBkYXRhO1xuICBzd2l0Y2ggKG1zZ1swXSkge1xuICAgIC8vIE5vIGNodW5raW5nIHdhcyBkb25lLlxuICAgIGNhc2UgJ25vJzpcbiAgICAgIHZhciBtZXNzYWdlID0gaWQ7XG4gICAgICBpZiAoISFtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMub25tZXNzYWdlKHV0aWwudW5wYWNrKG1lc3NhZ2UpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIC8vIFJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgbWVzc2FnZS5cbiAgICBjYXNlICdlbmQnOlxuICAgICAgZGF0YSA9IGlkYXRhO1xuXG4gICAgICAvLyBJbiBjYXNlIGVuZCBjb21lcyBmaXJzdC5cbiAgICAgIHRoaXMuX3JlY2VpdmVkW2lkXSA9IG1zZ1syXTtcblxuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9hY2soaWQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWNrJzpcbiAgICAgIGRhdGEgPSBvZGF0YTtcbiAgICAgIGlmICghIWRhdGEpIHtcbiAgICAgICAgdmFyIGFjayA9IG1zZ1syXTtcbiAgICAgICAgLy8gVGFrZSB0aGUgbGFyZ2VyIEFDSywgZm9yIG91dCBvZiBvcmRlciBtZXNzYWdlcy5cbiAgICAgICAgZGF0YS5hY2sgPSBNYXRoLm1heChhY2ssIGRhdGEuYWNrKTtcblxuICAgICAgICAvLyBDbGVhbiB1cCB3aGVuIGFsbCBjaHVua3MgYXJlIEFDS2VkLlxuICAgICAgICBpZiAoZGF0YS5hY2sgPj0gZGF0YS5jaHVua3MubGVuZ3RoKSB7XG4gICAgICAgICAgdXRpbC5sb2coJ1RpbWU6ICcsIG5ldyBEYXRlKCkgLSBkYXRhLnRpbWVyKTtcbiAgICAgICAgICBkZWxldGUgdGhpcy5fb3V0Z29pbmdbaWRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Byb2Nlc3NBY2tzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIElmICFkYXRhLCBqdXN0IGlnbm9yZS5cbiAgICAgIGJyZWFrO1xuICAgIC8vIFJlY2VpdmVkIGEgY2h1bmsgb2YgZGF0YS5cbiAgICBjYXNlICdjaHVuayc6XG4gICAgICAvLyBDcmVhdGUgYSBuZXcgZW50cnkgaWYgbm9uZSBleGlzdHMuXG4gICAgICBkYXRhID0gaWRhdGE7XG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgdmFyIGVuZCA9IHRoaXMuX3JlY2VpdmVkW2lkXTtcbiAgICAgICAgaWYgKGVuZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgYWNrOiBbJ2FjaycsIGlkLCAwXSxcbiAgICAgICAgICBjaHVua3M6IFtdXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2luY29taW5nW2lkXSA9IGRhdGE7XG4gICAgICB9XG5cbiAgICAgIHZhciBuID0gbXNnWzJdO1xuICAgICAgdmFyIGNodW5rID0gbXNnWzNdO1xuICAgICAgZGF0YS5jaHVua3Nbbl0gPSBuZXcgVWludDhBcnJheShjaHVuayk7XG5cbiAgICAgIC8vIElmIHdlIGdldCB0aGUgY2h1bmsgd2UncmUgbG9va2luZyBmb3IsIEFDSyBmb3IgbmV4dCBtaXNzaW5nLlxuICAgICAgLy8gT3RoZXJ3aXNlLCBBQ0sgdGhlIHNhbWUgTiBhZ2Fpbi5cbiAgICAgIGlmIChuID09PSBkYXRhLmFja1syXSkge1xuICAgICAgICB0aGlzLl9jYWxjdWxhdGVOZXh0QWNrKGlkKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FjayhpZCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gU2hvdWxkbid0IGhhcHBlbiwgYnV0IHdvdWxkIG1ha2Ugc2Vuc2UgZm9yIG1lc3NhZ2UgdG8ganVzdCBnb1xuICAgICAgLy8gdGhyb3VnaCBhcyBpcy5cbiAgICAgIHRoaXMuX2hhbmRsZVNlbmQobXNnKTtcbiAgICAgIGJyZWFrO1xuICB9XG59O1xuXG4vLyBDaHVua3MgQkwgaW50byBzbWFsbGVyIG1lc3NhZ2VzLlxuUmVsaWFibGUucHJvdG90eXBlLl9jaHVuayA9IGZ1bmN0aW9uKGJsKSB7XG4gIHZhciBjaHVua3MgPSBbXTtcbiAgdmFyIHNpemUgPSBibC5zaXplO1xuICB2YXIgc3RhcnQgPSAwO1xuICB3aGlsZSAoc3RhcnQgPCBzaXplKSB7XG4gICAgdmFyIGVuZCA9IE1hdGgubWluKHNpemUsIHN0YXJ0ICsgdGhpcy5fbXR1KTtcbiAgICB2YXIgYiA9IGJsLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIHZhciBjaHVuayA9IHtcbiAgICAgIHBheWxvYWQ6IGJcbiAgICB9XG4gICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgIHN0YXJ0ID0gZW5kO1xuICB9XG4gIHV0aWwubG9nKCdDcmVhdGVkJywgY2h1bmtzLmxlbmd0aCwgJ2NodW5rcy4nKTtcbiAgcmV0dXJuIGNodW5rcztcbn07XG5cbi8vIFNlbmRzIEFDSyBOLCBleHBlY3RpbmcgTnRoIGJsb2IgY2h1bmsgZm9yIG1lc3NhZ2UgSUQuXG5SZWxpYWJsZS5wcm90b3R5cGUuX2FjayA9IGZ1bmN0aW9uKGlkKSB7XG4gIHZhciBhY2sgPSB0aGlzLl9pbmNvbWluZ1tpZF0uYWNrO1xuXG4gIC8vIGlmIGFjayBpcyB0aGUgZW5kIHZhbHVlLCB0aGVuIGNhbGwgX2NvbXBsZXRlLlxuICBpZiAodGhpcy5fcmVjZWl2ZWRbaWRdID09PSBhY2tbMl0pIHtcbiAgICB0aGlzLl9jb21wbGV0ZShpZCk7XG4gICAgdGhpcy5fcmVjZWl2ZWRbaWRdID0gdHJ1ZTtcbiAgfVxuXG4gIHRoaXMuX2hhbmRsZVNlbmQoYWNrKTtcbn07XG5cbi8vIENhbGN1bGF0ZXMgdGhlIG5leHQgQUNLIG51bWJlciwgZ2l2ZW4gY2h1bmtzLlxuUmVsaWFibGUucHJvdG90eXBlLl9jYWxjdWxhdGVOZXh0QWNrID0gZnVuY3Rpb24oaWQpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9pbmNvbWluZ1tpZF07XG4gIHZhciBjaHVua3MgPSBkYXRhLmNodW5rcztcbiAgZm9yICh2YXIgaSA9IDAsIGlpID0gY2h1bmtzLmxlbmd0aDsgaSA8IGlpOyBpICs9IDEpIHtcbiAgICAvLyBUaGlzIGNodW5rIGlzIG1pc3NpbmchISEgQmV0dGVyIEFDSyBmb3IgaXQuXG4gICAgaWYgKGNodW5rc1tpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkYXRhLmFja1syXSA9IGk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIGRhdGEuYWNrWzJdID0gY2h1bmtzLmxlbmd0aDtcbn07XG5cbi8vIFNlbmRzIHRoZSBuZXh0IHdpbmRvdyBvZiBjaHVua3MuXG5SZWxpYWJsZS5wcm90b3R5cGUuX3NlbmRXaW5kb3dlZENodW5rcyA9IGZ1bmN0aW9uKGlkKSB7XG4gIHV0aWwubG9nKCdzZW5kV2luZG93ZWRDaHVua3MgZm9yOiAnLCBpZCk7XG4gIHZhciBkYXRhID0gdGhpcy5fb3V0Z29pbmdbaWRdO1xuICB2YXIgY2ggPSBkYXRhLmNodW5rcztcbiAgdmFyIGNodW5rcyA9IFtdO1xuICB2YXIgbGltaXQgPSBNYXRoLm1pbihkYXRhLmFjayArIHRoaXMuX3dpbmRvdywgY2gubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IGRhdGEuYWNrOyBpIDwgbGltaXQ7IGkgKz0gMSkge1xuICAgIGlmICghY2hbaV0uc2VudCB8fCBpID09PSBkYXRhLmFjaykge1xuICAgICAgY2hbaV0uc2VudCA9IHRydWU7XG4gICAgICBjaHVua3MucHVzaChbJ2NodW5rJywgaWQsIGksIGNoW2ldLnBheWxvYWRdKTtcbiAgICB9XG4gIH1cbiAgaWYgKGRhdGEuYWNrICsgdGhpcy5fd2luZG93ID49IGNoLmxlbmd0aCkge1xuICAgIGNodW5rcy5wdXNoKFsnZW5kJywgaWQsIGNoLmxlbmd0aF0pXG4gIH1cbiAgY2h1bmtzLl9tdWx0aXBsZSA9IHRydWU7XG4gIHRoaXMuX2hhbmRsZVNlbmQoY2h1bmtzKTtcbn07XG5cbi8vIFB1dHMgdG9nZXRoZXIgYSBtZXNzYWdlIGZyb20gY2h1bmtzLlxuUmVsaWFibGUucHJvdG90eXBlLl9jb21wbGV0ZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHV0aWwubG9nKCdDb21wbGV0ZWQgY2FsbGVkIGZvcicsIGlkKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgY2h1bmtzID0gdGhpcy5faW5jb21pbmdbaWRdLmNodW5rcztcbiAgdmFyIGJsID0gbmV3IEJsb2IoY2h1bmtzKTtcbiAgdXRpbC5ibG9iVG9BcnJheUJ1ZmZlcihibCwgZnVuY3Rpb24oYWIpIHtcbiAgICBzZWxmLm9ubWVzc2FnZSh1dGlsLnVucGFjayhhYikpO1xuICB9KTtcbiAgZGVsZXRlIHRoaXMuX2luY29taW5nW2lkXTtcbn07XG5cbi8vIFVwcyBiYW5kd2lkdGggbGltaXQgb24gU0RQLiBNZWFudCB0byBiZSBjYWxsZWQgZHVyaW5nIG9mZmVyL2Fuc3dlci5cblJlbGlhYmxlLmhpZ2hlckJhbmR3aWR0aFNEUCA9IGZ1bmN0aW9uKHNkcCkge1xuICAvLyBBUyBzdGFuZHMgZm9yIEFwcGxpY2F0aW9uLVNwZWNpZmljIE1heGltdW0uXG4gIC8vIEJhbmR3aWR0aCBudW1iZXIgaXMgaW4ga2lsb2JpdHMgLyBzZWMuXG4gIC8vIFNlZSBSRkMgZm9yIG1vcmUgaW5mbzogaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMjMyNy50eHRcblxuICAvLyBDaHJvbWUgMzErIGRvZXNuJ3Qgd2FudCB1cyBtdW5naW5nIHRoZSBTRFAsIHNvIHdlJ2xsIGxldCB0aGVtIGhhdmUgdGhlaXJcbiAgLy8gd2F5LlxuICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci5hcHBWZXJzaW9uLm1hdGNoKC9DaHJvbWVcXC8oLio/KSAvKTtcbiAgaWYgKHZlcnNpb24pIHtcbiAgICB2ZXJzaW9uID0gcGFyc2VJbnQodmVyc2lvblsxXS5zcGxpdCgnLicpLnNoaWZ0KCkpO1xuICAgIGlmICh2ZXJzaW9uIDwgMzEpIHtcbiAgICAgIHZhciBwYXJ0cyA9IHNkcC5zcGxpdCgnYj1BUzozMCcpO1xuICAgICAgdmFyIHJlcGxhY2UgPSAnYj1BUzoxMDI0MDAnOyAvLyAxMDAgTWJwc1xuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdICsgcmVwbGFjZSArIHBhcnRzWzFdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzZHA7XG59O1xuXG4vLyBPdmVyd3JpdHRlbiwgdHlwaWNhbGx5LlxuUmVsaWFibGUucHJvdG90eXBlLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKG1zZykge307XG5cbm1vZHVsZS5leHBvcnRzLlJlbGlhYmxlID0gUmVsaWFibGU7XG4iLCJ2YXIgQmluYXJ5UGFjayA9IHJlcXVpcmUoJ2pzLWJpbmFyeXBhY2snKTtcblxudmFyIHV0aWwgPSB7XG4gIGRlYnVnOiBmYWxzZSxcbiAgXG4gIGluaGVyaXRzOiBmdW5jdGlvbihjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvcjtcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGV4dGVuZDogZnVuY3Rpb24oZGVzdCwgc291cmNlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZihzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBkZXN0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlc3Q7XG4gIH0sXG4gIHBhY2s6IEJpbmFyeVBhY2sucGFjayxcbiAgdW5wYWNrOiBCaW5hcnlQYWNrLnVucGFjayxcbiAgXG4gIGxvZzogZnVuY3Rpb24gKCkge1xuICAgIGlmICh1dGlsLmRlYnVnKSB7XG4gICAgICB2YXIgY29weSA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29weVtpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIH1cbiAgICAgIGNvcHkudW5zaGlmdCgnUmVsaWFibGU6ICcpO1xuICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgY29weSk7XG4gICAgfVxuICB9LFxuXG4gIHNldFplcm9UaW1lb3V0OiAoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICAgdmFyIHRpbWVvdXRzID0gW107XG4gICAgdmFyIG1lc3NhZ2VOYW1lID0gJ3plcm8tdGltZW91dC1tZXNzYWdlJztcblxuICAgIC8vIExpa2Ugc2V0VGltZW91dCwgYnV0IG9ubHkgdGFrZXMgYSBmdW5jdGlvbiBhcmd1bWVudC5cdCBUaGVyZSdzXG4gICAgLy8gbm8gdGltZSBhcmd1bWVudCAoYWx3YXlzIHplcm8pIGFuZCBubyBhcmd1bWVudHMgKHlvdSBoYXZlIHRvXG4gICAgLy8gdXNlIGEgY2xvc3VyZSkuXG4gICAgZnVuY3Rpb24gc2V0WmVyb1RpbWVvdXRQb3N0TWVzc2FnZShmbikge1xuICAgICAgdGltZW91dHMucHVzaChmbik7XG4gICAgICBnbG9iYWwucG9zdE1lc3NhZ2UobWVzc2FnZU5hbWUsICcqJyk7XG4gICAgfVx0XHRcblxuICAgIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5zb3VyY2UgPT0gZ2xvYmFsICYmIGV2ZW50LmRhdGEgPT0gbWVzc2FnZU5hbWUpIHtcbiAgICAgICAgaWYgKGV2ZW50LnN0b3BQcm9wYWdhdGlvbikge1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aW1lb3V0cy5sZW5ndGgpIHtcbiAgICAgICAgICB0aW1lb3V0cy5zaGlmdCgpKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGhhbmRsZU1lc3NhZ2UsIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZ2xvYmFsLmF0dGFjaEV2ZW50KSB7XG4gICAgICBnbG9iYWwuYXR0YWNoRXZlbnQoJ29ubWVzc2FnZScsIGhhbmRsZU1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gc2V0WmVyb1RpbWVvdXRQb3N0TWVzc2FnZTtcbiAgfSh0aGlzKSksXG4gIFxuICBibG9iVG9BcnJheUJ1ZmZlcjogZnVuY3Rpb24oYmxvYiwgY2Ipe1xuICAgIHZhciBmciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgZnIub25sb2FkID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBjYihldnQudGFyZ2V0LnJlc3VsdCk7XG4gICAgfTtcbiAgICBmci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcbiAgfSxcbiAgYmxvYlRvQmluYXJ5U3RyaW5nOiBmdW5jdGlvbihibG9iLCBjYil7XG4gICAgdmFyIGZyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICBmci5vbmxvYWQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgIGNiKGV2dC50YXJnZXQucmVzdWx0KTtcbiAgICB9O1xuICAgIGZyLnJlYWRBc0JpbmFyeVN0cmluZyhibG9iKTtcbiAgfSxcbiAgYmluYXJ5U3RyaW5nVG9BcnJheUJ1ZmZlcjogZnVuY3Rpb24oYmluYXJ5KSB7XG4gICAgdmFyIGJ5dGVBcnJheSA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBieXRlQXJyYXlbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKSAmIDB4ZmY7XG4gICAgfVxuICAgIHJldHVybiBieXRlQXJyYXkuYnVmZmVyO1xuICB9LFxuICByYW5kb21Ub2tlbjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMik7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcbiIsIi8qKlxuICogVHdlZW4uanMgLSBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2xlL3R3ZWVuLmpzXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2xlL3R3ZWVuLmpzL2dyYXBocy9jb250cmlidXRvcnMgZm9yIHRoZSBmdWxsIGxpc3Qgb2YgY29udHJpYnV0b3JzLlxuICogVGhhbmsgeW91IGFsbCwgeW91J3JlIGF3ZXNvbWUhXG4gKi9cblxuLy8gcGVyZm9ybWFuY2Uubm93IHBvbHlmaWxsXG4oIGZ1bmN0aW9uICggcm9vdCApIHtcblxuXHRpZiAoICdwZXJmb3JtYW5jZScgaW4gcm9vdCA9PT0gZmFsc2UgKSB7XG5cdFx0cm9vdC5wZXJmb3JtYW5jZSA9IHt9O1xuXHR9XG5cblx0Ly8gSUUgOFxuXHREYXRlLm5vdyA9ICggRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0fSApO1xuXG5cdGlmICggJ25vdycgaW4gcm9vdC5wZXJmb3JtYW5jZSA9PT0gZmFsc2UgKSB7XG5cdFx0dmFyIG9mZnNldCA9IHJvb3QucGVyZm9ybWFuY2UudGltaW5nICYmIHJvb3QucGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCA/IHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnRcblx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogRGF0ZS5ub3coKTtcblxuXHRcdHJvb3QucGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIERhdGUubm93KCkgLSBvZmZzZXQ7XG5cdFx0fTtcblx0fVxuXG59ICkoIHRoaXMgKTtcblxudmFyIFRXRUVOID0gVFdFRU4gfHwgKCBmdW5jdGlvbiAoKSB7XG5cblx0dmFyIF90d2VlbnMgPSBbXTtcblxuXHRyZXR1cm4ge1xuXG5cdFx0UkVWSVNJT046ICcxNCcsXG5cblx0XHRnZXRBbGw6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0cmV0dXJuIF90d2VlbnM7XG5cblx0XHR9LFxuXG5cdFx0cmVtb3ZlQWxsOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdF90d2VlbnMgPSBbXTtcblxuXHRcdH0sXG5cblx0XHRhZGQ6IGZ1bmN0aW9uICggdHdlZW4gKSB7XG5cblx0XHRcdF90d2VlbnMucHVzaCggdHdlZW4gKTtcblxuXHRcdH0sXG5cblx0XHRyZW1vdmU6IGZ1bmN0aW9uICggdHdlZW4gKSB7XG5cblx0XHRcdHZhciBpID0gX3R3ZWVucy5pbmRleE9mKCB0d2VlbiApO1xuXG5cdFx0XHRpZiAoIGkgIT09IC0xICkge1xuXG5cdFx0XHRcdF90d2VlbnMuc3BsaWNlKCBpLCAxICk7XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHR1cGRhdGU6IGZ1bmN0aW9uICggdGltZSApIHtcblxuXHRcdFx0aWYgKCBfdHdlZW5zLmxlbmd0aCA9PT0gMCApIHJldHVybiBmYWxzZTtcblxuXHRcdFx0dmFyIGkgPSAwO1xuXG5cdFx0XHR0aW1lID0gdGltZSAhPT0gdW5kZWZpbmVkID8gdGltZSA6IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcblxuXHRcdFx0d2hpbGUgKCBpIDwgX3R3ZWVucy5sZW5ndGggKSB7XG5cblx0XHRcdFx0aWYgKCBfdHdlZW5zWyBpIF0udXBkYXRlKCB0aW1lICkgKSB7XG5cblx0XHRcdFx0XHRpKys7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdF90d2VlbnMuc3BsaWNlKCBpLCAxICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0fVxuXHR9O1xuXG59ICkoKTtcblxuVFdFRU4uVHdlZW4gPSBmdW5jdGlvbiAoIG9iamVjdCApIHtcblxuXHR2YXIgX29iamVjdCA9IG9iamVjdDtcblx0dmFyIF92YWx1ZXNTdGFydCA9IHt9O1xuXHR2YXIgX3ZhbHVlc0VuZCA9IHt9O1xuXHR2YXIgX3ZhbHVlc1N0YXJ0UmVwZWF0ID0ge307XG5cdHZhciBfZHVyYXRpb24gPSAxMDAwO1xuXHR2YXIgX3JlcGVhdCA9IDA7XG5cdHZhciBfeW95byA9IGZhbHNlO1xuXHR2YXIgX2lzUGxheWluZyA9IGZhbHNlO1xuXHR2YXIgX3JldmVyc2VkID0gZmFsc2U7XG5cdHZhciBfZGVsYXlUaW1lID0gMDtcblx0dmFyIF9zdGFydFRpbWUgPSBudWxsO1xuXHR2YXIgX2Vhc2luZ0Z1bmN0aW9uID0gVFdFRU4uRWFzaW5nLkxpbmVhci5Ob25lO1xuXHR2YXIgX2ludGVycG9sYXRpb25GdW5jdGlvbiA9IFRXRUVOLkludGVycG9sYXRpb24uTGluZWFyO1xuXHR2YXIgX2NoYWluZWRUd2VlbnMgPSBbXTtcblx0dmFyIF9vblN0YXJ0Q2FsbGJhY2sgPSBudWxsO1xuXHR2YXIgX29uU3RhcnRDYWxsYmFja0ZpcmVkID0gZmFsc2U7XG5cdHZhciBfb25VcGRhdGVDYWxsYmFjayA9IG51bGw7XG5cdHZhciBfb25Db21wbGV0ZUNhbGxiYWNrID0gbnVsbDtcblx0dmFyIF9vblN0b3BDYWxsYmFjayA9IG51bGw7XG5cblx0Ly8gU2V0IGFsbCBzdGFydGluZyB2YWx1ZXMgcHJlc2VudCBvbiB0aGUgdGFyZ2V0IG9iamVjdFxuXHRmb3IgKCB2YXIgZmllbGQgaW4gb2JqZWN0ICkge1xuXG5cdFx0X3ZhbHVlc1N0YXJ0WyBmaWVsZCBdID0gcGFyc2VGbG9hdChvYmplY3RbZmllbGRdLCAxMCk7XG5cblx0fVxuXG5cdHRoaXMudG8gPSBmdW5jdGlvbiAoIHByb3BlcnRpZXMsIGR1cmF0aW9uICkge1xuXG5cdFx0aWYgKCBkdXJhdGlvbiAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRfZHVyYXRpb24gPSBkdXJhdGlvbjtcblxuXHRcdH1cblxuXHRcdF92YWx1ZXNFbmQgPSBwcm9wZXJ0aWVzO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0YXJ0ID0gZnVuY3Rpb24gKCB0aW1lICkge1xuXG5cdFx0VFdFRU4uYWRkKCB0aGlzICk7XG5cblx0XHRfaXNQbGF5aW5nID0gdHJ1ZTtcblxuXHRcdF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9IGZhbHNlO1xuXG5cdFx0X3N0YXJ0VGltZSA9IHRpbWUgIT09IHVuZGVmaW5lZCA/IHRpbWUgOiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0X3N0YXJ0VGltZSArPSBfZGVsYXlUaW1lO1xuXG5cdFx0Zm9yICggdmFyIHByb3BlcnR5IGluIF92YWx1ZXNFbmQgKSB7XG5cblx0XHRcdC8vIGNoZWNrIGlmIGFuIEFycmF5IHdhcyBwcm92aWRlZCBhcyBwcm9wZXJ0eSB2YWx1ZVxuXHRcdFx0aWYgKCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cblx0XHRcdFx0aWYgKCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdLmxlbmd0aCA9PT0gMCApIHtcblxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBjcmVhdGUgYSBsb2NhbCBjb3B5IG9mIHRoZSBBcnJheSB3aXRoIHRoZSBzdGFydCB2YWx1ZSBhdCB0aGUgZnJvbnRcblx0XHRcdFx0X3ZhbHVlc0VuZFsgcHJvcGVydHkgXSA9IFsgX29iamVjdFsgcHJvcGVydHkgXSBdLmNvbmNhdCggX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSA9IF9vYmplY3RbIHByb3BlcnR5IF07XG5cblx0XHRcdGlmKCAoIF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSBpbnN0YW5jZW9mIEFycmF5ICkgPT09IGZhbHNlICkge1xuXHRcdFx0XHRfdmFsdWVzU3RhcnRbIHByb3BlcnR5IF0gKj0gMS4wOyAvLyBFbnN1cmVzIHdlJ3JlIHVzaW5nIG51bWJlcnMsIG5vdCBzdHJpbmdzXG5cdFx0XHR9XG5cblx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSB8fCAwO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoICFfaXNQbGF5aW5nICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0VFdFRU4ucmVtb3ZlKCB0aGlzICk7XG5cdFx0X2lzUGxheWluZyA9IGZhbHNlO1xuXG5cdFx0aWYgKCBfb25TdG9wQ2FsbGJhY2sgIT09IG51bGwgKSB7XG5cblx0XHRcdF9vblN0b3BDYWxsYmFjay5jYWxsKCBfb2JqZWN0ICk7XG5cblx0XHR9XG5cblx0XHR0aGlzLnN0b3BDaGFpbmVkVHdlZW5zKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0b3BDaGFpbmVkVHdlZW5zID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwLCBudW1DaGFpbmVkVHdlZW5zID0gX2NoYWluZWRUd2VlbnMubGVuZ3RoOyBpIDwgbnVtQ2hhaW5lZFR3ZWVuczsgaSsrICkge1xuXG5cdFx0XHRfY2hhaW5lZFR3ZWVuc1sgaSBdLnN0b3AoKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuZGVsYXkgPSBmdW5jdGlvbiAoIGFtb3VudCApIHtcblxuXHRcdF9kZWxheVRpbWUgPSBhbW91bnQ7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnJlcGVhdCA9IGZ1bmN0aW9uICggdGltZXMgKSB7XG5cblx0XHRfcmVwZWF0ID0gdGltZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnlveW8gPSBmdW5jdGlvbiggeW95byApIHtcblxuXHRcdF95b3lvID0geW95bztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cblx0dGhpcy5lYXNpbmcgPSBmdW5jdGlvbiAoIGVhc2luZyApIHtcblxuXHRcdF9lYXNpbmdGdW5jdGlvbiA9IGVhc2luZztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuaW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uICggaW50ZXJwb2xhdGlvbiApIHtcblxuXHRcdF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24gPSBpbnRlcnBvbGF0aW9uO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5jaGFpbiA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9jaGFpbmVkVHdlZW5zID0gYXJndW1lbnRzO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vblN0YXJ0ID0gZnVuY3Rpb24gKCBjYWxsYmFjayApIHtcblxuXHRcdF9vblN0YXJ0Q2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25VcGRhdGUgPSBmdW5jdGlvbiAoIGNhbGxiYWNrICkge1xuXG5cdFx0X29uVXBkYXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25Db21wbGV0ZSA9IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cblx0XHRfb25Db21wbGV0ZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLm9uU3RvcCA9IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cblx0XHRfb25TdG9wQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCB0aW1lICkge1xuXG5cdFx0dmFyIHByb3BlcnR5O1xuXG5cdFx0aWYgKCB0aW1lIDwgX3N0YXJ0VGltZSApIHtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9XG5cblx0XHRpZiAoIF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9PT0gZmFsc2UgKSB7XG5cblx0XHRcdGlmICggX29uU3RhcnRDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHRfb25TdGFydENhbGxiYWNrLmNhbGwoIF9vYmplY3QgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfb25TdGFydENhbGxiYWNrRmlyZWQgPSB0cnVlO1xuXG5cdFx0fVxuXG5cdFx0dmFyIGVsYXBzZWQgPSAoIHRpbWUgLSBfc3RhcnRUaW1lICkgLyBfZHVyYXRpb247XG5cdFx0ZWxhcHNlZCA9IGVsYXBzZWQgPiAxID8gMSA6IGVsYXBzZWQ7XG5cblx0XHR2YXIgdmFsdWUgPSBfZWFzaW5nRnVuY3Rpb24oIGVsYXBzZWQgKTtcblxuXHRcdGZvciAoIHByb3BlcnR5IGluIF92YWx1ZXNFbmQgKSB7XG5cblx0XHRcdHZhciBzdGFydCA9IF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSB8fCAwO1xuXHRcdFx0dmFyIGVuZCA9IF92YWx1ZXNFbmRbIHByb3BlcnR5IF07XG5cblx0XHRcdGlmICggZW5kIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cblx0XHRcdFx0X29iamVjdFsgcHJvcGVydHkgXSA9IF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24oIGVuZCwgdmFsdWUgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBQYXJzZXMgcmVsYXRpdmUgZW5kIHZhbHVlcyB3aXRoIHN0YXJ0IGFzIGJhc2UgKGUuZy46ICsxMCwgLTMpXG5cdFx0XHRcdGlmICggdHlwZW9mKGVuZCkgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdFx0ZW5kID0gc3RhcnQgKyBwYXJzZUZsb2F0KGVuZCwgMTApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gcHJvdGVjdCBhZ2FpbnN0IG5vbiBudW1lcmljIHByb3BlcnRpZXMuXG5cdFx0XHRcdGlmICggdHlwZW9mKGVuZCkgPT09IFwibnVtYmVyXCIgKSB7XG5cdFx0XHRcdFx0X29iamVjdFsgcHJvcGVydHkgXSA9IHN0YXJ0ICsgKCBlbmQgLSBzdGFydCApICogdmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKCBfb25VcGRhdGVDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuXHRcdFx0X29uVXBkYXRlQ2FsbGJhY2suY2FsbCggX29iamVjdCwgdmFsdWUgKTtcblxuXHRcdH1cblxuXHRcdGlmICggZWxhcHNlZCA9PSAxICkge1xuXG5cdFx0XHRpZiAoIF9yZXBlYXQgPiAwICkge1xuXG5cdFx0XHRcdGlmKCBpc0Zpbml0ZSggX3JlcGVhdCApICkge1xuXHRcdFx0XHRcdF9yZXBlYXQtLTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIHJlYXNzaWduIHN0YXJ0aW5nIHZhbHVlcywgcmVzdGFydCBieSBtYWtpbmcgc3RhcnRUaW1lID0gbm93XG5cdFx0XHRcdGZvciggcHJvcGVydHkgaW4gX3ZhbHVlc1N0YXJ0UmVwZWF0ICkge1xuXG5cdFx0XHRcdFx0aWYgKCB0eXBlb2YoIF92YWx1ZXNFbmRbIHByb3BlcnR5IF0gKSA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSArIHBhcnNlRmxvYXQoX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSwgMTApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChfeW95bykge1xuXHRcdFx0XHRcdFx0dmFyIHRtcCA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXTtcblx0XHRcdFx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNFbmRbIHByb3BlcnR5IF07XG5cdFx0XHRcdFx0XHRfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdID0gdG1wO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKF95b3lvKSB7XG5cdFx0XHRcdFx0X3JldmVyc2VkID0gIV9yZXZlcnNlZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdF9zdGFydFRpbWUgPSB0aW1lICsgX2RlbGF5VGltZTtcblxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZiAoIF9vbkNvbXBsZXRlQ2FsbGJhY2sgIT09IG51bGwgKSB7XG5cblx0XHRcdFx0XHRfb25Db21wbGV0ZUNhbGxiYWNrLmNhbGwoIF9vYmplY3QgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICggdmFyIGkgPSAwLCBudW1DaGFpbmVkVHdlZW5zID0gX2NoYWluZWRUd2VlbnMubGVuZ3RoOyBpIDwgbnVtQ2hhaW5lZFR3ZWVuczsgaSsrICkge1xuXG5cdFx0XHRcdFx0X2NoYWluZWRUd2VlbnNbIGkgXS5zdGFydCggdGltZSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cbn07XG5cblxuVFdFRU4uRWFzaW5nID0ge1xuXG5cdExpbmVhcjoge1xuXG5cdFx0Tm9uZTogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gaztcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1YWRyYXRpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayAqICggMiAtIGsgKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrO1xuXHRcdFx0cmV0dXJuIC0gMC41ICogKCAtLWsgKiAoIGsgLSAyICkgLSAxICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRDdWJpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrICogaztcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIC0tayAqIGsgKiBrICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrICogaztcblx0XHRcdHJldHVybiAwLjUgKiAoICggayAtPSAyICkgKiBrICogayArIDIgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1YXJ0aWM6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiBrICogayAqIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMSAtICggLS1rICogayAqIGsgKiBrICk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCAoIGsgKj0gMiApIDwgMSkgcmV0dXJuIDAuNSAqIGsgKiBrICogayAqIGs7XG5cdFx0XHRyZXR1cm4gLSAwLjUgKiAoICggayAtPSAyICkgKiBrICogayAqIGsgLSAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRRdWludGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayAqIGsgKiBrICogayAqIGs7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAtLWsgKiBrICogayAqIGsgKiBrICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrICogayAqIGsgKiBrO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggKCBrIC09IDIgKSAqIGsgKiBrICogayAqIGsgKyAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRTaW51c29pZGFsOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMSAtIE1hdGguY29zKCBrICogTWF0aC5QSSAvIDIgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIE1hdGguc2luKCBrICogTWF0aC5QSSAvIDIgKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMC41ICogKCAxIC0gTWF0aC5jb3MoIE1hdGguUEkgKiBrICkgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEV4cG9uZW50aWFsOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayA9PT0gMCA/IDAgOiBNYXRoLnBvdyggMTAyNCwgayAtIDEgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgPT09IDEgPyAxIDogMSAtIE1hdGgucG93KCAyLCAtIDEwICogayApO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIE1hdGgucG93KCAxMDI0LCBrIC0gMSApO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggLSBNYXRoLnBvdyggMiwgLSAxMCAqICggayAtIDEgKSApICsgMiApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0Q2lyY3VsYXI6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAxIC0gTWF0aC5zcXJ0KCAxIC0gayAqIGsgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIE1hdGguc3FydCggMSAtICggLS1rICogayApICk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCAoIGsgKj0gMiApIDwgMSkgcmV0dXJuIC0gMC41ICogKCBNYXRoLnNxcnQoIDEgLSBrICogaykgLSAxKTtcblx0XHRcdHJldHVybiAwLjUgKiAoIE1hdGguc3FydCggMSAtICggayAtPSAyKSAqIGspICsgMSk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRFbGFzdGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcywgYSA9IDAuMSwgcCA9IDAuNDtcblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICFhIHx8IGEgPCAxICkgeyBhID0gMTsgcyA9IHAgLyA0OyB9XG5cdFx0XHRlbHNlIHMgPSBwICogTWF0aC5hc2luKCAxIC8gYSApIC8gKCAyICogTWF0aC5QSSApO1xuXHRcdFx0cmV0dXJuIC0gKCBhICogTWF0aC5wb3coIDIsIDEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSApO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcywgYSA9IDAuMSwgcCA9IDAuNDtcblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICFhIHx8IGEgPCAxICkgeyBhID0gMTsgcyA9IHAgLyA0OyB9XG5cdFx0XHRlbHNlIHMgPSBwICogTWF0aC5hc2luKCAxIC8gYSApIC8gKCAyICogTWF0aC5QSSApO1xuXHRcdFx0cmV0dXJuICggYSAqIE1hdGgucG93KCAyLCAtIDEwICogaykgKiBNYXRoLnNpbiggKCBrIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICsgMSApO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzLCBhID0gMC4xLCBwID0gMC40O1xuXHRcdFx0aWYgKCBrID09PSAwICkgcmV0dXJuIDA7XG5cdFx0XHRpZiAoIGsgPT09IDEgKSByZXR1cm4gMTtcblx0XHRcdGlmICggIWEgfHwgYSA8IDEgKSB7IGEgPSAxOyBzID0gcCAvIDQ7IH1cblx0XHRcdGVsc2UgcyA9IHAgKiBNYXRoLmFzaW4oIDEgLyBhICkgLyAoIDIgKiBNYXRoLlBJICk7XG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIC0gMC41ICogKCBhICogTWF0aC5wb3coIDIsIDEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSApO1xuXHRcdFx0cmV0dXJuIGEgKiBNYXRoLnBvdyggMiwgLTEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSAqIDAuNSArIDE7XG5cblx0XHR9XG5cblx0fSxcblxuXHRCYWNrOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcyA9IDEuNzAxNTg7XG5cdFx0XHRyZXR1cm4gayAqIGsgKiAoICggcyArIDEgKSAqIGsgLSBzICk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzID0gMS43MDE1ODtcblx0XHRcdHJldHVybiAtLWsgKiBrICogKCAoIHMgKyAxICkgKiBrICsgcyApICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcyA9IDEuNzAxNTggKiAxLjUyNTtcblx0XHRcdGlmICggKCBrICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogKCBrICogayAqICggKCBzICsgMSApICogayAtIHMgKSApO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggKCBrIC09IDIgKSAqIGsgKiAoICggcyArIDEgKSAqIGsgKyBzICkgKyAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRCb3VuY2U6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAxIC0gVFdFRU4uRWFzaW5nLkJvdW5jZS5PdXQoIDEgLSBrICk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA8ICggMSAvIDIuNzUgKSApIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogayAqIGs7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGsgPCAoIDIgLyAyLjc1ICkgKSB7XG5cblx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqICggayAtPSAoIDEuNSAvIDIuNzUgKSApICogayArIDAuNzU7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGsgPCAoIDIuNSAvIDIuNzUgKSApIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKCBrIC09ICggMi4yNSAvIDIuNzUgKSApICogayArIDAuOTM3NTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKCBrIC09ICggMi42MjUgLyAyLjc1ICkgKSAqIGsgKyAwLjk4NDM3NTtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA8IDAuNSApIHJldHVybiBUV0VFTi5FYXNpbmcuQm91bmNlLkluKCBrICogMiApICogMC41O1xuXHRcdFx0cmV0dXJuIFRXRUVOLkVhc2luZy5Cb3VuY2UuT3V0KCBrICogMiAtIDEgKSAqIDAuNSArIDAuNTtcblxuXHRcdH1cblxuXHR9XG5cbn07XG5cblRXRUVOLkludGVycG9sYXRpb24gPSB7XG5cblx0TGluZWFyOiBmdW5jdGlvbiAoIHYsIGsgKSB7XG5cblx0XHR2YXIgbSA9IHYubGVuZ3RoIC0gMSwgZiA9IG0gKiBrLCBpID0gTWF0aC5mbG9vciggZiApLCBmbiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuTGluZWFyO1xuXG5cdFx0aWYgKCBrIDwgMCApIHJldHVybiBmbiggdlsgMCBdLCB2WyAxIF0sIGYgKTtcblx0XHRpZiAoIGsgPiAxICkgcmV0dXJuIGZuKCB2WyBtIF0sIHZbIG0gLSAxIF0sIG0gLSBmICk7XG5cblx0XHRyZXR1cm4gZm4oIHZbIGkgXSwgdlsgaSArIDEgPiBtID8gbSA6IGkgKyAxIF0sIGYgLSBpICk7XG5cblx0fSxcblxuXHRCZXppZXI6IGZ1bmN0aW9uICggdiwgayApIHtcblxuXHRcdHZhciBiID0gMCwgbiA9IHYubGVuZ3RoIC0gMSwgcHcgPSBNYXRoLnBvdywgYm4gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLlV0aWxzLkJlcm5zdGVpbiwgaTtcblxuXHRcdGZvciAoIGkgPSAwOyBpIDw9IG47IGkrKyApIHtcblx0XHRcdGIgKz0gcHcoIDEgLSBrLCBuIC0gaSApICogcHcoIGssIGkgKSAqIHZbIGkgXSAqIGJuKCBuLCBpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGI7XG5cblx0fSxcblxuXHRDYXRtdWxsUm9tOiBmdW5jdGlvbiAoIHYsIGsgKSB7XG5cblx0XHR2YXIgbSA9IHYubGVuZ3RoIC0gMSwgZiA9IG0gKiBrLCBpID0gTWF0aC5mbG9vciggZiApLCBmbiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuQ2F0bXVsbFJvbTtcblxuXHRcdGlmICggdlsgMCBdID09PSB2WyBtIF0gKSB7XG5cblx0XHRcdGlmICggayA8IDAgKSBpID0gTWF0aC5mbG9vciggZiA9IG0gKiAoIDEgKyBrICkgKTtcblxuXHRcdFx0cmV0dXJuIGZuKCB2WyAoIGkgLSAxICsgbSApICUgbSBdLCB2WyBpIF0sIHZbICggaSArIDEgKSAlIG0gXSwgdlsgKCBpICsgMiApICUgbSBdLCBmIC0gaSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYgKCBrIDwgMCApIHJldHVybiB2WyAwIF0gLSAoIGZuKCB2WyAwIF0sIHZbIDAgXSwgdlsgMSBdLCB2WyAxIF0sIC1mICkgLSB2WyAwIF0gKTtcblx0XHRcdGlmICggayA+IDEgKSByZXR1cm4gdlsgbSBdIC0gKCBmbiggdlsgbSBdLCB2WyBtIF0sIHZbIG0gLSAxIF0sIHZbIG0gLSAxIF0sIGYgLSBtICkgLSB2WyBtIF0gKTtcblxuXHRcdFx0cmV0dXJuIGZuKCB2WyBpID8gaSAtIDEgOiAwIF0sIHZbIGkgXSwgdlsgbSA8IGkgKyAxID8gbSA6IGkgKyAxIF0sIHZbIG0gPCBpICsgMiA/IG0gOiBpICsgMiBdLCBmIC0gaSApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0VXRpbHM6IHtcblxuXHRcdExpbmVhcjogZnVuY3Rpb24gKCBwMCwgcDEsIHQgKSB7XG5cblx0XHRcdHJldHVybiAoIHAxIC0gcDAgKSAqIHQgKyBwMDtcblxuXHRcdH0sXG5cblx0XHRCZXJuc3RlaW46IGZ1bmN0aW9uICggbiAsIGkgKSB7XG5cblx0XHRcdHZhciBmYyA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuRmFjdG9yaWFsO1xuXHRcdFx0cmV0dXJuIGZjKCBuICkgLyBmYyggaSApIC8gZmMoIG4gLSBpICk7XG5cblx0XHR9LFxuXG5cdFx0RmFjdG9yaWFsOiAoIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0dmFyIGEgPSBbIDEgXTtcblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICggbiApIHtcblxuXHRcdFx0XHR2YXIgcyA9IDEsIGk7XG5cdFx0XHRcdGlmICggYVsgbiBdICkgcmV0dXJuIGFbIG4gXTtcblx0XHRcdFx0Zm9yICggaSA9IG47IGkgPiAxOyBpLS0gKSBzICo9IGk7XG5cdFx0XHRcdHJldHVybiBhWyBuIF0gPSBzO1xuXG5cdFx0XHR9O1xuXG5cdFx0fSApKCksXG5cblx0XHRDYXRtdWxsUm9tOiBmdW5jdGlvbiAoIHAwLCBwMSwgcDIsIHAzLCB0ICkge1xuXG5cdFx0XHR2YXIgdjAgPSAoIHAyIC0gcDAgKSAqIDAuNSwgdjEgPSAoIHAzIC0gcDEgKSAqIDAuNSwgdDIgPSB0ICogdCwgdDMgPSB0ICogdDI7XG5cdFx0XHRyZXR1cm4gKCAyICogcDEgLSAyICogcDIgKyB2MCArIHYxICkgKiB0MyArICggLSAzICogcDEgKyAzICogcDIgLSAyICogdjAgLSB2MSApICogdDIgKyB2MCAqIHQgKyBwMTtcblxuXHRcdH1cblxuXHR9XG5cbn07XG5cbi8vIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKVxuKCBmdW5jdGlvbiAoIHJvb3QgKSB7XG5cblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTURcblx0XHRkZWZpbmUoIFtdLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gVFdFRU47XG5cdFx0fSApO1xuXG5cdH0gZWxzZSBpZiAoIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyApIHtcblxuXHRcdC8vIE5vZGUuanNcblx0XHRtb2R1bGUuZXhwb3J0cyA9IFRXRUVOO1xuXG5cdH0gZWxzZSB7XG5cblx0XHQvLyBHbG9iYWwgdmFyaWFibGVcblx0XHRyb290LlRXRUVOID0gVFdFRU47XG5cblx0fVxuXG59ICkoIHRoaXMgKTtcbiJdfQ==
