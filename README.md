inquisition
===========

Ajax Convenience:

```javascript

new Inquisition({
    url: '/object',
    data: {
        name: 'new object name'
    },
    method: 'PUT'
}).async(function(r) {
    console.log(r.object); // {id: 4, name: 'new object name'}
});

```
