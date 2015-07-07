# a-slides
Customisable slideshow scaffolding using Jekyll and Generators

## Design philosphy

Minimalist to encourage running own Javascript inside generators to control slides

## Features

 * ES6 via babel
 * Styling via scss
 * Jekyll Building
 * Gulp
 * Service worker <- needs work, but will be 'push to offline'
 * Remote control via WebRTC (uses peerjs)

## How to use

### Editing slide template

* Slide templates go in the `app/_slides` directory. 
* The slides are ordered by the date part of the post.
* set the `slideId` to hook in the scripting

### Styling
 * Use scss examples: `app/_styles/_slide-splash.scss` & `app/_styles/_slide-global.scss`
 *  `app/_styles/_slides.scss` handles the transitioning handle with care.

### Writing slide scripts

* You can use commonjs and babel
* Required for any dynamic slides
* Annotated examples in `app/scripts/slides`
* break up the slide actions using `yield` in the generator.
* * Once the generator has completed it will move to the next slide
* You should tear down anything you do not want to persist on the slide in `teardown: function () {}`
* There are some helper functions added see: `app/_scripts/lib/util-polyfills.js` and the `app/scripts/slides/slide1.js` example.

## Faq

### Why the minimalist approach to on slide animation?

I wanted the ability to break up a script to demonstrate how it works at each step.
This resulted in using a generator to split it up by yielding at interesting points.
This approach generalised quite nicely to the whole slide show. The examples given in
this repo are quite minimalist but it works great for heavy javascript powered animations
three.js and D3 seem especially suited. 
