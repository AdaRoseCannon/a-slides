---
layout: slide
categories: SlideShow
---

<div class="panel slide-content">
<div class="panel-body marked">
<h1>Local Storage</h1>
Local Storage is Syncronous IO, but not actually that slow.

But it can be:


http://www.stevesouders.com/blog/2014/02/11/measuring-localstorage-performance/

</div>
</div>
<div class="panel notes">
<div class="panel-body marked">

Of the older webapis which are synchronous ***LocalStorage*** is probably the most commonly still used.

There are several situations where it can be slow.

My recent tests in Cr45 for mobile and desktop show that it's is about 1/3 of writing to memory.

So really not too bad.

If speed is essential it still may be best to use an async storage method such as IndexedDB.

Unlike local storage IndexedDB can also be used in workers.

</div>
</div>
