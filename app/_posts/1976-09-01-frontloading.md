---
layout: slide
categories: SlideShow
---

<div class="panel slide-content">
<div class="panel-body">

</div>
</div>
<div class="panel notes">
<div class="panel-body marked">
# Trading precaching for performance

On the a page's first load it is pretty common practice to cache a whole bunch of assets for later use.

Front loading your content like this can be great for later loading performance.

Unfortunately parzing JS and decoding images can also quite expensive.

This added stress can make your site's first few moments be really janky or even unresponsive.

The user can neither click nor scroll. You might as well have just sent down a pretty picture of your above the fold content.

***When the page looks like it is ready to be used it should also be readily responding to a users interactions.***

Especially if a site has an interstitial.

The user's very first interaction with your site, they are presented with

A barrier requiring the user to interact in order to see sone content.

Since the browser is struggling with parzing and caching the new assets.

The user's attempts to close the interstial are futile or laggy,  
they will probably bounce. rather than wait for the site to start working

***The interstitial looked closable but wasn't responding straight away this is not a good experience***

Load just the minimum amount of content for the first use. Load more later into the site's life time.

If there is need to query some large JSON to view your site but not all the data is needed right there and then.

Don't try to eat an elephant in a single mouthful.

If you are using a Service Worker you are probably already doing precaching off thread using the cache API so good on you.

On our Six Degrees of Angela Merkel Four oh Four page project I start with just 20s worth of precalculated data for our animation to get started fast.

The remaining 10MB of data was also broken into 20s chunks which could be parzed in a single frame.

Parzing a full 10MB JSON file would have caused our smooth animation to look Janky during the first few seconds when we have the most of the user's attention.

You can compromise on performance though,

The times when the site needs to be most responsive is when interaction and animation is happening e.g. the user is touching, dragging, swiping or scrolling or when the user is being prompted for input.

But there are a few situations where you can be slow without the user noticing for example just after a click or tap interaction it takes about 100ms unresponsiveness for a site to start to feel slow.

Which is oodles of time to perform a large calculation such as precaching data or performing calculations for an upcoming animation. 

[If you are reading my notes check the code for the fastdom slide]

If you are careful and nothing is being animated for example the user is reading an article take this time to deserialise a json object or precache the user's potential actions.

</div>
</div>
