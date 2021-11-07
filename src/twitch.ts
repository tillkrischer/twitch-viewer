const clientId = "kimne78kx3ncx6brgo4mv6wki5h1ko";

const getAccessToken = (id: any, isVod: any) => {
    const url = "https://gql.twitch.tv/gql";
    const data = {
        operationName: "PlaybackAccessToken",
        extensions: {
            persistedQuery: {
                version: 1,
                sha256Hash: "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"
            }
        },
        variables: {
            isLive: !isVod,
            login: (isVod ? "" : id),
            isVod: isVod,
            vodID: (isVod ? id : ""),
            playerType: "embed"
        }
    }
    const options = {
        method: 'POST',
        headers: {
            'Client-id': clientId
        },
        body: JSON.stringify(data)
    }
    return fetch(url, options)
        .then(res => res.json())
        .then(json => isVod ? json.data.videoPlaybackAccessToken : json.data.streamPlaybackAccessToken);
}

const getPlaylist = (id: any, accessToken: any, vod: any) => {
    const url = `http://localhost:8080/usher.ttvnw.net:443/${vod ? 'vod' : 'api/channel/hls'}/${id}.m3u8?client_id=${clientId}&token=${accessToken.value}&sig=${accessToken.signature}&allow_source=true&allow_audio_only=true`;
    const options = { headers: { "x-requested-with": "twitch.tv" } };
    return fetch(url, options).then(res => res.text());
}

const parsePlaylist = (playlist: any) => {
    const parsedPlaylist = [];
    const lines = playlist.split('\n');
    for (let i = 4; i < lines.length; i += 3) {
        parsedPlaylist.push({
            quality: lines[i - 2].split('NAME="')[1].split('"')[0],
            resolution: (lines[i - 1].indexOf('RESOLUTION') !== -1 ? lines[i - 1].split('RESOLUTION=')[1].split(',')[0] : null),
            url: lines[i]
        });
    }
    return parsedPlaylist;
}

export const getStream = (channel: any, raw: boolean = false) => {
    return new Promise((resolve, reject) => {
        getAccessToken(channel, false)
            .then((accessToken) => getPlaylist(channel, accessToken, false))
            .then((playlist) => resolve((raw ? playlist : parsePlaylist(playlist))))
            .catch(error => reject(error));
    });
}

export const getVod = (vid: any, raw: any) => {
    return new Promise((resolve, reject) => {
        getAccessToken(vid, true)
            .then((accessToken) => getPlaylist(vid, accessToken, true))
            .then((playlist) => resolve((raw ? playlist : parsePlaylist(playlist))))
            .catch(error => reject(error));
    });
}
