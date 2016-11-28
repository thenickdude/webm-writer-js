chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('test.html', {
        'innerBounds' : {
            'width' : 1100,
            'height' : 600
        }
    });
});