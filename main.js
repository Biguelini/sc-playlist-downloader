const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const scdl = require('soundcloud-downloader').default;

const createWindow = () => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	win.loadFile('index.html');
};

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

ipcMain.handle('download-tracks', async (event, playlistUrl) => {
	let links = [];
	let playlistTitle = 'playlist'

	try {
		const playlist = await scdl.getSetInfo(playlistUrl);
		const tracks = playlist.tracks;
		playlistTitle = playlist.title.replace(/[<>:"/\\|?*]+/g, '');

		console.log(`Found ${tracks.length} tracks in playlist ${playlistTitle}`);

		tracks.forEach((track, index) => {
			links.push(track.permalink_url)
		});
	} catch (error) {
		console.error(`Error fetching playlist: ${error.message}`);
	}

	const downloadsDir = path.join(__dirname, 'downloads');
	const playlistDir = path.join(downloadsDir, playlistTitle);

	if (!fs.existsSync(downloadsDir)) {
		fs.mkdirSync(downloadsDir);
	}

	if (!fs.existsSync(playlistDir)) {
		fs.mkdirSync(playlistDir);
	}

	links.map((link) => {
		console.log(`baixando ${link}`)
		downloadTrack(link, playlistTitle);
	})

	retorno = {
		playlistTitle,
		links
	}

	return retorno;
});


const downloadTrack = async (trackUrl, playlistTitle) => {
	try {
		const stream = await scdl.download(trackUrl);
		const info = await scdl.getInfo(trackUrl);

		const path = `./downloads/${playlistTitle}/${info.title.replace(/[<>:"/\\|?*]+/g, '')}.mp3`;

		stream.pipe(fs.createWriteStream(path));
		console.log(`Downloaded: ${info.title}`);
	} catch (error) {
		console.error(`Error downloading track: ${error.message}`);
	}
};