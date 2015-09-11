/**
 * The key names match the slideId in the _posts directory
 */

module.exports = {
	'/jank': require('./jank'),
	'/dom': require('./dom'),
	'/dom2': require('./dom2'), // Page removed
	'/worker': require('./worker'),
	'/containment': require('./containment'),
	'/demos': require('./demos'),
	'/simd': require('./simd'),
	'/frontloading': require('./frontloading'),
};
