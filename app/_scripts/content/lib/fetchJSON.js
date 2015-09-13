/*global fetch*/
'use strict';

function fetchJSON(url, options) {
	return fetch(url, options)
		.then(function (response) { return response.text(); })
		.then(function (string) { return JSON.parse(string); });
}

module.exports = fetchJSON;
