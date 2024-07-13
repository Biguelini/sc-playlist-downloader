const fs = require('fs');
const scdl = require('soundcloud-downloader').default;
const path = require('path');

const PLAYLIST_URL = 'https://soundcloud.com/trending-music-br/sets/techno';

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

const getTrackLinks = async (playlistUrl) => {
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
	retorno = {
		playlistTitle,
		links
	}

	return retorno;
};

getTrackLinks(PLAYLIST_URL).then((res) => {
	const playlistTitle = res.playlistTitle
	const links = res.links;

	const downloadsDir = path.join(__dirname, 'downloads');
    const playlistDir = path.join(downloadsDir, playlistTitle);

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    if (!fs.existsSync(playlistDir)) {
      fs.mkdirSync(playlistDir);
    }

	links.map((link) => {
		downloadTrack(link, playlistTitle);
	})
})