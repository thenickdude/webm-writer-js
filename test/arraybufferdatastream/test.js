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

function testEBMLVarInt() {
    var
        tests = [
             {input: 0,           output:[0x80]},
             {input: 1,           output:[0x81]},
             {input: 2,           output:[0x82]},
             {input: 126,         output:[0xFE]},
             {input: 127,         output:[0x40, 0x7F]}, // We avoid storing all-bits-one because it's a reserved encoding for Size field varints
             {input: 128,         output:[0x40, 0x80]},
             {input: 16382,       output:[0x7F, 0xFE]},
             {input: 16383,       output:[0x20, 0x3F, 0xFF]},
             {input: 16384,       output:[0x20, 0x40, 0x00]},
             {input: 2097150,     output:[0x3F, 0xFF, 0xFE]},
             {input: 2097151,     output:[0x10, 0x1F, 0xFF, 0xFF]},
             {input: 2097152,     output:[0x10, 0x20, 0x00, 0x00]},
             {input: 268435454,   output:[0x1F, 0xFF, 0xFF, 0xFE]},
             {input: 268435455,   output:[0x08, 0x0F, 0xFF, 0xFF, 0xFF]},
             {input: 268435456,   output:[0x08, 0x10, 0x00, 0x00, 0x00]},
             {input: 34359738366, output:[0x0F, 0xFF, 0xFF, 0xFF, 0xFE]},
        ],
        arrayBuffer = new ArrayBufferDataStream(5),
        allPass = true;

    for (var i = 0; i < tests.length; i++) {
        var
            test = tests[i];
        
        arrayBuffer.pos = 0;
        
        arrayBuffer.writeEBMLVarInt(test.input);
        
        if (arrayBuffer.pos != test.output.length) {
            allPass = false;
            assert(false, "EBML VarInt encoding of " + test.input + " has wrong length " + arrayBuffer.pos + " (expected " + test.output.length + ")");
        } else {
            var 
                encoded = arrayBuffer.getAsDataArray();
            
            for (var j = 0; j < test.output.length; j++) {
                if (encoded[j] != test.output[j]) {
                    allPass = false;
                    assert(false, "EBML VarInt encoding of " + test.input + " is wrong: " + Array.prototype.join.call(encoded, ",") + " (expected " + test.output + ")");
                    break;
                }
            }
        }
    }
    
    assert(allPass, "EBML VarInt tests");
}

function testUnsignedIntBE() {
    var
        tests = [
             {input: 0,             output:[0x00]},
             {input: 1,             output:[0x01]},
             {input: 2,             output:[0x02]},
             {input: 254,           output:[0xFE]},
             {input: 255,           output:[0xFF]}, 
             {input: 256,           output:[0x01, 00]},
             {input: 65534,         output:[0xFF, 0xFE]},
             {input: 65535,         output:[0xFF, 0xFF]},
             {input: 65536,         output:[0x01, 0x00, 0x00]},
             {input: 16777214,      output:[0xFF, 0xFF, 0xFE]},
             {input: 16777215,      output:[0xFF, 0xFF, 0xFF]},
             {input: 16777216,      output:[0x01, 0x00, 0x00, 0x00]},
             {input: 4294967294,    output:[0xFF, 0xFF, 0xFF, 0xFE]},
             {input: 4294967295,    output:[0xFF, 0xFF, 0xFF, 0xFF]},
             {input: 4294967296,    output:[0x01, 0x00, 0x00, 0x00, 0x00]},
             {input: 1099511627775, output:[0xFF, 0xFF, 0xFF, 0xFF, 0xFF]},
        ],
        arrayBuffer = new ArrayBufferDataStream(5),
        allPass = true;

    for (var i = 0; i < tests.length; i++) {
        var
            test = tests[i];
        
        arrayBuffer.pos = 0;
        
        arrayBuffer.writeUnsignedIntBE(test.input);
        
        if (arrayBuffer.pos != test.output.length) {
            allPass = false;
            assert(false, "UnsignedIntBE encoding of " + test.input + " has wrong length " + arrayBuffer.pos + " (expected " + test.output.length + ")");
        } else {
            var 
                encoded = arrayBuffer.getAsDataArray();
            
            for (var j = 0; j < test.output.length; j++) {
                if (encoded[j] != test.output[j]) {
                    allPass = false;
                    assert(false, "UnsignedIntBE encoding of " + test.input + " is wrong: " + Array.prototype.join.call(encoded, ",") + " (expected " + test.output + ")");
                    break;
                }
            }
        }
    }
    
    assert(allPass, "UnsignedIntBE tests");
}

$(document).ready(function() {
    testEBMLVarInt();
    testUnsignedIntBE();
});