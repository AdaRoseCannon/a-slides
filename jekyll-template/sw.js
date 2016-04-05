/* global toolbox, importScripts, self */
/* jshint browser:true */
'use strict';


importScripts('scripts/sw-toolbox.js');

var resources = [
	'styles/main.css',
	'scripts/main.js',
	'https://fonts.googleapis.com/css?family=Open+Sans:300italic,400,300,600,800',
	'https://s.gravatar.com/avatar/e137ba0321f12ecb5340680815b42c26?s=400',
	'./'
];

// Send a signal to all connected windows.
function reply(event) {
	return event.currentTarget.clients.matchAll({type: 'window'})
	.then(function (windows) {
		windows.forEach(function (w) {
			w.postMessage(event.data);
		});
	});
}

// Echo messages back to every window
self.addEventListener('message', function(event) {
	reply(event.data);
});

toolbox.precache(resources);

toolbox.router.default = (location.protocol === 'http:' || location.hostname === 'localhost') ? toolbox.networkFirst : toolbox.fastest;
