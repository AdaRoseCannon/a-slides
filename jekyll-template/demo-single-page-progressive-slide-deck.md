---
layout: post
title: Demo Slide Deck From Single Page
description: Building a slide deck from a single page
image: https://ada.is/progressive-web-apps-talk/images/FinancialTimes_G-FTUS_Balloon_LordMayorsAppeal.jpg
script1: scripts/content/LoaPN.js
---

<!-- Link to trigger conversion script LoaPN -->

[Convert to Slide Deck](#aslides)

<!-- Everything below this is content -->

# A-Slides From single Page Post

* This is useful for creating a blog post which is also a slide deck.
* Each slide is a block quote
* All the content before a slide appears as the notes for that slide.

<blockquote class="dark" id="splash-slide" style="background-image: url('images/patter.svg');">
<h1>{{ site.name }}</h1>
<div class="labs-logo"></div>
<h3>{{ site.description }}</h3>
<h2>Ada Rose Edwards - Financial Times</h2>
</blockquote>

* Block quotes can also be defined short hand as well

> # Content Goes Here
> Demo slide

# This h1 is what defines the slide name

* Animations are defined as generators, when the yeild whenever you are awaiting an input from the presenter.
* setup is run and action are run when the slide is being moved into position.
* action's next() is called repeatedly with each input.
* teardown() is called after the slide has been hidden
* pressing back will run teardown() and reinitialise action()
* for a complex example see: https://github.com/AdaRoseEdwards/progressive-web-apps-talk/blob/gh-pages/scripts/content/LoaPN.js

>```javascript
window.aSlidesSlideData = {'slide-this-h1-is-what-defines-the-slide-name': {
	setup() {},
	action: function *() {
		this.appendChild(window.MAKE.markdown('# Hello'));
		yield;
		this.appendChild(window.MAKE.markdown('# World'));
	},
	teardown: {
		this.innerHTML = '';
	}
}}
>```