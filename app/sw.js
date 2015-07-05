/* global Cache, caches, fetch, Request, self */
/* jshint browser:true */

var RESOURCES_CACHE_NAME = 'resources_cache_v3';

var CACHE_MAX_AGE = 1000 * 60 * 60;

// Inline Cache polyfill
if (!Cache.prototype.add) {
	Cache.prototype.add = function add(request) {
		return this.addAll([request]);
	};
}

if (!Cache.prototype.addAll) {
	Cache.prototype.addAll = function addAll(requests) {
		var cache = this;

		// Since DOMExceptions are not constructable:
		function NetworkError(message) {
			this.name = 'NetworkError';
			this.code = 19;
			this.message = message;
		}
		NetworkError.prototype = Object.create(Error.prototype);

		return Promise.resolve().then(function() {
			if (arguments.length < 1) throw new TypeError();

			requests = requests.map(function(request) {
				if (request instanceof Request) {
					return request;
				}
				else {
					return String(request); // may throw TypeError
				}
			});

			return Promise.all(
				requests.map(function(request) {
					if (typeof request === 'string') {
						request = new Request(request);
					}

					var scheme = new URL(request.url).protocol;

					if (scheme !== 'http:' && scheme !== 'https:') {
						throw new NetworkError("Invalid scheme");
					}

					return fetch(request.clone());
				})
			);
		}).then(function(responses) {
			// TODO: check that requests don't overwrite one another
			// (don't think this is possible to polyfill due to opaque responses)
			return Promise.all(
				responses.map(function(response, i) {
					return cache.put(requests[i], response);
				})
			);
		}).then(function() {
			return undefined;
		});
	};
}

function isLocal(url) {
	return (new URL(url).host === location.host);
}

var resources = [
	'/favicon.ico',
	'/images/pattern.svg',
	'/styles/main.css',
	'/scripts/script.js',
	'https://fonts.googleapis.com/css?family=Open+Sans:300italic,400,300,600,800',
	'https://s.gravatar.com/avatar/e137ba0321f12ecb5340680815b42c26?s=400',
	'/'
];

// Send a signal to all connected windows.
function reply(event) {
	return event.currentTarget.clients.matchAll({type: "window"})
		.then(function (windows) {
			windows.forEach(function (w) {
				w.postMessage(event.data);
			});
		});
}

self.addEventListener('install', function(event) {
	console.log('Installing service worker');
	if (typeof event.replace !== "undefined") event.replace();
	event.waitUntil(
		caches.open(RESOURCES_CACHE_NAME)
			.then(function(cache) {
				resources.forEach(function (item) {
					cache.add(new Request(item, isLocal(item) ? {mode: 'no-cors'} : {}));
				});
			})
	);
});

// Recieve messages from the client and reply back onthe same port
self.addEventListener('message', function(event) {
		Promise.resolve()
		.then(function () {

			if (event.data.action === "STORE_ALL") {
				return caches.open(RESOURCES_CACHE_NAME)
					.then(function(cache) {
						return JSON.parse(event.data.urls).map(function (url) {
							console.log('Caching: ' + url);
							return cache.add(new Request(url, isLocal(url) ? {mode: 'no-cors'} : {}));
						});
					})
					.then(function (urlPromises) {
						return Promise.all(urlPromises);
					});
			}

			throw Error('Invalid Action');
		})
		.then(function () {
			event.data.success = true;
		}, function (err) {
			console.log(err);
			event.data.success = false;
			if (err) {
				event.data.message = err.message ? err.message : err;
			}
		})
		.then(function () {
			event.ports[0].postMessage(event.data);
		});
});

self.addEventListener('fetch', function(event) {

	// Don't try caching the webms
	if ((new URL(event.request.url)).pathname.slice(-4).toLowerCase() === 'webm') {
		return fetch(event.request);
	}


	var resp = caches.match(event.request)
		.then(function(r) {
			var age = Date.now() - (new Date(r.headers.get('Date')).getTime());

			// Update cached if it is more than 1 hour old
			if (r.headers.get('Date') && age > CACHE_MAX_AGE) {
				caches.open(RESOURCES_CACHE_NAME)
					.then(function(cache) {
						console.log('Updating: ' + event.request.url);
						return cache.add(event.request);
					})
					.then(function () {
						event.data = {
							action: "ASSET_REFRESHED",
							url: event.request.url
						};
						return event;
					})
					.then(reply);
			}
			return r;
		})
		.catch(function () {
			return fetch(event.request);
		})
		.then(function (fetchResponse) {
			caches.open(RESOURCES_CACHE_NAME).then(function(cache) {
				cache.put(event.request, fetchResponse);
			});
			return fetchResponse.clone();
		});
	event.respondWith(resp);
});
