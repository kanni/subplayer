


// Default configuration
var defaults = {
    host : null,
    user : null,
    password : null,
    version : "1.9.0"
}

// Define utils and helpers
function buildUrl(config, action, params = {}) {
    var base = `${config.host}/rest/${action}.view?u=${config.user}&p=${config.password}&v=${config.version}&f=json&c=myplayer`
    // Check if there are multiple valued keys
    const keys = Object.keys(params)
    for (var i = keys.length - 1; i >= 0; i--) {
        const key = keys[i]
        const value = params[key]
        if( Array.isArray(value) ) {
            // If an element has multiple values, add one key for each value
            base += value.map(val => `&${key}=${encodeURIComponent(val)}`).join("")
        }
        else {
            base += `&${key}=${encodeURIComponent(value)}`
        }
    }
    return base
}

function perform_api_call(url) {
    return fetch(url)
        .then(response => {
            var contentType = response.headers.get('content-type')
            if(contentType && contentType.includes('application/json')) {
                return response.json()
            }
            return Promise.reject(new Error(`${response.status}, ${response.body}`) )
        })
        .then(data => {
            // Get subsonic response
            const response = data["subsonic-response"]
            return response["status"] === "ok" ?
                response :
                Promise.reject(new Error(`${response.error.message}`))
        })
}

// Define main function
class Subsonic {

    constructor(config) {
        this.config = config
    }

    setConfig(host, username, password, encodePassword = true) {
        this.config = Object.assign(this.config, {
            host : host,
            user : username,
            password : `enc:${encodePassword ? this.getEncodedPassword(password) : password}`,
        })
    }

    login(host, username, password, encodePassword = true) {
        // Perform call
        const tempConfig = {
            host : host,
            user : username,
            password : `enc:${encodePassword ? this.getEncodedPassword(password) : password}`,
            version : "1.9.0"
        }
        return perform_api_call( buildUrl(tempConfig, "ping") )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    getEncodedPassword(password) {
        let encoded = ""
        for (var i=0; i<password.length; i++) {
            let hex = password.charCodeAt(i).toString(16);
            encoded += (hex).slice(-4);
        }
        return encoded
    }
    
    getArtists() {
        return perform_api_call( buildUrl(this.config, "getArtists") )
            .then(result => {
                return result["artists"]["index"]
            })
    }

    getArtist(id) {
        return perform_api_call( buildUrl(this.config, "getArtist", {id:id}) )
            .then(result => {
                return result["artist"]
            })
    }

    getAlbum(id) {
        return perform_api_call( buildUrl(this.config, "getAlbum", {id:id}) )
            .then(result => {
                return result["album"]
            })
    }

    getAlbumList2(type, extras, offset=0, size=24) {
        return perform_api_call( buildUrl(this.config, "getAlbumList2", {type, size, offset, ...extras}) )
            .then(result => {
                return result["albumList2"]["album"] || []
            })
    }

    getPlaylists() {
        return perform_api_call( buildUrl(this.config, "getPlaylists") )
            .then(result => {
                return result["playlists"]["playlist"] || []
            })
    }

    getPlaylistById(id) {
        return perform_api_call( buildUrl(this.config, "getPlaylist", {id:id}) )
            .then(result => {
                return result["playlist"]
            })
    }

    getCoverArtUrl(id) {
        return buildUrl(this.config, "getCoverArt", {id:id})
    }

    getStreamUrl(id) {
        return buildUrl(this.config, "stream", {id:id})
    }

    getDownloadUrl(id) {
        return buildUrl(this.config, "download", {id:id})
    }

    addSongsToPlaylist(playlistId, songIds) {
        return perform_api_call( buildUrl(this.config, "updatePlaylist", {playlistId:playlistId, songIdToAdd : songIds}) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    removeSongsFromPlaylist(playlistId, songIndexes) {
        return perform_api_call( buildUrl(this.config, "updatePlaylist", {playlistId:playlistId, songIndexToRemove : songIndexes}) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    deletePlaylist(playlistId){
        return perform_api_call( buildUrl(this.config, "deletePlaylist", {id:playlistId}) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    createPlaylist(name){
        return perform_api_call( buildUrl(this.config, "createPlaylist", {name:name}) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    updatePlaylist(id, name, comment, isPublic){
        return perform_api_call( buildUrl(this.config, "updatePlaylist", {playlistId:id, name:name, comment:comment, public:isPublic }) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    search(query) {
        return perform_api_call( buildUrl(this.config, "search3", {query:query, albumCount:24 }) )
            .then(result => {
                return result["searchResult3"]
            })
    }

    getStarred() {
        return perform_api_call( buildUrl(this.config, "getStarred2") )
            .then(result => {
                return result["starred2"]
            })
    }

    unstar(ids) {
        return perform_api_call( buildUrl(this.config, "unstar", {id:ids}) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    star(ids) {
        return perform_api_call( buildUrl(this.config, "star", {id:ids}) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    starAlbums(ids) {
        return perform_api_call( buildUrl(this.config, "star", {albumId:ids}) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    unstarAlbums(ids) {
        return perform_api_call( buildUrl(this.config, "unstar", {albumId:ids}) )
            .then(result => {
                return result["status"] === "ok"
            })
    }

    getSongsByGenre(genre, offset=0, count=500) {
        return perform_api_call( buildUrl(this.config, "getSongsByGenre", {genre, count, offset}) )
            .then(result => {
                return result["songsByGenre"]["song"]
            }) 
    }

    getGenres() {
        return perform_api_call( buildUrl(this.config, "getGenres") )
            .then(result => {
                return result["genres"]["genre"]
            }) 
    }

    scrobble(id, time, submission=false) {
        return perform_api_call( buildUrl(this.config, "scrobble", {id, time, submission}) )
            .then(result => {
                return result["status"] === "ok"
            }) 
    }

}

// Export instance
export default new Subsonic(defaults)