const
    BlobBuffer = require("../BlobBuffer")(require('fs'));

function assert(test, message) {
    if (!test) {
        throw new Error(message);
    }
}

// Returns a promise that converts the blob to a string
function readBlobAsString(blob) {
    return new Promise(function (resolve, reject) {
        let
            reader = new FileReader();
        
        reader.addEventListener("loadend", function () {
            resolve(reader.result);
        });
        
        reader.readAsBinaryString(blob);
    });
}

describe("BlobBuffer", function() {
    
    it("The position is initially 0", function() {
        let
            blobBuffer = new BlobBuffer();
    
        assert(blobBuffer.pos == 0);
    });
    
    it("Advances position correctly when writing (Blob)", function() {
        let
            blobBuffer = new BlobBuffer();
    
        blobBuffer.write(new window.Blob(["Hello"]));
    
        assert(blobBuffer.pos == 5);
        assert(blobBuffer.length == 5);
    });
    
    it("Advances position correctly when writing (string)", function() {
        let
            blobBuffer = new BlobBuffer();
        
        blobBuffer.write(new Blob(["world!"]));
        
        assert(blobBuffer.pos == 6);
        assert(blobBuffer.length == 6);
    });
    
    it("Advances position correctly when writing (Uint8Array)", function() {
        let
            blobBuffer = new BlobBuffer(),
            arr = new Uint8Array(2);
    
        arr[0] = '?'.charCodeAt(0);
        arr[1] = '!'.charCodeAt(0);
    
        blobBuffer.write(arr);
        
        assert(blobBuffer.pos == 2);
        assert(blobBuffer.length == 2);
    });
    
    it("Advances position correctly when writing (ArrayBuffer)", function() {
        let
            blobBuffer = new BlobBuffer(),
            arr = new Uint8Array(3);
        
        arr[0] = '?'.charCodeAt(0);
        arr[1] = '!'.charCodeAt(0);
        arr[2] = '!'.charCodeAt(0);
        
        blobBuffer.write(arr.buffer);
    
        assert(blobBuffer.pos == 3);
        assert(blobBuffer.length == 3);
    });
    
    it("Produces the correct string upon reading a complex blobstream", function() {
        let
            blobBuffer = new BlobBuffer();
    
        blobBuffer.write(new Blob(["Hello, "]));
        blobBuffer.write("world");
    
        let
            arr = new Uint8Array(2);
    
        arr[0] = '?'.charCodeAt(0);
        arr[1] = '!'.charCodeAt(0);
    
        blobBuffer.write(arr);
        blobBuffer.write(arr.buffer);
    
        blobBuffer.complete().then(function (blob) {
            assert(blob.size == blobBuffer.pos, "Blob size correct");
        
            return readBlobAsString(blob);
        }).then(function (string) {
            assert(string == "Hello, world?!?!", "Resulting blob correct");
        
            blobBuffer.seek(2);
            blobBuffer.write("-man");
        
            assert(blobBuffer.length == 16, "Buffer 'length' field unchanged after overwrite");
        
            return blobBuffer.complete();
        }).then(function (blob) {
            assert(blob.size == 16, "Blob size unchanged after overwrite");
        
            return readBlobAsString(blob);
        }).then(function (string) {
            assert(string == "He-man world?!?!", "Overwritten data correct");
        
            blobBuffer.seek(blobBuffer.length);
        
            let
                arrBuffer = new ArrayBuffer(10),
                array = new Uint8Array(arrBuffer, 1, 4),
                message = " Hi.";
        
            for (let i = 0; i < 4; i++) {
                array[i] = message.charCodeAt(i);
            }
        
            blobBuffer.write(array);
        
            return blobBuffer.complete();
        }).then(function (blob) {
            assert(blob.size == 20, "Writing a Uint8Array which is smaller than its parent ArrayBuffer uses the correct size");
        
            return readBlobAsString(blob);
        }).then(function (string) {
            assert(string == "He-man world?!?! Hi.", "Written data correct");
        });
    });
});