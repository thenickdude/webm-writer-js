VERSION=0.3.0
VERSIONED_DIST_FILE = dist/webm-writer-$(VERSION).js

all : dist/ $(VERSIONED_DIST_FILE) dist/webm-writer.js

dist/ :
	mkdir dist

$(VERSIONED_DIST_FILE) : dist/webm-writer.js
	cp $< $@

# Create the bundled version of the code by just concatenating the required source...
dist/webm-writer.js : src/ArrayBufferDataStream.js src/BlobBuffer.js src/WebMWriter.js
	cat $^ > $@

clean :
	rm -f dist/*