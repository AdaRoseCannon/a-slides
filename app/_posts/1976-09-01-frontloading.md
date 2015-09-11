---
layout: slide
categories: SlideShow
---

<div class="panel slide-content">
<div class="panel-body marked">

Wily cyote

Wily cyote backfire

Child Eating giant icecream

</div>
</div>
<div class="panel notes">
<div class="panel-body marked">
# Trading precaching for performance

On the a page's first load it is pretty common practice to cache a whole bunch of assets for later use.

Front loading your content like this can be great for later loading performance but parsing JS and decoding images can also quite expensive.

This added stress can make your site's first few moments be really janky or even unresponsive, as the user can neither click nor scroll. You might as well have just sent down a pretty picture of your above the fold content.

When the page looks like it is ready to be used it should also be readily responding to a users interactions.

Especially if you have an interstitial, I can't think of a faster way to make a user bounce than to hide the content with a box which cannot neither be closed or scrolled past because the rest of the site is still loading.

If there is need to query some large JSON to view your site but not all the data is needed right there and then. Aside from parsing it off thread as mentioned earlier one can just break up the JSON to so that it can be queried from the server in smaller API reqests a bit later into your pages life, http2 speeds this up nicely.

Don't try to eat an elephant in a single mouthful.

If you are using a Service Worker you are probably already doing precaching off thread using the cache API so good on you.

On our Six Degrees of Angela Merkel Four oh Four page project I start with 20s worth of precalculated data for our animation to get started fast. The remaining 5MB of data was also broken into 20s chunks which could be parzed in a single frame. Instead of marring the animation of the initial landing.

You can compromise on performance though, the times when the site needs to be most responsive is when animation is happening e.g. the user is touching, dragging, swiping or scrolling or when the user is being prompted for input. But there are a few situations where you can be slow without the user noticing for example just after a click or tap interaction it takes about 100ms unresponsiveness for a site to start to feel slow. Which is oodles of time to perform a large calculation such as measuring and relaying out the DOM a couple of times for an upcoming animation.

If you are careful and nothing is being animated for example the user is reading an article take this time to deserialise a json object or precache the user's potential actions.
</div>
</div>
