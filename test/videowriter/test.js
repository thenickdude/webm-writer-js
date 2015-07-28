function pickFile() {
    return new Promise(function(resolve, reject) {
        chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: "video.webm", accepts: [{extensions: ['webm']}]}, function(fileEntry) {
            var 
                error = chrome.runtime.lastError;
            
            if (error) {
                console.error(error.message);
                
                if (error.message != "User cancelled") {
                    console.log("Write failed");
                }
                
                reject();
            } else {
                resolve(fileEntry);
            }
        });
    });
}

function openFileForWrite(fileEntry) {
    return new Promise(function(resolve, reject) {
        fileEntry.createWriter(function (fileWriter) {
            resolve(fileWriter);
        }, function (e) {
            // File is not readable or does not exist!
            console.error(e);
            reject();
        });
    });
}

function renderToDevice(fileEntry, fileWriter) {
    var 
        videoWriter = new WebMWriter({
            frameRate: 30, 
            fileWriter: fileWriter
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
    
    var renderFrame = function(frameIndex) {
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
        
        setTimeout(function() {
            if (frameIndex == maxFrames) {
                if (fileWriter == null) {
                    videoWriter.complete().then(function(webMBlob) {
                        $("video").attr('src', URL.createObjectURL(webMBlob));
                        
                        saveAs(webMBlob, 'video.webm');
                    });
                } else {
                    videoWriter.complete().then(function() {
                        fileEntry.file(function(file) {
                            var
                                fileReader = new FileReader();
                            
                            fileReader.onloadend = function() {
                                $("video").attr('src', fileReader.result);
                            }
                            
                            fileReader.readAsDataURL(file);
                        });
                    });
                }
            } else {
                renderFrame(frameIndex + 1);
            }
        }, 0);
    };
    
    renderFrame(0);
}

$(document).ready(function() {
    if (chrome.fileSystem) {
        pickFile().then(function(fileEntry) {
            openFileForWrite(fileEntry).then(function(fileWriter) {
                renderToDevice(fileEntry, fileWriter);
            });
        })
    } else {
        renderToDevice(null);
    }
});