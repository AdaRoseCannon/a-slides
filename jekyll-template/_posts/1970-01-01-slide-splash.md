---
layout: slide
categories: SlideShow
---

<div class="slide-content">
<div class="marked">
# {{ site.name }}
## {{ site.description }}
<div class="author-card">
{{ site.author.name }} - @{{ site.author.twitter }}<br />
{{ site.author.company }}
<div class="ft-labs"></div>
</div>
</div>
</div>
<div class="notes">
<div class="heading">Notes</div>
<div class="marked">
* Hi, I'm Ada Rose from FTLabs

Aim to cover rendering and animation performance.

Both in the DOM and also general 2D and 3D animation in the web.

I will touch on many different things and hope to provide some inspiration.

The ideal feeling is that of a native experience.

The goal of performance is so that the user doesn't notice the web page.

* Make sure user interactions such as scrolling/dragging is responsive
* From the moment the content is visible
* Manage user expectations, don't show what they cannot interact with
* Usually this means taking time to calculate an animation before rendering it
* If you can move as much as possible out of the main thread, into workers or onto the graphics card.

I'll begin with rendering the DOM then move onto some practises which help for animated visuals.

</div>
</div>
