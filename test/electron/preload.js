const
	{ contextBridge, ipcRenderer } = require('electron'),
	fs = require("fs"),
	
	WebMWriter = require('webm-writer');

function pickVideoFile() {
	return new Promise((resolve, reject) => {
		ipcRenderer.on('selected-file', function (event, path) {
			if (path) {
				resolve(path);
			} else {
				reject();
			}
		});
		
		ipcRenderer.send('save-file-dialog');
	});
}

function openFileForReadAndWrite(filename) {
	return new Promise((resolve, reject) => {
		fs.open(filename, "w+", (err, fd) => {
			if (err) {
				reject(err);
			} else {
				resolve(fd);
			}
		});
	});
}

/* To avoid exposing the 'fs' module to the browser process, we expose a proxy here which 
 * handles all the filesystem operations.
 * 
 * Because WebMWriter itself needs access to 'fs', that object needs to live here too and can't
 * be marshalled to the browser. So we provide access to its functions over the bridge instead.
 * 
 * If you don't need WebMWriter to access the filesystem directly, you can load the regular
 * browser version of WebMWriter in the browser context instead using a script tag.
 */
contextBridge.exposeInMainWorld('WebMWriterProxy', {
	init: (options) => {
		return pickVideoFile().then(filename => {
			return openFileForReadAndWrite(filename).then(fd => {
				options.fd = fd;
				
				let
					writer = new WebMWriter(options);
				
				return {
					addFrame: (frame, alpha, overrideFrameDuration) => {
						writer.addFrame(frame, alpha, overrideFrameDuration);
					},
					complete: () => {
						return writer.complete().then(() => fs.closeSync(fd));
					},
					readAsDataURL: () => {
						return new Promise((resolve, reject) => {
							fs.readFile(filename, {encoding: "base64"}, (err, data) => {
								if (err) {
									reject(new Error("Failed to read video file"));
								}
								
								resolve("data:video/webm;base64," + data);
							});
						});
					}
				};
			});
		})
	},
});
