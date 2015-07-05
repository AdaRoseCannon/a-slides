const slideData = require('../slides');

module.exports.triggerEvent = {
	next() {
		return {done: false};
	}
};

module.exports.setup = function (name) {
	if (slideData[name]) {
		slideData[name].setup.bind(document.getElementById(name).querySelector('.panel-primary .panel-body'))();
	} else {
		slideData[name] = {
			setup() {},
			action: function* (){yield;},
			teardown() {}
		};
	}
	module.exports.triggerEvent = slideData[name].action.bind(document.getElementById(name).querySelector('.panel-primary .panel-body'))();

	// Do first action
	module.exports.triggerEvent.next();
};

module.exports.teardown = function (name) {
	if (slideData[name]) {
		slideData[name].teardown.bind(document.getElementById(name).querySelector('.panel-primary .panel-body'))();
	}
};
