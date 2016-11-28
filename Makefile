TARGET_FILE = webm-writer-$(VERSION).js

TEST_COPY = test/videowriter/webm-writer.js

$(TEST_COPY) : $(TARGET_FILE)
	cp $(TARGET_FILE) $(TEST_COPY)

$(TARGET_FILE) : src/ArrayBufferDataStream.js src/BlobBuffer.js src/WebMWriter.js
	cat $^ > $(TARGET_FILE)