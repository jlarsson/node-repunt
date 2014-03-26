# node-repunt

Webcrawler for node

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
    .on('enqueue', function (task) {  // called once per distinct queued url
        //console.log('ENQUEUE',task.url);
    })
    .on('init', function (task) { // called before an actual request is issued
        // console.log('INIT',task.url);
    })
    .on('complete', function (task) { // called when result from fecth is available
        if (task.$){
            console.log(task.$('title').text());
        }
    })
    .on('error', function (error) { // hopefully never called
        console.log('ERROR',error);
    })
    .on('done', function (){  // called once after all other events
        console.log('SPIDER DONE');
    })
    .enqueue('http://localhost/start')
    .start();
```
