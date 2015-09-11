---
layout: slide
categories: SlideShow
---

<div class="panel slide-content">
<div class="panel-body marked">
# {{ site.name }}
## {{ site.description }}
<div class="author-card">
{{ site.author.name }} - @{{ site.author.twitter }}<br />
{{ site.author.company }}
</div>
</div>
</div>
<div class="panel notes">
<div class="panel-heading">Notes</div>
<div class="panel-body marked">
* Hi, I'm Ada Rose from FTLabs

This talk covers rendering and animation performance. Both in the DOM and also general 2D and 3D animation in the web.

***Insert conclusion***

The ideal feeling is that of a native experience. The user shouldn't feel their very expensive device is struggling to display a simple a web page. To achieve this we have a goal framerate of 60fps, which gives us 16ms to render a single frame.

When the frame takes longer to layout and render than 16ms that is jank. It looks like a stuttery discontinuity in the animation. 60fps with occasional hiccoups feels much slower than a continuous 30fps.

A long frame is caused by too much blocking activity in the main thread this can be most simply a long main thread loop in javascript or blocking io (e.g. synchronous ajax requests or very large local storage transactions).

</div>
</div>
