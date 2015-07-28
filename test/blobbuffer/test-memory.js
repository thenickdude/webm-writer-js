function assert(test, message) {
    $("body").append((test ? "Pass" : "Fail" ) + " - " + message + "<br>");
}

// Returns a promise that converts the blob to a string
function readBlobAsString(blob) {
    return new Promise(function(resolve,reject) {
        var 
            reader = new FileReader();

        reader.addEventListener("loadend", function() {
            resolve(reader.result);
        });
        
        reader.readAsBinaryString(blob);
    });
}

$(document).ready(function() {
    var
        blobBuffer = new BlobBuffer();

    assert(blobBuffer.pos == 0, "Initial pos correct");

    blobBuffer.write(new Blob(["Hello, "]));

    assert(blobBuffer.pos == 7, "Pos advance correctly (Blob)");

    blobBuffer.write("world");
    
    assert(blobBuffer.pos == 12, "Pos advance correctly (String)");

    var
        arr = new Uint8Array(2);
    
    arr[0] = '?'.charCodeAt(0);
    arr[1] = '!'.charCodeAt(0);
    
    blobBuffer.write(arr);

    assert(blobBuffer.pos == 14, "Pos advance correctly (Uint8Array)");

    blobBuffer.write(arr.buffer);

    assert(blobBuffer.pos == 16, "Pos advance correctly (ArrayBuffer)");
    assert(blobBuffer.length == 16, "Length property correct");
    
    blobBuffer.complete().then(function(blob) {
        assert(blob.size == blobBuffer.pos, "Blob size correct");
        
        return readBlobAsString(blob);
    }).then(function(string) {
        assert(string == "Hello, world?!?!", "Resulting blob correct");
        
        blobBuffer.seek(2);
        blobBuffer.write("-man");
        
        assert(blobBuffer.length == 16, "Buffer 'length' field unchanged after overwrite");
        
        return blobBuffer.complete();
    }).then(function(blob) {
        assert(blob.size == 16, "Blob size unchanged after overwrite");
        
        return readBlobAsString(blob);
    }).then(function(string) {
        assert(string == "He-man world?!?!", "Overwritten data correct");
        
        blobBuffer.seek(blobBuffer.length);
        
        var
            arrBuffer = new ArrayBuffer(10),
            array = new Uint8Array(arrBuffer, 1, 4),
            message = " Hi.";
        
        for (var i = 0 ; i < 4; i++) {
            array[i] = message.charCodeAt(i);
        }
        
        blobBuffer.write(array);
        
        return blobBuffer.complete();
    }).then(function(blob) {
        assert(blob.size == 20, "Writing a Uint8Array which is smaller than its parent ArrayBuffer uses the correct size");
        
        return readBlobAsString(blob);
    }).then(function(string) {
        assert(string == "He-man world?!?! Hi.", "Written data correct");
    });
});