var marked = require('marked');
var Templates = require('./templates');
var timeouts = {};

module.exports = {
	'slide-0': {
		setup() {},
		action: function* () {
			yield;
		},
		teardown() {}
	},
	'slide-1': {
		setup() {},
		action: function* () {

			var t = $(this).find('.render-here');
			var templates = Templates['slide-1'];
			var image = $(templates[0]);
			yield;

			t.append(image);
			yield;

			t.html(marked(templates[1]));
			yield;

			t.html(marked(templates[2]));
			yield;
		},
		teardown() {
			$(this).find('.render-here').html('');
		}
	},
	'slide-2': {
		setup() {},
		action: function* () {

			var t = $(this).find('.render-here');
			var templates = Templates['slide-2'];

			t.html('');
			var i = 0;
			var pre = $('<pre></pre>');
			t.append(pre);
			timeouts.s2 = setInterval(() => {
				pre.append(i++ % 2 === 1 ? 'myVar = el.clientHeight;' : 'el.height = (myVar + 1) + "px"');
				pre.append('\n');
			}, 800);
			yield;

			clearInterval(timeouts.s2);
			t.html(templates[0]);
			yield;

			t.html(marked(templates[1]));
			yield;

		},
		teardown() {
			clearInterval(timeouts.s2);
			$(this).find('.render-here').html('');
		}
	},
	'slide-3': {
		setup() {},
		action: function* () {

			function displayBoundingRects(els) {
				els.forEach(el => {
					var dimensions = el.getBoundingClientRect();
					var dimensionIndicator = $(`<div data-tl="${parseInt(dimensions.left, 10)}, ${parseInt(dimensions.top, 10)}" data-br="${parseInt(dimensions.right, 10)}, ${parseInt(dimensions.bottom, 10)}"></div>`).css(dimensions).addClass('dimensionIndicator');
					$('.slide-container').append(dimensionIndicator);
				});
			}

			var addNotification = function () {
				let newNotification = $(templates.notification);
				t.find('.notifications-go-here').prepend(newNotification);
				return newNotification;
			}.bind(this);

			function unDeconstructedMagicTransform (fn, elementsToWatch, newTransition, callback) {
				let measurements = elementsToWatch.map(el => {
					let output = {
						el,
						initialDimensions: el.getBoundingClientRect(),
						initialTransformToRestore: el.style.transform,
						initialTransitionToRestore: el.style.transition
					};
					return output;
				});

				fn();

				measurements.forEach(m => {
					m.newDimensions = m.el.getBoundingClientRect();
					m.el.style.transition = "0s";
					let newScale = {
						y: m.initialDimensions.height/m.newDimensions.height,
						x: m.initialDimensions.width/m.newDimensions.width
					};
					let offset = {
						x: m.initialDimensions.left - m.newDimensions.left,
						y: m.initialDimensions.top - m.newDimensions.top
					};
					m.el.style.transformOrigin = "0 0 0";
					m.el.style.transform = `translate(${offset.x * newScale.x}px, ${offset.y * newScale.y}px) scale(${newScale.x}, ${newScale.y}) ${m.el.style.transform}`;
				});

				measurements.forEach(m => {
					let newScale = {
						y: m.initialDimensions.height/m.newDimensions.height,
						x: m.initialDimensions.width/m.newDimensions.width
					};
					$(m.el).children().toArray().forEach(el  => {
						let elDimensions = el.getBoundingClientRect();
						let offsetFromParent = {
							x: elDimensions.left - m.initialDimensions.left,
							y: elDimensions.top - m.initialDimensions.top
						};
						el.style.transformOrigin = `${offsetFromParent.x}px ${offsetFromParent.y}px`;
						el.style.transform = `scale(${1/newScale.x}, ${1/newScale.y}) ${el.style.transform}`;
					});
				});

				let transitionendFn = function () {
					transitionendFn = function () {};
					callback();
				};

				measurements.forEach(m => {
					const transition = `transform ${newTransition}`;
					m.el.style.transition = transition;
					m.el.style.transform = m.initialTransformToRestore;
					$(m.el).children().toArray().forEach(el  => {
						el.style.transition = transition;
						el.style.transform = "";
					});
					if (callback) {
						m.el.addEventListener('transitionend', transitionendFn);
					}
				});
			}

			var t = $(this).find('.render-here');
			var templates = Templates['slide-3'];
			var newTransition = "3s ease";

			t.html(templates.demoApp);
			setTimeout(addNotification, 500);
			timeouts.s3 = setInterval(addNotification, 2000);
			yield;

			clearInterval(timeouts.s3);
			t.html(templates.demoApp);
			yield;

			let tempNotification;
			let elementsToWatch = t.find('.panel:not(.pretend-web-app)').toArray();
			unDeconstructedMagicTransform(
				() => {
					tempNotification = addNotification();
					tempNotification.css({
						opacity: 0
					});
				},
				elementsToWatch,
				newTransition,
				() => {
					tempNotification.css({
						transition: 'opacity 0.3s ease',
						opacity: 1
					});
				}
			);
			yield;

			t.html(templates.demoApp);
			yield;

			elementsToWatch = t.find('.panel:not(.pretend-web-app)').toArray();
			let measurements = elementsToWatch.map(el => {
				let output = {
					el,
					initialDimensions: el.getBoundingClientRect(),
					initialTransformToRestore: el.style.transform,
					initialTransitionToRestore: el.style.transition
				};
				return output;
			});

			displayBoundingRects(elementsToWatch);
			yield;

			$('.dimensionIndicator').remove();
			addNotification();
			yield;

			measurements.forEach(m => {
				m.newDimensions = m.el.getBoundingClientRect();
				m.el.style.transition = "0s";
			});

			displayBoundingRects(elementsToWatch);
			yield;

			$('.dimensionIndicator').remove();
			yield;

			measurements.forEach(m => {
				let newScale = {
					y: m.initialDimensions.height/m.newDimensions.height,
					x: m.initialDimensions.width/m.newDimensions.width
				};
				let offset = {
					x: m.initialDimensions.left - m.newDimensions.left,
					y: m.initialDimensions.top - m.newDimensions.top
				};
				m.el.style.transformOrigin = "0 0 0";
				m.el.style.transform = `translate(${offset.x * newScale.x}px, ${offset.y * newScale.y}px) scale(${newScale.x}, ${newScale.y}) ${m.el.style.transform}`;
			});
			yield;

			measurements.forEach(m => {
				let newScale = {
					y: m.initialDimensions.height/m.newDimensions.height,
					x: m.initialDimensions.width/m.newDimensions.width
				};
				$(m.el).children().toArray().forEach(el  => {
					let elDimensions = el.getBoundingClientRect();
					let offsetFromParent = {
						x: elDimensions.left - m.initialDimensions.left,
						y: elDimensions.top - m.initialDimensions.top
					};
					el.style.transformOrigin = `${offsetFromParent.x}px ${offsetFromParent.y}px`;
					el.style.transform = `scale(${1/newScale.x}, ${1/newScale.y}) ${el.style.transform}`;
				});
			});
			yield;

			measurements.forEach(m => {
				const transition = `transform ${newTransition}`;
				m.el.style.transition = transition;
				m.el.style.transform = m.initialTransformToRestore;
				$(m.el).children().toArray().forEach(el  => {
					el.style.transition = transition;
					el.style.transform = "";
				});
			});
			yield;
		},
		teardown() {
			clearInterval(timeouts.s3);
			$('.dimensionIndicator').remove();
			$(this).find('.render-here').html('');
		}
	},
	'slide-4': {
		setup() {},
		action: function* () {
			var t = $(this).find('.render-here');
			var templates = Templates['slide-4'];
			t.html(templates.modal);
			t.find('.modal').modal();
			yield;
			t.html(marked(templates.containment));
			yield;
		},
		teardown() {
			$(this).find('.render-here').html('');
		}
	},
};