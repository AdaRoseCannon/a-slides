---
layout: slide
categories: SlideShow
---

<div class="panel slide-content">
<div class="panel-body marked">
LocalStorage is not actually that bad, but some platforms may slowdown when it is full.
</div>
</div>
<div class="panel notes">
<div class="panel-body marked">

Of the older webapis which are synchronous ***LocalStorage*** is probably the most commonly still used. There are several situations where it can be slow:

http://www.stevesouders.com/blog/2014/02/11/measuring-localstorage-performance/

Although my recent tests in Cr45 for mobile and desktop show that performance is about 1/3 of writing to memory. It still may be best to use an async storage method such as IndexedDB.

</div>
</div>
