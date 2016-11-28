# WebM Writer for Electron

This is a WebM video encoder based on the ideas from [Whammy][]. It allows you to turn a series of 
Canvas frames into a WebM video.

This implementation allows you to create very large video files (exceeding the size of available memory), because it
can stream chunks immediately to a file on disk while the video is being constructed, 
instead of needing to buffer the entire video in memory before saving can begin. Video sizes in excess of 4GB can be 
written. The implementation currently tops out at 32GB, but this could be extended.

When not streaming to disk, it can instead buffer the video in memory as a series of Blobs which are eventually 
returned to the calling code as one composite Blob. This Blob can be displayed in a &lt;video&gt; element, transmitted 
to a server, or used for some other purpose. Note that Chrome has a [Blob size limit][] of 500MB.

[Whammy]: https://github.com/antimatter15/whammy
[Blob size limit]: https://github.com/eligrey/FileSaver.js/

## Usage

Add webm-writer to your project:

```
npm install --save webm-writer
```

Require and construct the writer, passing in any options you want to customize:

```js
var 
    WebMWriter = require('webm-writer'),
    
    videoWriter = new WebMWriter({
        quality: 0.95,    // WebM image quality from 0.0 (worst) to 1.0 (best)
        fd: null,         // Node.js file descriptor to write to instead of buffering to memory (optional)
    
        // You must supply one of:
        frameDuration: null, // Duration of frames in milliseconds
        frameRate: null,     // Number of frames per second
    });
```

Add as many Canvas frames as you like to build your video:

```js
videoWriter.addFrame(canvas);
```

When you're done, you must call `complete()` to finish writing the video:

```js
videoWriter.complete();
```

`complete()` returns a Promise which resolves when writing is completed.

If you didn't supply a `fd` in the options, the Promise will resolve to Blob which represents the video. You
could display this blob in an HTML5 &lt;video&gt; tag:

```js
videoWriter.complete().then(function(webMBlob) {
    $("video").attr("src", URL.createObjectURL(webMBlob));
});
```

There's an example which saves the video to an open file descriptor instead of to a Blob on this page:

https://github.com/thenickdude/webm-writer-js/tree/master/test/electron
