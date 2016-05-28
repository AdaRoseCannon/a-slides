# a-slides
Customisable slideshow scaffolding using Jekyll and Generators

## Design philosphy

* Minimalist to encourage running own Javascript inside generators to control slides
* Extensible via plugins
* provides minimal styling so addtional styling can be provided by slide author

## How to use

## As a github pages site:

An example site is in [https://github.com/AdaRoseEdwards/a-slides/tree/master/jekyll-template](https://github.com/AdaRoseEdwards/a-slides/tree/master/jekyll-template)
it has two methods of creating slide content:

* Single page blog post which becomes a slide deck at the push of a button, in which blockquotes get treated as slides and the text around them becomes speakers notes.
.* [Demo]() [Source]()
* Each Jekyll post is a treated as a slide in the slide deck.
.* [Demo]() [Source]()

## on it's own

* include build/a-slides.js and build/a-slides.css in your page.
* when the script is done it converts appropriate DOM into slides.

```html
<div class="a-slides_slide-container">
	<div class="a-slides_slide active" data-slide-id="slide-id-for-deep-linking">
		<div class="dark a-slides_slide-content">
			Slide 1 Content goes here
		</div>
		<div class="a-slides_notes">
			Slide 1 Notes goes here
		</div>
	</div>
	<div class="a-slides_slide active" data-slide-id="slide-the-second-slide">
		<div class="dark a-slides_slide-content">
			Slide 2 Content goes here
		</div>
		<div class="a-slides_notes">
			Slide 2 Notes goes here
		</div>
	</div>
</div>
```
# API:

## Initialising

```javascript
	const slideData = [];
	const slideContainer = document.querySelector('.a-slides_slide-container');

	new ASlides(slideData, {
		slideContainer,
		plugins: [
			ASlides.prototype.plugins.markdownTransform, // needs to be run first
			ASlides.prototype.plugins.slideController, // needs to be run before buttons are added to it.
			ASlides.prototype.plugins.deepLinking,
			ASlides.prototype.plugins.interactionKeyboard,
			ASlides.prototype.plugins.interactionTouch({ // has configuration
				use: ['swipe-back']
			}),
			ASlides.prototype.plugins.bridgeServiceWorker,
			ASlides.prototype.plugins.bridgeWebRTC({ // PeerJS plugin so one slide controls the rest
				peerSettings: {
					host: 'example-peerjs-server.com',
					secure: true,
					port: 9000,
					debug: 2,
					path:"/peerjs"
				}
			})
		]
	});

	if (location.search === '?presentation') {
		slideContainer.classList.add('presentation');
	}

	if (location.search === '?notes') {
		slideContainer.classList.add('hide-presentation');
	}
```

## Inbuilt Plugins

* markdownTransform:
.* Converts the content of any dom element with a class of '.marked' into html using markdown syntax.

* slideController:
.* Adds some buttons to the top of the screen for going in and out of presentation mode

* deepLinking:
.* If the url contains a hash which matches a slide-id that slide gets displayed on load

* interactionKeyboard:
.* Adds key controls for progressing to the next slide or going back to the previous

* interactionTouch:
.* So one can swipe forward or back to previous slides.

* bridgeServiceWorker:
.* Allows one open tab to control another so you can have notes on one display and the presentation on another.
.* Requires a service worker set to echo some events, example:

```javascript
	// Send a signal to all connected windows.
	// Used for service worker bridge in a-slides
	function reply(data) {
		return self.clients.matchAll({type: 'window'})
		.then(function (windows) {
			windows.forEach(function (w) {
				w.postMessage(data);
			});
		});
	}

	// Echo messages back to every window
	self.addEventListener('message', function(event) {
		reply(event.data);
	});
```

* bridgeWebRTC:
.* Uses the peer.js library to connect to and control another client via WebRTC. Requires an existing peer.js signaling server.

## Events

```javascript
// goto a slide by id or by dom element
slideContainer.fire('a-slides_goto-slide', {slide: 0});
slideContainer.fire('a-slides_goto-slide', {slide: document.querySelector('.a-slide')});
```

## Writing plugins

Todo

# Styling

Example SCSS file: jekyll-template/styles/slides.scss

