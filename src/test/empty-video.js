const
	WebMWriter = require("../main");

describe("WebMWriter", function() {
	it("Doesn't crash when rendering a video with zero frames", function() {
		let
			videoWriter = new WebMWriter({
				frameRate: 30
			});
		
		return videoWriter.complete().then(function (webMBlob) {
			if (webMBlob.length < 12) {
				throw new Error("Bad webMBlob " + webMBlob);
			}
		});
	});
});