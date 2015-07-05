const slideData = require('../');

module.exports.triggerEvent = {
	next() {
		return {done: false};
	}
};

module.exports.setup = function (name) {
	if (slideData[name]) {
		slideData[name].setup.bind(document.getElementById(name))();
	} else {
		slideData[name] = {
			setup() {},
			action: function* (){yield;},
			teardown() {}
		};
	}
	module.exports.triggerEvent = slideData[name].action.bind(document.getElementById(name))();

	// Do first action
	module.exports.triggerEvent.next();
};

module.exports.teardown = function (name) {
	if (slideData[name]) {
		slideData[name].teardown.bind(document.getElementById(name))();
	}
};
