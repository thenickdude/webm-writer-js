function renderTransparentVideo() {
    let
        videoWriter = new WebMWriter({
            frameRate: 30,
            quality: 0.9999,
            
            transparent: true
        }),
        
        canvas = document.getElementById("canvas1"),
        context = canvas.getContext("2d"),
        
        helloWorld = "Hello World",
        
        textWidth,
        textHeight = 35,
        
        posX = 0, posY = 0,
        directionX = 1, directionY = 1,
        
        stepSize = 15,
        maxFrames = 80;
    
    context.font = textHeight + "pt Arial";
    textWidth = context.measureText(helloWorld).width;
    
    let
        renderFrame = function(frameIndex) {
            // Create a transparent background:
            context.clearRect(0, 0, canvas.width, canvas.height);
    
            context.fillStyle = "rgb(0, 255, 0)";
            context.fillRect(posX - 10, posY - 10, 20, 20);
    
            context.fillStyle = "rgb(0, 0, 255)";
            context.fillRect(posX + textWidth - 10, posY + textHeight - 10, 20, 20);
    
            context.fillStyle = "red";
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
            
            setTimeout(function() {
                if (frameIndex == maxFrames) {
                    videoWriter.complete().then(function(webMBlob) {
                        document.getElementById("video1").src = URL.createObjectURL(webMBlob);
                    });
                } else {
                    renderFrame(frameIndex + 1);
                }
            }, 0);
        };
    
    renderFrame(0);
}

function renderTransparentMaskedVideo() {
    let
        videoWriter = new WebMWriter({
            frameRate: 30,
            quality: 0.9999,
            
            transparent: true
        }),
        
        canvas = document.getElementById("canvas2"),
        canvasContext = canvas.getContext("2d"),
    
        mask = document.getElementById("mask"),
        maskContext = mask.getContext("2d"),
        
        posX = 200, posY = 0,
        directionX = 1, directionY = 1,
        
        stepSize = 20,
        maxFrames = 80;
    
    let
        renderFrame = function(frameIndex) {
            // Main frame has a solid white background
            canvasContext.fillStyle = "white";
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
            
            canvasContext.fillStyle = "rgb(255,255,0)";
            canvasContext.fillRect(posX - 20, posY - 20, 40, 40);
            
            // The mask gets painted black where the final video should be transparent
            maskContext.fillStyle = "white";
            maskContext.fillRect(0, 0, mask.width, mask.height);
    
            let circleX = Math.sin(frameIndex / 10) * mask.width / 3 + mask.width / 2;
            let circleY = Math.cos(frameIndex / 10) * mask.height / 3 + mask.height / 2;
    
            maskContext.beginPath();
            maskContext.arc(circleX, circleY, 50, 0, 2 * Math.PI, false);
            maskContext.fillStyle = 'black';
            maskContext.fill();
            
            videoWriter.addFrame(canvas, mask);
    
            posX += directionX * stepSize;
            posY += directionY * stepSize;
            
            if (posX < 0 || posX >= canvas.width) {
                directionX *= -1;
            }
            if (posY < 0 || posY >= canvas.height) {
                directionY *= -1;
            }
            
            setTimeout(function() {
                if (frameIndex == maxFrames) {
                    videoWriter.complete().then(function(webMBlob) {
                        document.getElementById("video2").src = URL.createObjectURL(webMBlob);
                    });
                } else {
                    renderFrame(frameIndex + 1);
                }
            }, 0);
        };
    
    renderFrame(0);
}

document.addEventListener('DOMContentLoaded', function() {
    renderTransparentVideo();
    renderTransparentMaskedVideo();
}, false);