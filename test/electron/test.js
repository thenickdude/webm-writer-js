(window => {
	const
		WebMWriterProxy = window["WebMWriterProxy"];
	
	function renderToFile() {
		return WebMWriterProxy.init({
			frameRate: 30
		}).then(writer => new Promise((resolve, reject) => {
			let
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
			
			let renderFrame = function (frameIndex) {
				context.fillStyle = "#eee";
				context.fillRect(0, 0, canvas.width, canvas.height);
				
				context.fillStyle = "black";
				context.fillText(helloWorld, posX, posY + textHeight);
				
				writer.addFrame(canvas);
				
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
						writer.complete()
							.then(() => writer.readAsDataURL())
							.then(resolve)
							.catch(reject);
					} else {
						renderFrame(frameIndex + 1);
					}
				}, 0);
			};
			
			renderFrame(0);
		}));
	}
	
	$(document).ready(() => {
		renderToFile().then(dataURL => {
			$("video").attr('src', dataURL);
		});
	});
})(window);