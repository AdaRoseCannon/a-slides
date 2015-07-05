// This is an example of a no-op config
// it will behave like this if you do not
// define it at all.

module.exports = {
	setup() {},
	action: function* () {
		yield;
	},
	teardown() {}
};
