---
layout: slide
categories: SlideShow
---

<div class="panel slide-content">
<div class="panel-body marked">

</div>
</div>
<div class="panel notes">
<div class="panel-body marked">
# Layout Boundaries and Containment

Even though this modal looks isolated, the browser may still relayout the whole Dom as it's content changes.
However, we can seperate its layout invalidation from the rest of the page.
Doing so doesn't accelerate the animation, but it does make the layout change less catastophic.

There is a draft css spec called <a href="http://dev.w3.org/csswg/css-containment/" target="_blank">containment</a> which provides a hint to the browser that this element will not affect the rest of the DOM tree.

The containment spec requires certain properties, such as no scrolling and fixed dimensions.

{% highlight css %}
{
    height: <fixed value>;
    width: <fixed value or a %>;
    overflow: hidden;
    position: absolute;
    contain: strict; // In draft
}
{% endhighlight %}

Containment can be done in browsers currently, but it relies on undocumented browser behaviour requiring the element to have certain properties before it can be optimised, such as a fixed height and no scroll and is dependent upon the browser's implementation.

The containment property would be really good because it makes explicit as a performance enhancement what was previously a full set of properties. The performance gains from these could not be relied upon in every browser and using styling hacks for performance feels messy.

Containment will enforce the styling neccessary for the isolation. Which means it could potentially collapse down a box without a height and width set (either to 300px x 150px or to 0 x 0). It will clip all content outside of itself.

Layout Containment is _not_ style containment as defined in the web components spec.  Style containment stops custom elements styling affecting other elements; layout containment is a css property in draft to aid performance by allowing the browser to isolate certain elements from the rest of the DOM's layout tree.
</div>
</div>
