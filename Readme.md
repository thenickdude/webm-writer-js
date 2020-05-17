# WebM Writer for JavaScript

This is a JavaScript-based WebM video encoder based on the ideas from [Whammy][]. It allows you to turn a series of 
Canvas frames into a WebM video.

This implementation allows you to create very large video files (exceeding the size of available memory), because when
running in a privileged context like a Chrome extension or Electron app, it can stream chunks immediately to a file on disk 
using [Chrome's FileWriter][] while the video is being constructed, instead of needing to buffer the entire video in
memory before saving can begin. Video sizes in excess of 4GB can be written. The implementation currently tops out at 
32GB, but this could be extended.

When a FileWriter is not available, it can instead buffer the video in memory as a series of Blobs which are eventually 
returned to the calling code as one composite Blob. This Blob can be displayed in a &lt;video&gt; element, transmitted 
to a server, or used for some other purpose. Note that some browsers size limits on Blobs, particularly mobile 
browsers, check out the [Blob size limits][].

[Chrome's FileWriter]: https://developer.chrome.com/apps/fileSystem
[Whammy]: https://github.com/antimatter15/whammy
[Blob size limits]: https://github.com/eligrey/FileSaver.js/

## Compatibility

Because this code relies on browser support for encoding a Canvas as a WebP image (using `toDataURL()`), it is presently
only supported in Google Chrome. It will throw an exception on other browsers.

## Usage (Chrome)

Download the script from the [Releases tab][] above. You should end up with a `webm-writer-x.x.x.js` file to add to your
project.

[Releases tab]: https://github.com/thenickdude/webm-writer-js/releases

Include the script in your header:

```html
<script type="text/javascript" src="webm-writer-0.1.0.js"></script>
```

First construct the writer, passing in any options you want to customize:

```js
var videoWriter = new WebMWriter({
    quality: 0.95,    // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
    fileWriter: null, // FileWriter in order to stream to a file instead of buffering to memory (optional)
    fd: null,         // Node.js file handle to write to instead of buffering to memory (optional)

    // You must supply one of:
    frameDuration: null, // Duration of frames in milliseconds
    frameRate: null,     // Number of frames per second
});
```

Add as many Canvas frames as you like to build your video:

```js
videoWriter.addFrame(canvas);
```

You can override the duration of a specific frame in milliseconds like so:

```js
videoWriter.addFrame(canvas, 100);
```

Note that if the canvas' dimensions change between frames, the resulting WebM video may not be compatible with all players,
because the frame dimensions will differ from the overall track's dimensions. This could be improved in the future.

When you're done, you must call `complete()` to finish writing the video:

```js
videoWriter.complete();
```

`complete()` returns a Promise which resolves when writing is completed.

If you didn't supply a `fileWriter` or `fd` in the options, the Promise will resolve to Blob which represents the video. You
could display this blob in an HTML5 &lt;video&gt; tag:

```js
videoWriter.complete().then(function(webMBlob) {
    $("video").attr("src", URL.createObjectURL(webMBlob));
});
```

## Usage (Electron)

The video encoder can use Node.js file APIs to write the video to disk when running under Electron. There is an example
in `test/electron`. Run `npm install` in that directory to fetch required libraries, then `npm start` to launch Electron.

## License

This project is licensed under the WTFPLv2 https://en.wikipedia.org/wiki/WTFPL
