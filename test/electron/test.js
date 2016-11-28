var
	WebMWriter = require('webm-writer'),
	fs = require('fs'),
	{dialog} = require('electron').remote;

function pickFile() {
	return new Promise(function(resolve,reject) {
		dialog.showSaveDialog({
			title: "Write video to file...",
			defaultPath: "video.webm",
			filters: [
				{
					name: "WebM video",
					extensions: ["webm"]
				}
			]
		}, function(filename) {
			if (filename) {
				resolve(filename);
			} else {
				reject();
			}
		});
	});
}

function openFileForReadAndWrite(filename) {
	return new Promise(function(resolve,reject) {
		fs.open(filename, "w+", (err, fd) => {
			if (err) {
				reject(err);
				return;
			} else {
				resolve(fd);
			}
		});
	});
}

function renderToFile(fd) {
	return new Promise(function(resolve, reject) {
		var
			videoWriter = new WebMWriter({
				frameRate: 30,
				fd: fd
			}),
			
			canvas = document.getElementById("canvas"),
			context = canvas.getContext("2d"),
			
			helloWorld = "Hello World",
			
			textWidth,
			textHeight = 20,
			
			posX = 0, posY = 0,
			directionX = 1, directionY = 1,
			
			stepSize = 15,
			maxFrames = 200;
		
		context.font = textHeight + "pt Arial";
		textWidth = context.measureText(helloWorld).width;
		
		var renderFrame = function (frameIndex) {
			context.fillStyle = "#eee";
			context.fillRect(0, 0, canvas.width, canvas.height);
			
			context.fillStyle = "black";
			context.fillText(helloWorld, posX, posY + textHeight);
			
			videoWriter.addFrame(canvas);
			
			posX += directionX * stepSize;
			posY += directionY * stepSize;
			
			if (posX < 0 || posX + textWidth >= canvas.width) {
				directionX *= -1;
			}
			if (posY < 0 || posY + textHeight >= canvas.height) {
				directionY *= -1;
			}
			
			setTimeout(function () {
				if (frameIndex == maxFrames) {
					videoWriter.complete().then(() => resolve(fd));
				} else {
					renderFrame(frameIndex + 1);
				}
			}, 0);
		};
		
		renderFrame(0);
	});
}

$(document).ready(function() {
	pickFile().then(function(filename) {
		openFileForReadAndWrite(filename).then(renderToFile).then(function(fd) {
			fs.closeSync(fd);
			
			fs.readFile(filename, {encoding: "base64"}, function(err, data) {
				if (err) {
					throw err;
				}
				
				$("video").attr('src', "data:video/webm;base64," + data);
			});
		});
	});
});