# node-repunt

Webcrawler for node.

# Installation

```
npm install repunt
```

# Features
_repunt_ is a webcrawler characterized by
- standard eventpublishing through EventEmitter
- tight integration with [request](https://github.com/mikeal/request)
- optional caching, enabling incremental crawling and offline analysis
- markup analysis through [cheerio](https://github.com/MatthewMueller/cheerio)
- extensible filter architecture, allowing inspection, modification, prevention and enqueing of requests
- uses the best of the best libaries: [request](https://github.com/mikeal/request), [cheerio](https://github.com/MatthewMueller/cheerio), [lodash](https://github.com/lodash/lodash), [q](https://github.com/kriskowal/q)

# Quick sample
This sample crawls localhost, starting at http://localhost/start, following links until at most 10 distinct pages has been crawled.
For each page, if analyzable by cheerio ($), the title is sent to console.

```javascript
var repunt = require('repunt');
repunt({connections: 8})    // throttle to atmost 8 concurrent requests
    .use(repunt.cheerio())  // parse markup using cheerio
    .use(repunt.followLinks())  // follow <a href=...>
    .use(repunt.stayInRange(['http://localhost/'])) // dont stray away from this domain
    .use(repunt.trimHashes())   // ignore hashes: /start#about becomes /start
    .use(repunt.once()) // visit ecah distinct url at most once
    .use(repunt.atMost(10)) // limit to 10 requests all in all
    .use(repunt.fileCache('./temp/.cache')) // fetch from/save to cache
    .on('start', function (){ // called once before any other event
        console.log('SPIDER START');
    })
    .on('enqueue', function (task) {  // called once per queued url
        //console.log('ENQUEUE',task.url);
    })
    .on('init', function (task) { // called before an actual request is issued
        // console.log('INIT',task.url);
    })
    .on('complete', function (task) { // called when result from fetch is available
        if (task.$){
            console.log(task.$('title').text());
        }
    })
    .on('error', function (error /*, task - if applicable */) { // hopefully never called
        console.log('ERROR',error);
    })
    .on('done', function (){  // called once after all other events
        console.log('SPIDER DONE');
    })
    .enqueue('http://localhost/start')
    .start();
```

# Motivation
Why another crawler? I participated in several projects where public websites should be migrated to other platforms. In one particular case, it was an e-commerce without a product datase, so my only option was to crawl the existing site and pull out product information (descriptions, variant, related products, images, ...) from the web. This is generally timeconsuming and requires a lot of development of the analysis part. Having a nice crawler with good caching support (speedup is significant!) made my life easier.

# Filter cheatsheet

##### .use(repunt.trimHashes())
Removes hashes from urls. _http://www.mysite.com/start#index_ will be enqueued as _http://www.mysite.com/start_.

##### .use(repunt.ignoreQueryStrings(true))
Removes all querystrings. _http://www.mysite.com/start?a=1&b=2_ will be enqueued as _http://www.mysite.com/start_.

##### .use(repunt.ignoreQueryStrings(['a','b'))
Removes named querystring parameters. _http://www.mysite.com/start?a=1&b=2&c=1_ will be enqueued as _http://www.mysite.com/start?c=1_.

##### .use(repunt.once())
Any url will only be enqueued once. Always use...

##### .use(repunt.atMost(10))
Enqueue at most 10 urls. Great for testing.

##### .use(repunt.cheerio())
Response is parsed using cheerio and stored in _task.$_. Useful for DOM-inspection.

##### .use(repunt.followLinks())
If the cheerio filter is used, and the content type is something like _text/*_, links from _\<a href>_ are enqueued to the repunt instance.

##### .use(repunt.followImages())
Similar to _followLinks_ but enqueues _\<img src>_ instead.

##### .use(repunt.stayInRange(['http://site1/', 'http://site2/']))
Prevent repunt from straying away from site1 and site2, even crawled pages has links to this and that.
Always use, unless you want to crawl the whole internet!

##### .use(repunt.fileCache('./temp/.cache'))
Cache results (with http status 200) in the folder _./temp/.cache_.
Crawl the site once, throw away your network card, and you can still repeat you last run.
Great for offline analysis of sites.
FYI: _./temp/.cache/.index_ contains some useful info about whats cached.

# Architecture
## Tasks
Tasks are the objects keeping state about requests.
```javascript
{
    url: <url passed to repunt.enqueue(url, referer)>
    refererer: <referer url passed to repunt.enqueue(url, referer)>
    error: <error code set by setCompleted>
    response:  <response object set by setCompleted>
    body:  <body set by setCompleted>
    $: <typically set by cheerio filter>,
    ext: <object, storage for filter specific data>,
    promise: <promise object allowing stuff like task.promise.then(...) >,
    cancel: function () {/* cancel further processing of this task */ },
    setCompleted: function () {/* mark this task as fully handled */ },
    setResult: function (error, response, body) {/* set result from http fetch och cache loading */ },
}
```
Tasks are created from within repunt.enqueue() and are then passed around to filters and events.

## Filters
The drivig force in repunt are filters. A filter is expected to implement at least one of the methods in the canonical do-nothing example below

```javascript
{
    start: function (next, ctx) { next(); },
    enqueue: function (task, next, ctx) { next(); },
    init: function (task, next, ctx) { next(); },
    request: function (task, next, ctx) { next(); },
    complete: function (task, next, ctx) { next(); }
}
```

The _ctx_ parameter is the actual repunt instance and _next_ is a function that must be called for further processing of a task.
Depending on situation, further processing of a task an be prevented by
* not calling _next()_
* calling _task.cancel()_
* calling _task.setCompleted()_

The lifecycle is
* _start_ is called once per filter instance. Useful for complex initial setup.
* _enqueue_ is called when repunt.enqueue() is called. Some filters prevent furher execution in this step (_once_, _atMost_, _stayInRange_), while others like _trimHashes_ and _ignoreQueryStrings_ modifies _task.url_.
* _init_ is called right before the actual request object is created
* _request_ is called then task.request is set. This is a good place to modify headers and stuff.
* _complete_ is called when the task finally has a result (error, response, body)
 

Ordering of filters are important. For the standard filters the following order of url/request queue manipulating filters gives meaningful results:

1. trimHashes/ingoreQueryStrings
2. stayInRange
3. once
4. atmost

Content processing filters should have the order

1. cheerio
2. followLinks (depends on cheerio)
3. followImages (depends on cheerio)

# Testing
_mocha_-testsuite can be found in the _test_ folder.
