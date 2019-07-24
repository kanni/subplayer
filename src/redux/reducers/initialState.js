export default {
    apiCallsInProgress: 0,
    artists : [],
    playlists : {
        byId : {},
        lastUpdateOperationResult : {}
    },
    songs : {
        queue : [],
        current : null,
        currentIndex : null
    },
    auth : {
        isAuthenticated: false,
        isAuthenticating: true,
        statusText: null
    }
}