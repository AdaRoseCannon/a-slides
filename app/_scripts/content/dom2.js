let appendTarget;
const TWEEN = require('tween.js'); 

const templates = {
	demoApp: `
		<div class="panel panel-primary pretend-web-app">
			<div class="panel-heading">My Web App</div>
			<div class="panel-body pretend-web-app-body">
				<div class="panel panel-success">
					<div class="panel-heading">Notifications</div>
					<div class="panel-body notifications-go-here">
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading">Widget 2.</div>
					<div class="panel-body">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading">Widget 3.</div>
					<div class="panel-body">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
					</div>
				</div>
			</div>
		</div>`,

	notification:
		c => `<div class="alert alert-dismissable alert-warning">
			<button type="button" class="close" data-dismiss="alert">×</button><b>Warning ${c}</b>: Server Room On Fire
		</div>`
};

let timeout;
let raf;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup() {
		appendTarget = make.div();
		let t = 0;
		(function animate() {
			TWEEN.update(t);
			t += 16;
			raf = requestAnimationFrame(animate);
		})();
	},
	action: function* () {
		this.appendChild(appendTarget);

		function displayBoundingRects(els) {
			els.forEach(el => {
				var dimensions = el.getBoundingClientRect();
				var dimensionIndicator = make.div();
				dimensionIndicator.classList.add("dimensionIndicator");
				dimensionIndicator.dataset.tl= `${parseInt(dimensions.left, 10)}, ${parseInt(dimensions.top, 10)}`;
				dimensionIndicator.dataset.br= `${parseInt(dimensions.right, 10)}, ${parseInt(dimensions.bottom, 10)}`;
				dimensionIndicator.css(dimensions);
				$('.slide-container').appendChild(dimensionIndicator);
			});
		}

		let notificationCount = 0;
		const addNotification = () => {
			let newNotification = make.div().addHTML(templates.notification(++notificationCount));
			appendTarget.$('.notifications-go-here').prepend(newNotification);
			return newNotification;
		};

		// yields at interesting points
		function *magicTransformGen ({
			fn,
			elementsToWatch,
			callback,
			time
		}) {
			let measurements = elementsToWatch.map(el => {
				let output = {
					el,
					initialDimensions: el.getBoundingClientRect()
				};
				return output;
			});

			// calculate the children's offsets
			measurements.forEach(m => {

				// Set the child transform offsets to the parents top left
				// so that when scaled down they also retun to their orignal position.
				[...m.el.children].forEach(el  => {
					const size = el.getBoundingClientRect();
					let offsetFromParent = {
						x: size.left - m.initialDimensions.left,
						y: size.top - m.initialDimensions.top
					};
					el.style.transformOrigin = `${offsetFromParent.x}px ${offsetFromParent.y}px`;
				});
			});

			// Demonstrate measuring
			displayBoundingRects(elementsToWatch);
			yield;
			$$('.dimensionIndicator').forEach(i => i.removeSelf());

			// Run the function which makes changes.
			fn();

			// Demonstrate measuring
			displayBoundingRects(elementsToWatch);
			yield;
			$$('.dimensionIndicator').forEach(i => i.removeSelf());

			// calculate the new size/offset of each el
			measurements.forEach(m => {
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
			function setElSize(m) {
				m.el.style.transform = `translate(${m.newTransform.offsetX * m.newTransform.scaleX}px, ${m.newTransform.offsetY * m.newTransform.scaleY}px) scale(${m.newTransform.scaleX}, ${m.newTransform.scaleY})`;
			}

			// set it's children's transforms to the inverse of it's own
			function setChildrenScale(m) {
				[...m.el.children].forEach(el  => {
					el.style.transform = `scale(${1/m.newTransform.scaleX}, ${1/m.newTransform.scaleY})`;
				});
			}

			// Restore the initial sizes
			measurements.forEach(setElSize);
			yield;

			// Scale the children too
			measurements.forEach(setChildrenScale);
			yield;

			// Animate the restoration
			Promise.all(measurements.map(m => {
				return new Promise(resolve => {
					new TWEEN.Tween( m.newTransform )
						.to( {
							scaleY: 1,
							scaleX: 1,
							offsetX: 0,
							offsetY: 0
						}, time || 1000 )
						.easing( TWEEN.Easing.Quadratic.Out )
						.onUpdate( function () {
							m.newTransform.scaleX = this.scaleX;
							m.newTransform.scaleY = this.scaleY;
							m.newTransform.offsetX = this.offsetX;
							m.newTransform.offsetY = this.offsetY;
							setElSize(m);
							setChildrenScale(m);
						})
						.onComplete(resolve)
						.start();
				});
			}))
			.then(callback || function () {});
		}

		function *changeContent() {

			yield addNotification();
			yield addNotification();

			let myThing = make.div();
			myThing.innerHTML = `<div class="panel panel-default">
				<div class="panel-body">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
				</div>
			</div>`;

			$('.pretend-web-app-body').prepend(myThing);
			yield myThing;
		}

		// Add the demoApp
		appendTarget.empty().addHTML(templates.demoApp);

		const naiveContent = changeContent();
		timeout = setInterval(() => naiveContent.next(), 2000);
		yield;

		clearInterval(timeout);
		appendTarget.empty().addHTML(templates.demoApp);

		let smoothAdding = true;
		const smoothContent = changeContent();
		(function smoothAdd() {
			let newEl;
			const magicTransform1 = magicTransformGen({
				fn: () => {
					newEl = smoothContent.next().value;
					if (newEl) newEl.style.opacity = 0;
				},
				elementsToWatch: appendTarget.$$('.panel:not(.pretend-web-app)'),
				time: 1000,
				callback: () => { 
					if (newEl) newEl.css({
						transition: 'opacity 0.3s ease',
						opacity: 1
					});
					if (smoothAdding) smoothAdd();
				}
			});

			// Just do it all in one go;
			for (let i of magicTransform1){}
		})();

		yield;

		// Stop adding more
		smoothAdding = false;

		// Reset then go through again this time step by step
		// showing the child element the whole time
		// 
		appendTarget.empty().addHTML(templates.demoApp);
		const magicTransform2 = magicTransformGen({
			fn: addNotification,
			elementsToWatch: appendTarget.$$('.panel:not(.pretend-web-app)'),
			time: 1000
		});

		// pause at each yield
		for (let i of magicTransform2) yield i;
		yield;
	},
	teardown() {
		clearInterval(timeout);
		cancelAnimationFrame(raf);
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
