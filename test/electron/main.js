const 
	{app, BrowserWindow, ipcMain, dialog} = require('electron'),

	path = require('path'),
	url = require('url');

let 
	mainWindow;

ipcMain.on('save-file-dialog', function (event) {
	return dialog.showSaveDialog({
		title: "Write video to file...",
		defaultPath: "video.webm",
		filters: [
			{
				name: "WebM video",
				extensions: ["webm"]
			}
		]
	})
		.then(file => {
			event.sender.send('selected-file', file.filePath);
		})
		.catch(e => event.sender.send('selected-file', null));
})

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		title: "WebM writer test",
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true
		}
	});
	
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'test.html'),
		protocol: 'file:',
		slashes: true
	}));
	
	mainWindow.webContents.openDevTools();
	
	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});

