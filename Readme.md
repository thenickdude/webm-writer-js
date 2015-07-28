# WebM Writer for JavaScript

This is a JavaScript-based WebM video encoder based on the ideas from [Whammy][]. It allows you to turn a series of 
Canvas frames into a WebM video.

This implementation allows you to create very large video files (exceeding the size of available memory), because it
can stream chunks immediately to a file on disk using a [FileWriter][] while the video is being constructed, instead of 
needing to buffer the entire video in memory before saving can begin. Video sizes in excess of 4GB can be written. 
The implementation currently tops out at 32GB, but this could be extended.

When a FileWriter is not available, it can instead buffer the video in memory as a series of Blobs which are eventually 
returned to the calling code as one composite Blob. This Blob can be displayed in a &lt;video&gt; element, transmitted 
to a server, or used for some other purpose. Note that Chrome has a [Blob size limit][] of 500MB.

[FileWriter]: https://developer.chrome.com/apps/fileSystem
[Whammy]: https://github.com/antimatter15/whammy
[Blob size limit]: https://github.com/eligrey/FileSaver.js/

## Usage

Include the script in your header:

```html
<script type="text/javascript" src="webm-writer-0.1.0.js"></script>
```

First construct the writer, passing in any options you want to customize:

```js
var videoWriter = new WebMWriter({
    quality: 0.95,    // WebM image quality from 0.0 (worst) to 1.0 (best)
    fileWriter: null, // FileWriter in order to stream to a file instead of buffering to memory (optional)
    
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

If you didn't supply a `fileWriter` in the options, the Promise will resolve to Blob which represents the video. You
could display this blob in an HTML5 &lt;video&gt; tag:

```js
videoWriter.complete().then(function(webMBlob) {
    $("video").attr("src", URL.createObjectURL(webMBlob));
});
```

## Compatibility

Because this code relies on browser support for encoding a Canvas as a WebP image (using `toDataURL()`), it is presently
only supported in Google Chrome. It will throw an exception on other browsers.

## License

This project is licensed under the WTFPLv2 https://en.wikipedia.org/wiki/WTFPL
