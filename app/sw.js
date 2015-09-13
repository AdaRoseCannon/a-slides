/* global toolbox, importScripts */
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

toolbox.precache(resources);

toolbox.router.default = (location.protocol === 'http:' || location.hostname === 'localhost') ? toolbox.networkFirst : toolbox.fastest;
